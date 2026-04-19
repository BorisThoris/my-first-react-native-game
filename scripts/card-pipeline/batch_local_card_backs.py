#!/usr/bin/env python3
"""
Batch-generate portrait card-back rasters with Stable Diffusion XL (local GPU),
then optionally normalize to exact card-plane pixels (same as CARD_TEXTURE_AI_BRIEF.md).

Requires CUDA + PyTorch (install torch separately — see requirements-local-card-backs.txt).

Example:
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
  pip install -r scripts/card-pipeline/requirements-local-card-backs.txt
  yarn card-backs:local

On Windows, use `py -3 scripts/...` if `python` is not on PATH.
Gated HF models: set HF_TOKEN or run `huggingface-cli login`.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
from pathlib import Path

CARD_PLANE_W = 0.74
CARD_PLANE_H = 1.08
CARD_ASPECT = CARD_PLANE_W / CARD_PLANE_H

GEN_W = 1056
GEN_H = 1536

DEFAULT_NEGATIVE = (
    "text, watermark, signature, logo, typography, letters, numbers, runes as text, "
    "photograph of a person, face, eyes, mouth, hands, flesh, busy clutter, "
    "low quality, blurry, jpeg artifacts, cropped, bent card, perspective photo"
)

# Keep under ~77 CLIP tokens (SDXL text encoders); long prompts are truncated and lose the tail.
BASE_CARD_BACK_PROMPT = (
    "Portrait fantasy card back, memory game, void stone, gold filigree, cyan glints, "
    "symmetrical, dark cathedral mood, soft edge vignette, 10% safe margin, "
    "no text, no faces, flat game texture, orthographic."
)

_METAL_ACCENTS = [
    "warm antique gold metalwork",
    "rose gold and brass trim",
    "cool pale silver filigree",
    "verdigris copper accents",
    "dark iron with brass highlights",
    "electrum and muted platinum",
]

_CENTER_MOTIFS = [
    "centered glowing diamond gem focus",
    "twin serpents mirrored symmetry",
    "cathedral rose roundel centerpiece",
    "arcane labyrinth knot center",
    "small arcane compass star hub",
    "torchlit sconce motifs framing center void",
]


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def default_entries() -> list[dict]:
    out: list[dict] = []
    idx = 0
    for m in _METAL_ACCENTS:
        for c in _CENTER_MOTIFS:
            idx += 1
            extra = f"Variation {idx}: {m}; {c}."
            out.append(
                {
                    "id": f"back-{idx:02d}",
                    "prompt": f"{BASE_CARD_BACK_PROMPT} {extra}",
                    "seed": 9100 + idx,
                }
            )
    return out


def load_manifest(path: Path) -> tuple[str, list[dict]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    neg = data.get("negative_prompt", DEFAULT_NEGATIVE)
    entries = data.get("entries")
    if not entries:
        raise SystemExit(f"Manifest {path} must contain a non-empty 'entries' array.")
    return neg, entries


def run_normalize(repo: Path, raw_png: Path, out_png: Path, long_edge: int) -> None:
    ps1 = repo / "scripts" / "card-pipeline" / "normalize-card-texture.ps1"
    cmd = [
        "powershell",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        str(ps1),
        "-InputPath",
        str(raw_png),
        "-OutputPath",
        str(out_png),
        "-LongEdge",
        str(long_edge),
    ]
    subprocess.run(cmd, check=True, cwd=str(repo))


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Batch SDXL card backs + optional normalize.")
    p.add_argument(
        "--manifest",
        type=Path,
        help="JSON manifest with negative_prompt + entries[{id,prompt,seed?}]. "
        "If omitted, uses built-in 36-entry theme grid.",
    )
    p.add_argument(
        "--model",
        default="stabilityai/stable-diffusion-xl-base-1.0",
        help="Hugging Face model id for diffusers SDXL base.",
    )
    p.add_argument("--out-raw", type=Path, default=None, help="Raw PNG folder (default: tmp/card-backs-raw).")
    p.add_argument(
        "--out-final",
        type=Path,
        default=None,
        help="Normalized PNG folder (default: tmp/card-backs-normalized).",
    )
    p.add_argument("--long-edge", type=int, default=2048, help="Passed to normalize-card-texture.ps1.")
    p.add_argument("--steps", type=int, default=32, help="SDXL inference steps.")
    p.add_argument("--guidance", type=float, default=7.0, help="Classifier-free guidance scale.")
    p.add_argument("--skip-normalize", action="store_true", help="Only write raw SDXL outputs.")
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned outputs without importing torch/diffusers.",
    )
    return p.parse_args()


def main() -> None:
    args = parse_args()
    root = repo_root()

    if args.manifest:
        negative_prompt, entries = load_manifest(args.manifest.resolve())
    else:
        negative_prompt = DEFAULT_NEGATIVE
        entries = default_entries()

    raw_dir = args.out_raw or (root / "tmp" / "card-backs-raw")
    final_dir = args.out_final or (root / "tmp" / "card-backs-normalized")
    raw_dir = raw_dir.resolve()
    final_dir = final_dir.resolve()

    raw_dir.mkdir(parents=True, exist_ok=True)
    if not args.skip_normalize:
        final_dir.mkdir(parents=True, exist_ok=True)

    print(f"Entries: {len(entries)}")
    print(f"Raw dir: {raw_dir}")
    if not args.skip_normalize:
        print(f"Normalized dir: {final_dir} ({args.long_edge}px height)")
    print(f"Gen size: {GEN_W}x{GEN_H} (~aspect {GEN_W / GEN_H:.4f}, target {CARD_ASPECT:.6f})")

    if args.dry_run:
        for e in entries[:3]:
            print("  sample:", e["id"], e.get("seed", "?"))
        print("  ... dry-run OK")
        return

    try:
        import torch
        from diffusers import StableDiffusionXLPipeline
    except ImportError as exc:
        raise SystemExit(
            "Missing dependencies. Install PyTorch (CUDA), then:\n"
            "  pip install -r scripts/card-pipeline/requirements-local-card-backs.txt\n"
            f"Original error: {exc}"
        ) from exc

    if not torch.cuda.is_available():
        raise SystemExit("CUDA is not available. This script expects a CUDA GPU (e.g. RTX 3090).")

    dtype = torch.float16
    load_kw: dict = {"torch_dtype": dtype, "variant": "fp16"}
    hf_tok = os.environ.get("HF_TOKEN")
    if hf_tok:
        load_kw["token"] = hf_tok
    pipe = StableDiffusionXLPipeline.from_pretrained(args.model, **load_kw)
    pipe.vae.enable_slicing()
    pipe.to("cuda")

    generator = torch.Generator(device="cuda")

    for i, entry in enumerate(entries):
        rid = entry["id"]
        prompt = entry["prompt"]
        seed = int(entry["seed"]) if entry.get("seed") is not None else 9100 + i

        raw_path = raw_dir / f"{rid}.png"

        generator.manual_seed(seed)
        result = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=GEN_W,
            height=GEN_H,
            num_inference_steps=args.steps,
            guidance_scale=args.guidance,
            generator=generator,
        )
        image = result.images[0]
        image.save(raw_path)
        print(f"[{i + 1}/{len(entries)}] saved {raw_path} (seed={seed})")

        if not args.skip_normalize:
            out_path = final_dir / f"{rid}.png"
            run_normalize(root, raw_path, out_path, args.long_edge)

    print("Done.")
    if not args.skip_normalize:
        print(f"Copy chosen PNGs from:\n  {final_dir}\ninto e.g. src/renderer/assets/textures/cards/ when satisfied.")


if __name__ == "__main__":
    main()
