#Requires -Version 5.1
<#
.SYNOPSIS
  One-shot: venv -> install ACE-Step -> procedural reference stubs (Windows).

.DESCRIPTION
  Runs setup-audio-env.ps1, install-acestep.ps1, then yarn audio:prep-ace-app.
  Does not download Hugging Face checkpoints — follow printed next steps.

.EXAMPLE
  cd <repo-root>
  .\scripts\audio-pipeline\full-audio-setup.ps1
#>
$ErrorActionPreference = "Stop"

$here = $PSScriptRoot
$repoRoot = (Resolve-Path (Join-Path $here "..\..")).Path

Write-Host "=== full-audio-setup: venv ===" -ForegroundColor Cyan
& (Join-Path $here "setup-audio-env.ps1")

Write-Host ""
Write-Host "=== full-audio-setup: PyTorch + ACE-Step clone (large download) ===" -ForegroundColor Cyan
& (Join-Path $here "install-acestep.ps1")

Write-Host ""
Write-Host "=== full-audio-setup: placeholders + reference-audio stubs ===" -ForegroundColor Cyan
Push-Location $repoRoot
try {
    yarn audio:prep-ace-app
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "=== Next steps (manual) ===" -ForegroundColor Green
Write-Host "- Download ACE-Step checkpoints per upstream INSTALL.md (HF_TOKEN / huggingface-cli / acestep-download / first Gradio run)."
Write-Host "- Load scripts/audio-pipeline/environment.audio.local.env if you use gated models."
Write-Host "- Run: yarn audio:ace-step:app:dry"
Write-Host "- Then: yarn audio:ace-step:app"
Write-Host ""
