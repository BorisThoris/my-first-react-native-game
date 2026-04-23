#Requires -Version 5.1
<#
.SYNOPSIS
  Installs CUDA PyTorch + editable ACE-Step 1.5 into .venv-audio (Windows).

.DESCRIPTION
  Large download (models separate). Requires git, Python venv from setup-audio-env.ps1, and optional HF_TOKEN for gated weights.

.EXAMPLE
  cd <repo-root>
  .\scripts\audio-pipeline\install-acestep.ps1
#>
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$venvPip = Join-Path $repoRoot ".venv-audio\Scripts\pip.exe"
$venvPy = Join-Path $repoRoot ".venv-audio\Scripts\python.exe"
$cloneDir = Join-Path $repoRoot "third_party\ACE-Step-1.5"
$upstream = "https://github.com/ace-step/ACE-Step-1.5.git"

if (-not (Test-Path $venvPip)) {
    Write-Error "Missing $venvPip - run .\scripts\audio-pipeline\setup-audio-env.ps1 first."
    exit 1
}

Write-Host "Installing PyTorch (CUDA 12.8 index) into .venv-audio ..."
& $venvPip install --upgrade pip
& $venvPip install torch torchvision torchaudio --index-url "https://download.pytorch.org/whl/cu128"

if (-not (Test-Path $cloneDir)) {
    Write-Host "Cloning ACE-Step 1.5 into third_party/ACE-Step-1.5 ..."
    New-Item -ItemType Directory -Force -Path (Split-Path $cloneDir) | Out-Null
    git clone --depth 1 $upstream $cloneDir
} else {
    Write-Host "Using existing clone: $cloneDir"
}

$nanoVllm = Join-Path $cloneDir "acestep\third_parts\nano-vllm"
if (-not (Test-Path $nanoVllm)) {
    Write-Error "Missing nano-vllm at $nanoVllm - clone may be incomplete."
    exit 1
}
Write-Host "pip install -e (nano-vllm, local path dependency) ..."
& $venvPip install -e $nanoVllm

Write-Host "pip install -e (editable ACE-Step root, CUDA wheel index for pinned torch) ..."
& $venvPip install -e $cloneDir --extra-index-url "https://download.pytorch.org/whl/cu128"

Write-Host ""
Write-Host "Verifying import ..."
$verifyPy = Join-Path ([System.IO.Path]::GetTempPath()) ("acestep-verify-" + [Guid]::NewGuid().ToString() + ".py")
try {
    @"
import acestep
import torch
print("acestep:", acestep.__file__)
print("cuda:", torch.cuda.is_available())
"@ | Set-Content -LiteralPath $verifyPy -Encoding utf8
    & $venvPy $verifyPy
} finally {
    if (Test-Path -LiteralPath $verifyPy) {
        Remove-Item -LiteralPath $verifyPy -Force -ErrorAction SilentlyContinue
    }
}
Write-Host ''
Write-Host 'Next: download checkpoints - see ACE-Step INSTALL.md (acestep-download or Gradio first run).'
Write-Host 'Then: yarn audio:prep-ace-app ; yarn audio:ace-step:app'
