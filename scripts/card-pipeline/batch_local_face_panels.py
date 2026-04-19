#!/usr/bin/env python3
"""
Batch-generate tarot-style face *illustration panel* rasters only (central mat — see
cardIllustrationRect.ts). Same SDXL stack as batch_local_card_backs.py; no full-card normalize.

Panel pixels match STATIC_CARD_TEXTURE_* @ 1024 height:
  cw = round(1024 * 0.74/1.08), panel w = cw * (1 - left - right), panel h = ch * (1 - top - bottom)
→ 520x592 (multiples of 8, ~matches computeIllustrationPixelRect).

Example:
  pip install -r scripts/card-pipeline/requirements-local-card-backs.txt
  yarn face-panels:local:dry
  yarn face-panels:local
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

# Mirror src/renderer/components/tileTextures.ts STATIC_CARD_TEXTURE_* + cardIllustrationRect.ts
_STATIC_H = 1024
_CARD_PLANE_W = 0.74
_CARD_PLANE_H = 1.08
_CW = max(2, round(_STATIC_H * (_CARD_PLANE_W / _CARD_PLANE_H)))
_INSET_L = 0.13
_INSET_R = 0.13
_INSET_T = 0.11
_INSET_B = 0.31
_PANEL_W = round(_CW * (1 - _INSET_L - _INSET_R))  # 518.74 → round to 8
_PANEL_H = round(_STATIC_H * (1 - _INSET_T - _INSET_B))  # 593.92

# SDXL-friendly multiples of 8 (close to true rect)
GEN_W = 520
GEN_H = 592

DEFAULT_NEGATIVE = (
    "text, watermark, signature, logo, typography, letters, numbers, words, runes as text, "
    "tarot card on table, printed card, playing card, card border, deck edge, "
    "picture frame, ornate frame, polaroid, product photo, UI, letterboxing, white matte, "
    "photo of person, face, eyes, mouth, hands, "
    "low quality, blurry, jpeg artifacts"
)

# Motif is placed first in each prompt so CLIP's 77-token cap does not drop the variant (see default_entries).
BASE_PANEL_PROMPT = (
    "Tarot-inspired dark fantasy painting, full bleed, relic or crystal focal, arcane mist, "
    "gold and cyan on void stone, vertical, soft vignette. "
    "Not a card photo; no frame, tabletop, text, letters, faces."
)

# 40 short motif tails (keep total prompt under CLIP token limits)
_MOTIFS = [
    "glowing crystal obelisk",
    "crowned moon sigil",
    "crossed blades and ember",
    "golden chalice flame",
    "tower struck by violet arc",
    "serpent ouroboros ring",
    "hourglass sand spiral",
    "anchor in deep blue mist",
    "broken mask and stars",
    "lantern in fog archway",
    "winged scarab jewel",
    "thorn rose under glass",
    "balance scales glow",
    "horn of plenty arcane",
    "spiral shell relic",
    "sun disk behind clouds",
    "eclipse ring corona",
    "mirror portal shard",
    "locked grimoire clasp",
    "compass rose storm",
    "torch cavern entrance",
    "well of stars depth",
    "bridge over abyss mist",
    "stag skull crown",
    "kraken tentacle orb",
    "phoenix ash spiral",
    "ice crown fracture",
    "iron heart furnace",
    "silver thread loom",
    "bone dice tower",
    "vine throne roots",
    "cathedral window light",
    "ship in bottle nebula",
    "hermit lantern path",
    "lovers ribbon binding",
    "chariot wheel sparks",
    "justice blade upright",
    "star fountain upward",
    "moon moth luna",
    "world ring atlas",
]


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def default_entries() -> list[dict]:
    out: list[dict] = []
    for i, m in enumerate(_MOTIFS):
        idx = i + 1
        out.append(
            {
                "id": f"face-panel-{idx:02d}",
                "prompt": f"{m}. {BASE_PANEL_PROMPT}",
                "seed": 12000 + idx,
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


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Batch SDXL face illustration panels (mat only).")
    p.add_argument("--manifest", type=Path, help="JSON with negative_prompt + entries[{id,prompt,seed?}].")
    p.add_argument(
        "--model",
        default="stabilityai/stable-diffusion-xl-base-1.0",
        help="Hugging Face SDXL model id.",
    )
    p.add_argument("--out", type=Path, default=None, help="Output folder (default: tmp/face-panels).")
    p.add_argument("--steps", type=int, default=28, help="Inference steps.")
    p.add_argument("--guidance", type=float, default=7.0, help="CFG scale.")
    p.add_argument("--dry-run", action="store_true", help="Print plan only.")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    root = repo_root()

    if args.manifest:
        negative_prompt, entries = load_manifest(args.manifest.resolve())
    else:
        negative_prompt = DEFAULT_NEGATIVE
        entries = default_entries()

    out_dir = (args.out or (root / "tmp" / "face-panels")).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    ideal_w = _CW * (1 - _INSET_L - _INSET_R)
    ideal_h = _STATIC_H * (1 - _INSET_T - _INSET_B)
    print(f"Entries: {len(entries)}")
    print(f"Out dir: {out_dir}")
    print(f"Ideal panel (from insets): ~{ideal_w:.1f}x{ideal_h:.1f}px")
    print(f"Gen size: {GEN_W}x{GEN_H} (aspect {GEN_W / GEN_H:.4f})")

    manifest_path = root / "scripts" / "card-pipeline" / "generated-face-panels-last-run.json"
    if args.dry_run:
        for e in entries[:3]:
            print("  sample:", e["id"], e.get("seed"))
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
        raise SystemExit("CUDA is not available.")

    dtype = torch.float16
    load_kw: dict = {"torch_dtype": dtype, "variant": "fp16"}
    hf_tok = os.environ.get("HF_TOKEN")
    if hf_tok:
        load_kw["token"] = hf_tok
    pipe = StableDiffusionXLPipeline.from_pretrained(args.model, **load_kw)
    pipe.vae.enable_slicing()
    pipe.to("cuda")

    generator = torch.Generator(device="cuda")
    written: list[str] = []

    for i, entry in enumerate(entries):
        rid = entry["id"]
        prompt = entry["prompt"]
        seed = int(entry["seed"]) if entry.get("seed") is not None else 12000 + i
        out_path = out_dir / f"{rid}.png"

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
        image.save(out_path)
        written.append(f"{rid}.png")
        print(f"[{i + 1}/{len(entries)}] saved {out_path} (seed={seed})")

    try:
        out_rel = str(out_dir.relative_to(root))
    except ValueError:
        out_rel = str(out_dir)
    manifest = {
        "generatedAt": __import__("datetime").datetime.now().astimezone().isoformat(),
        "outDir": out_rel,
        "genPixels": {"width": GEN_W, "height": GEN_H},
        "count": len(written),
        "files": sorted(written),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote manifest {manifest_path}")
    print("Copy PNGs to src/renderer/assets/cards/illustrations/ and wire cardIllustrationRegistry.ts.")


if __name__ == "__main__":
    main()
