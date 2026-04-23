#Requires -Version 5.1
<#
.SYNOPSIS
  Creates .venv-audio at the repo root for ACE-Step 1.5 + CUDA PyTorch (Windows).

.DESCRIPTION
  Does not install PyTorch or ACE-Step (versions change upstream). After this script,
  follow the printed steps using the official ACE-Step 1.5 and PyTorch install docs.

.EXAMPLE
  cd <repo-root>
  .\scripts\audio-pipeline\setup-audio-env.ps1
#>
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$venvPath = Join-Path $repoRoot ".venv-audio"

function Find-Python311Plus {
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) {
        foreach ($tag in @('-3.12', '-3.11', '-3')) {
            try {
                $ver = & py $tag -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
                if ($LASTEXITCODE -eq 0 -and [version]$ver -ge [version]'3.11') {
                    return @{ PyArgs = @($tag); Version = $ver }
                }
            } catch {
                continue
            }
        }
    }
    foreach ($exe in @('python3', 'python')) {
        $cmd = Get-Command $exe -ErrorAction SilentlyContinue
        if (-not $cmd) { continue }
        try {
            $ver = & $exe -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
            if ($LASTEXITCODE -eq 0 -and [version]$ver -ge [version]'3.11') {
                return @{ PyArgs = @(); Exe = $exe; Version = $ver }
            }
        } catch {
            continue
        }
    }
    return $null
}

Write-Host "Repo root: $repoRoot"
Write-Host ""

if (Test-Path $venvPath) {
    Write-Host "Venv already exists: $venvPath"
} else {
    $py = Find-Python311Plus
    if (-not $py) {
        Write-Error "Need Python 3.11+ on PATH (py launcher or python). Install from python.org, then re-run."
        exit 1
    }

    if ($py.Exe) {
        Write-Host "Using $($py.Exe) (Python $($py.Version))"
        & $py.Exe -m venv $venvPath
    } else {
        Write-Host "Using py $($py.PyArgs -join ' ') (Python $($py.Version))"
        & py @($py.PyArgs) -m venv $venvPath
    }
    Write-Host "Created venv: $venvPath"
}

$pyExe = Join-Path $venvPath "Scripts\python.exe"
if (-not (Test-Path $pyExe)) {
    Write-Error "Missing $pyExe"
    exit 1
}

& $pyExe -m pip install --upgrade pip
Write-Host ""
Write-Host "=== Next steps (run with venv activated) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1) Activate the venv:"
Write-Host "     .\.venv-audio\Scripts\Activate.ps1"
Write-Host ""
Write-Host "2) Install PyTorch with CUDA 12.x for Windows (pick the wheel that matches ACE-Step 1.5):"
Write-Host "     https://pytorch.org/get-started/locally/"
Write-Host "   Example (verify version strings against PyTorch site):"
Write-Host "     pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128"
Write-Host ""
Write-Host "3) Install ACE-Step 1.5 in this same venv (follow upstream README):"
Write-Host "     https://github.com/ace-step/ACE-Step-1.5"
Write-Host "   Typical pattern: clone the repo, then from the clone directory:"
Write-Host "     pip install -e ."
Write-Host ""
Write-Host "4) Download checkpoints (upstream acestep-download / Gradio first-run - see ACE-Step docs)."
Write-Host ""
Write-Host "5) Optional env file - copy and edit:"
Write-Host "     Copy-Item scripts\audio-pipeline\environment.audio.example.env scripts\audio-pipeline\environment.audio.local.env"
Write-Host "   Load before batch runs (see comments in the example file)."
Write-Host ""
Write-Host "6) Validate:"
Write-Host "     yarn audio:ace-step:batch:dry"
Write-Host "     yarn audio:ace-step:batch"
Write-Host ""
