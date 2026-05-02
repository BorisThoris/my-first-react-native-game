#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

repo_root = Path(__file__).resolve().parents[2]
script = repo_root.parent / "cross-repo-libs" / "packages" / "ai-image" / "scripts" / "batch_local_card_backs.py"

raise SystemExit(
    subprocess.run(
        [sys.executable, str(script), "--repo-root", str(repo_root), *sys.argv[1:]],
        cwd=repo_root,
        check=False,
    ).returncode
)
