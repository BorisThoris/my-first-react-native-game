#!/usr/bin/env python3
"""
Batch ACE-Step 1.5 generation from a JSON jobs file (reference / cover / text2music).

Requires a separate Python 3.11+ venv with ACE-Step 1.5 installed (`import acestep`).
See scripts/audio-pipeline/README.md.

Example:
  py -3.11 scripts/audio-pipeline/batch_ace_step.py --dry-run --jobs scripts/audio-pipeline/jobs.example.json
  py -3.11 scripts/audio-pipeline/batch_ace_step.py --jobs scripts/audio-pipeline/jobs.example.json
"""

from __future__ import annotations

import argparse
import copy
import json
import os
import subprocess
import sys
import zlib
from dataclasses import fields
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

AUDIO_PATH_KEYS = frozenset({"reference_audio", "src_audio"})


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def load_jobs(path: Path) -> tuple[list[dict[str, Any]], Path]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    jobs_dir = path.resolve().parent
    if isinstance(raw, list):
        return raw, jobs_dir
    if isinstance(raw, dict) and isinstance(raw.get("jobs"), list):
        return raw["jobs"], jobs_dir
    raise SystemExit("Jobs file must be a JSON array or an object with a top-level \"jobs\" array.")


def resolve_media_path(repo: Path, jobs_dir: Path, rel_or_abs: str) -> str:
    """Resolve a path relative to the jobs file directory, then the repo root."""
    p = Path(rel_or_abs)
    if p.is_absolute():
        return str(p.resolve())
    cand = (jobs_dir / p).resolve()
    if cand.is_file():
        return str(cand)
    cand2 = (repo / p).resolve()
    if cand2.is_file():
        return str(cand2)
    # Return primary candidate string for error messages if missing.
    return str(cand)


def validate_job_keys(entry: dict[str, Any], allowed: frozenset[str]) -> None:
    extra = set(entry.keys()) - allowed - {"id"}
    if extra:
        raise SystemExit(f"Unknown job keys {sorted(extra)} — see ACE-Step GenerationParams (scripts/audio-pipeline/README.md).")


def acestep_project_root() -> Path:
    """Same layout as acestep.acestep_v15_pipeline: parent of the `acestep` package."""
    try:
        import acestep  # noqa: PLC0415
    except ImportError as exc:
        raise SystemExit(
            "Could not import `acestep`. Install ACE-Step 1.5 in a Python 3.11+ venv (see scripts/audio-pipeline/README.md).\n"
            f"Original error: {exc}"
        ) from exc

    return Path(acestep.__file__).resolve().parent.parent


def resolve_weights_project_root() -> Path:
    """
    Folder that contains DiT weights (e.g. `acestep-v15-turbo/`) and LM weights.

    Set **ACESTEP_PROJECT_ROOT** to a HuggingFace-style checkout (such as `.../Repos/Ace-Step1.5`)
    when weights live next to the game repo instead of under the pip-installed package tree.
    """
    env = os.environ.get("ACESTEP_PROJECT_ROOT", "").strip()
    if env:
        p = Path(env).expanduser().resolve()
        if not p.is_dir():
            raise SystemExit(f"ACESTEP_PROJECT_ROOT is not a directory: {p}")
        return p
    return acestep_project_root()


def resolve_checkpoint_dir(project_root: Path) -> str:
    """LM + embedding assets: `project_root/checkpoints` if present, else flat `project_root` (HF layout)."""
    env = os.environ.get("ACESTEP_CHECKPOINTS_DIR", "").strip()
    if env:
        p = Path(env).expanduser().resolve()
        if not p.is_dir():
            raise SystemExit(f"ACESTEP_CHECKPOINTS_DIR is not a directory: {p}")
        return str(p)
    nested = project_root / "checkpoints"
    if nested.is_dir():
        return str(nested.resolve())
    return str(project_root.resolve())


def default_dit_config_name(project_root: Path) -> str | None:
    for name in ("acestep-v15-turbo", "acestep-v15"):
        if (project_root / name).is_dir():
            return name
    return None


def default_lm_dir_name(checkpoint_dir: Path) -> str | None:
    try:
        for p in sorted(checkpoint_dir.iterdir()):
            if p.is_dir() and "5hz" in p.name.lower():
                return p.name
    except FileNotFoundError:
        return None
    return None


def ensure_hf_flat_weights_linked_into_checkpoints(weights_root: Path) -> None:
    """
    HuggingFace `Ace-Step1.5` snapshots often place `acestep-v15-turbo/` at the **repo root**, while
    `initialize_service` expects `weights_root/checkpoints/acestep-v15-turbo/`. If we see the flat
    layout, create `checkpoints/` and directory junctions (Windows) or symlinks (POSIX) — idempotent.
    """
    ck = weights_root / "checkpoints"
    turbo_ck = ck / "acestep-v15-turbo"
    turbo_flat = weights_root / "acestep-v15-turbo"
    if turbo_ck.is_dir() or not turbo_flat.is_dir():
        return

    ck.mkdir(parents=True, exist_ok=True)
    for name in (
        "acestep-v15-turbo",
        "acestep-5Hz-lm-1.7B",
        "Qwen3-Embedding-0.6B",
        "vae",
    ):
        src = (weights_root / name).resolve()
        dst = ck / name
        if not src.is_dir() or dst.exists():
            continue
        if sys.platform == "win32":
            completed = subprocess.run(
                ["cmd", "/c", "mklink", "/J", str(dst), str(src)],
                capture_output=True,
                text=True,
                check=False,
            )
            if completed.returncode != 0:
                raise SystemExit(
                    "ACE-Step expects models under checkpoints\\ but this repo has a flat HF layout.\n"
                    f"Could not junction {dst} -> {src}:\n{completed.stderr or completed.stdout}\n"
                    "Create the link manually (Developer Mode or elevated shell) or move folders; "
                    "see scripts/audio-pipeline/README.md."
                )
        else:
            dst.symlink_to(src, target_is_directory=True)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Batch ACE-Step 1.5 renders from JSON jobs.")
    p.add_argument(
        "--jobs",
        type=Path,
        required=True,
        help="JSON file: array of jobs or { jobs: [...] }. Each entry needs \"id\"; other keys map to GenerationParams.",
    )
    p.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Output root (default: <repo>/tmp/audio/ace-step).",
    )
    p.add_argument("--dry-run", action="store_true", help="Validate JSON and paths; do not load torch/acestep.")
    p.add_argument(
        "--device",
        type=str,
        default=os.environ.get("ACESTEP_DEVICE", "auto"),
        help="cuda | cpu | auto (default: auto or ACESTEP_DEVICE).",
    )
    p.add_argument(
        "--config-path",
        type=str,
        default=os.environ.get("ACESTEP_CONFIG_PATH"),
        help="DiT config folder id (default: ACESTEP_CONFIG_PATH or auto from installed models).",
    )
    p.add_argument(
        "--lm-model-path",
        type=str,
        default=os.environ.get("ACESTEP_LM_MODEL_PATH"),
        help="5Hz LM folder name under checkpoints (default: ACESTEP_LM_MODEL_PATH or first available).",
    )
    p.add_argument(
        "--backend",
        type=str,
        default=os.environ.get("ACESTEP_LM_BACKEND") or None,
        help='LM backend: vllm | pt | mlx (default: ACESTEP_LM_BACKEND or gpu auto-resolve). Use "" for auto.',
    )
    p.add_argument(
        "--no-init-llm",
        action="store_true",
        help="Skip 5Hz LM init (only tasks that do not need LM; most text2music needs LM).",
    )
    p.add_argument(
        "--offload-to-cpu",
        action="store_true",
        help="Pass offload_to_cpu=True to ACE-Step handlers (helps low VRAM).",
    )
    p.add_argument(
        "--offload-dit-to-cpu",
        action="store_true",
        help="Pass offload_dit_to_cpu=True after diffusion.",
    )
    p.add_argument(
        "--download-source",
        type=str,
        default=None,
        choices=("huggingface", "modelscope", "auto"),
        help="Preferred checkpoint download source (passed to initialize_service / ensure_lm_model).",
    )
    p.add_argument(
        "--audio-format",
        type=str,
        default="flac",
        help="GenerationConfig.audio_format (flac, wav, mp3, ...).",
    )
    p.add_argument(
        "--variants",
        "-n",
        type=int,
        default=1,
        metavar="N",
        help="Per job, render N times with distinct seeds into v01..vN when N>1 (default: 1).",
    )
    p.add_argument(
        "--quality",
        choices=("balanced", "high", "max"),
        default=None,
        help="Optional quality preset (inference_steps; high/max may enable output normalization if supported). "
        "Omit to use no overlay. Job fields still override. See INFERENCE.md (turbo: ~8/14/18 steps).",
    )
    p.add_argument(
        "--inference-steps",
        type=int,
        default=None,
        metavar="N",
        help="Denoising steps; overrides --quality for this field. Must be >= 1 when set.",
    )
    return p.parse_args()


def _build_quality_overlay(
    quality: str | None, inference_steps_cli: int | None, allowed_keys: frozenset[str]
) -> dict[str, Any]:
    """
    Preset/CLI defaults merged under per-job params (job JSON wins on conflict).
    Only keys in allowed_keys (GenerationParams) are included.
    """
    raw: dict[str, Any] = {}
    if quality == "balanced":
        raw["inference_steps"] = 8
    elif quality == "high":
        raw["inference_steps"] = 14
        if "enable_normalization" in allowed_keys:
            raw["enable_normalization"] = True
    elif quality == "max":
        raw["inference_steps"] = 18
        if "enable_normalization" in allowed_keys:
            raw["enable_normalization"] = True
    if inference_steps_cli is not None:
        raw["inference_steps"] = int(inference_steps_cli)
    return {k: v for k, v in raw.items() if k in allowed_keys}


def _print_quality_overlay_summary(overlay: dict[str, Any], quality: str | None, inf_cli: int | None) -> None:
    if not overlay:
        return
    st = overlay.get("inference_steps")
    if st is not None:
        if inf_cli is not None:
            line_src = "from --inference-steps"
        elif quality:
            line_src = f"from --quality {quality!r}"
        else:
            line_src = "inference"
        print(f"Quality overlay: inference_steps={st} ({line_src}; job JSON overrides if set).")
    for k, v in sorted((k, v) for k, v in overlay.items() if k != "inference_steps"):
        print(f"  + {k}: {v!r}")


def _variant_seeds(
    base_param: dict[str, Any],
    k: int,
    n_variants: int,
    job_id: str,
) -> tuple[dict[str, Any], bool, int | list[int] | None]:
    """
    Return (param_dict, use_random_seed, seeds) for GenerationConfig.
    k is 0-based variant index. When n_variants is 1, behavior matches a single unmodified job.
    """
    d = copy.deepcopy(base_param)
    if n_variants <= 1:
        raw = d.get("seed")
        if raw is None or int(raw) < 0:
            return d, True, None
        return d, False, int(raw)

    raw = d.get("seed")
    fixed = raw is not None and int(raw) >= 0
    if fixed:
        d["seed"] = int(raw) + k * 7919
        return d, False, int(d["seed"])

    if k == 0:
        return d, True, None

    crc = zlib.crc32(job_id.encode("utf-8")) & 0xFFFFFFFF
    sk = 1 + (crc % 1_000_000_000) + (k * 7_910_003)
    d["seed"] = sk
    return d, False, sk


def main() -> None:
    args = parse_args()
    if args.variants < 1:
        raise SystemExit("--variants / -n must be >= 1")
    if args.inference_steps is not None and int(args.inference_steps) < 1:
        raise SystemExit("--inference-steps must be >= 1 when set")
    root = repo_root()
    jobs_path = args.jobs.resolve()
    entries, jobs_dir = load_jobs(jobs_path)

    out_root = args.out_dir or (root / "tmp" / "audio" / "ace-step")
    out_root = out_root.resolve()
    manifest_path = out_root / "generated-ace-step-last-run.json"

    if args.dry_run:
        print(f"Jobs file: {jobs_path}")
        print(f"Jobs dir (relative base): {jobs_dir}")
        print(f"Output root: {out_root}")
        print(f"Manifest: {manifest_path}")
        print(f"Entries: {len(entries)}")
        if args.variants > 1:
            print(
                f"Each job will write to subfolders v01..v{args.variants:02d} under <output>/<jobId>/ (variants={args.variants})."
            )
        for i, e in enumerate(entries[:5]):
            print(f"  [{i}] id={e.get('id')!r} task_type={e.get('task_type')!r}")
        if len(entries) > 5:
            print("  ...")
        try:
            from acestep.inference import GenerationParams  # noqa: PLC0415

            allowed_keys = frozenset(f.name for f in fields(GenerationParams))
            for e in entries:
                if isinstance(e, dict):
                    validate_job_keys(e, allowed_keys)
            print("Job keys validated against GenerationParams.")
        except ImportError:
            print("(Install acestep in this interpreter to validate job keys on dry-run.)")
            allowed_keys = frozenset({"inference_steps", "enable_normalization"})
        q_ovl = _build_quality_overlay(args.quality, args.inference_steps, allowed_keys)
        if not q_ovl:
            print("Quality overlay: (none); jobs use only JSON fields and upstream defaults.")
        else:
            _print_quality_overlay_summary(q_ovl, args.quality, args.inference_steps)
        print("dry-run OK (no torch/GPU work).")
        return

    try:
        import torch  # noqa: PLC0415
    except ImportError as exc:
        raise SystemExit(
            "PyTorch is required. Install CUDA PyTorch in the same venv as ACE-Step.\n" f"Original error: {exc}"
        ) from exc

    if not torch.cuda.is_available():
        print("Warning: CUDA not available; ACE-Step may run on CPU/MPS only if upstream supports it.", file=sys.stderr)

    from acestep.gpu_config import get_gpu_config, set_global_gpu_config  # noqa: PLC0415
    from acestep.handler import AceStepHandler  # noqa: PLC0415
    from acestep.inference import GenerationConfig, GenerationParams, generate_music  # noqa: PLC0415
    from acestep.llm_inference import LLMHandler  # noqa: PLC0415

    gpu_config_boot = get_gpu_config()
    set_global_gpu_config(gpu_config_boot)

    allowed_keys = frozenset(f.name for f in fields(GenerationParams))
    quality_overlay = _build_quality_overlay(args.quality, args.inference_steps, allowed_keys)
    _print_quality_overlay_summary(quality_overlay, args.quality, args.inference_steps)

    dit_handler = AceStepHandler()
    llm_handler = LLMHandler()

    project_root = resolve_weights_project_root()
    ensure_hf_flat_weights_linked_into_checkpoints(project_root)
    prefer_source = args.download_source if args.download_source and args.download_source != "auto" else None

    compile_model = os.environ.get("ACESTEP_COMPILE_MODEL", "").strip().lower() in {"1", "true", "yes", "y", "on"}
    use_flash_attention = dit_handler.is_flash_attention_available(args.device)

    config_path = args.config_path
    if not config_path:
        dit_candidate = default_dit_config_name(project_root)
        if dit_candidate:
            config_path = dit_candidate
        else:
            models = dit_handler.get_available_acestep_v15_models()
            if models:
                config_path = "acestep-v15-turbo" if "acestep-v15-turbo" in models else models[0]
            else:
                raise SystemExit(
                    "No ACE-Step v1.5 DiT models found. Download checkpoints (see upstream README), "
                    "set ACESTEP_PROJECT_ROOT to your weights folder (e.g. ../Ace-Step1.5), or pass --config-path."
                )

    init_status, enable_generate = dit_handler.initialize_service(
        project_root=str(project_root),
        config_path=config_path,
        device=args.device,
        use_flash_attention=use_flash_attention,
        compile_model=compile_model,
        offload_to_cpu=args.offload_to_cpu,
        offload_dit_to_cpu=args.offload_dit_to_cpu,
        quantization=None,
        prefer_source=prefer_source,
    )
    if not enable_generate:
        raise SystemExit(f"DiT initialize_service failed:\n{init_status}")

    init_llm = not args.no_init_llm
    lm_model_path: str | None = args.lm_model_path
    backend_raw = (args.backend or "").strip()

    if init_llm:
        from acestep.gpu_config import get_gpu_config, resolve_lm_backend, set_global_gpu_config  # noqa: PLC0415

        gpu_config = get_gpu_config()
        set_global_gpu_config(gpu_config)  # refresh after DiT init in case handlers touched tier state
        checkpoint_dir = resolve_checkpoint_dir(project_root)

        backend = resolve_lm_backend(backend_raw, gpu_config)

        if not lm_model_path:
            lm_flat = default_lm_dir_name(Path(checkpoint_dir))
            if lm_flat:
                lm_model_path = lm_flat
            else:
                models_lm = llm_handler.get_available_5hz_lm_models()
                if not models_lm:
                    raise SystemExit(
                        "No 5Hz LM models found. Download via upstream tools, set ACESTEP_PROJECT_ROOT / "
                        "ACESTEP_CHECKPOINTS_DIR to the folder containing acestep-5Hz-lm-*, or pass --lm-model-path."
                    )
                lm_model_path = models_lm[0]

        try:
            from acestep.model_downloader import ensure_lm_model  # noqa: PLC0415

            dl_ok, dl_msg = ensure_lm_model(
                model_name=lm_model_path,
                checkpoints_dir=checkpoint_dir,
                prefer_source=prefer_source,
            )
            if not dl_ok:
                print(f"Warning: LM ensure_lm_model: {dl_msg}", file=sys.stderr)
        except Exception as e:  # noqa: BLE001
            print(f"Warning: ensure_lm_model failed: {e}", file=sys.stderr)

        lm_status, lm_ok = llm_handler.initialize(
            checkpoint_dir=checkpoint_dir,
            lm_model_path=lm_model_path,
            backend=backend,
            device=args.device,
            offload_to_cpu=args.offload_to_cpu,
            dtype=None,
        )
        if not lm_ok:
            raise SystemExit(f"LLM initialize failed:\n{lm_status}")

    results: list[dict[str, Any]] = []

    n_variants = int(args.variants)

    for entry in entries:
        if not isinstance(entry, dict):
            raise SystemExit("Each job must be a JSON object.")
        jid = entry.get("id")
        if not jid or not isinstance(jid, str):
            raise SystemExit('Each job must include a string "id".')

        validate_job_keys(entry, allowed_keys)
        param_dict = {k: v for k, v in entry.items() if k != "id"}
        param_dict = {**quality_overlay, **param_dict}
        for key in AUDIO_PATH_KEYS:
            if key in param_dict and param_dict[key]:
                param_dict[key] = resolve_media_path(root, jobs_dir, str(param_dict[key]))
                p = Path(param_dict[key])
                if not p.is_file():
                    raise SystemExit(f'Job "{jid}": missing {key} file:\n  {param_dict[key]}')

        job_out = out_root / str(jid)
        job_out.mkdir(parents=True, exist_ok=True)

        for k in range(n_variants):
            v_param, use_rand, seeds_arg = _variant_seeds(param_dict, k, n_variants, jid)
            params = GenerationParams(**v_param)

            gen_config = GenerationConfig(
                batch_size=1,
                allow_lm_batch=False,
                use_random_seed=use_rand,
                seeds=seeds_arg,
                audio_format=args.audio_format,
            )

            if n_variants > 1:
                sub = job_out / f"v{k + 1:02d}"
                sub.mkdir(parents=True, exist_ok=True)
                save_dir = str(sub)
            else:
                save_dir = str(job_out)

            variant_label = None if n_variants == 1 else k + 1
            seed_effective: int | None
            if use_rand and seeds_arg is None:
                seed_effective = None
            elif isinstance(seeds_arg, int):
                seed_effective = seeds_arg
            else:
                raw_s = v_param.get("seed")
                seed_effective = int(raw_s) if raw_s is not None and int(raw_s) >= 0 else None

            try:
                result = generate_music(
                    dit_handler,
                    llm_handler,
                    params,
                    gen_config,
                    save_dir=save_dir,
                )
            except Exception as exc:  # noqa: BLE001
                results.append(
                    {
                        "id": jid,
                        "variant": variant_label,
                        "seed": seed_effective,
                        "success": False,
                        "paths": [],
                        "error": str(exc),
                    }
                )
                continue

            paths_out: list[str] = []
            if result.success:
                for a in result.audios:
                    pth = a.get("path")
                    if pth:
                        paths_out.append(str(pth))
                results.append(
                    {
                        "id": jid,
                        "variant": variant_label,
                        "seed": seed_effective,
                        "success": True,
                        "paths": paths_out,
                        "status_message": result.status_message,
                        "error": None,
                    }
                )
            else:
                results.append(
                    {
                        "id": jid,
                        "variant": variant_label,
                        "seed": seed_effective,
                        "success": False,
                        "paths": paths_out,
                        "error": result.error or result.status_message,
                    }
                )

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "jobsFile": str(jobs_path),
        "outDir": str(out_root),
        "configPath": config_path,
        "lmModelPath": lm_model_path if init_llm else None,
        "variants": n_variants,
        "qualityPreset": args.quality,
        "inferenceStepsCli": args.inference_steps,
        "qualityOverlay": quality_overlay,
        "results": results,
    }
    out_root.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote manifest: {manifest_path}")
    ok_n = sum(1 for r in results if r.get("success"))
    print(f"Done. {ok_n}/{len(results)} renders succeeded (jobs × variants).")


if __name__ == "__main__":
    main()
