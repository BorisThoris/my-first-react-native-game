<#
.SYNOPSIS
  Resample a card raster onto exact card-plane pixels (0.74 : 1.08) using contain fit (no crop; letterbox).
.DESCRIPTION
  Use after `yarn imagegen` (e.g. 1024x1536 from GPT Image). Pads with dark bars to match
  `CARD_PLANE_WIDTH` / `CARD_PLANE_HEIGHT` — aligns with static card raster sizing in `tileTextures.ts`.
.PARAMETER LongEdge
  Output height in pixels (width is derived). Default 2048.
#>
param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [int]$LongEdge = 2048
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Keep in sync with src/renderer/components/tileShatter.ts and scripts/card-pipeline/cardTextureConstants.mjs
$CardW = 0.74
$CardH = 1.08
$aspect = $CardW / $CardH

$outH = $LongEdge
$outW = [Math]::Max(2, [int][Math]::Round($outH * $aspect))

Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path $InputPath).Path
$outFull = [System.IO.Path]::GetFullPath($OutputPath)
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
try {
    $dst = New-Object System.Drawing.Bitmap($outW, $outH)
    $g = [System.Drawing.Graphics]::FromImage($dst)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $sw = [single]$src.Width
    $sh = [single]$src.Height
    $cw = [single]$outW
    $ch = [single]$outH
    # contain: full source visible, letterbox to exact output aspect (#0a0e18 matches tileTextures STATIC_CARD_LETTERBOX)
    $scale = [Math]::Min($cw / $sw, $ch / $sh)
    $dw = $sw * $scale
    $dh = $sh * $scale
    $ox = ($cw - $dw) / 2.0
    $oy = ($ch - $dh) / 2.0

    $g.Clear([System.Drawing.Color]::FromArgb(255, 10, 14, 24))
    $g.DrawImage($src, $ox, $oy, $dw, $dh)
    $g.Dispose()

    $dir = Split-Path -Parent $OutputPath
    if ($dir) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

    # Saving over the same path GDI+ is reading from fails — write temp then replace.
    $sameFile = [string]::Equals($srcPath, $outFull, [System.StringComparison]::OrdinalIgnoreCase)
    $writePath = if ($sameFile) { "${outFull}.tmp-normalize.png" } else { $outFull }
    $dst.Save($writePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dst.Dispose()
    $dst = $null

    if ($sameFile) {
        $src.Dispose()
        $src = $null
        Remove-Item -LiteralPath $outFull -Force
        Rename-Item -LiteralPath $writePath -NewName ([System.IO.Path]::GetFileName($outFull))
    }

    Write-Output ("Wrote " + (Resolve-Path $OutputPath) + " (${outW}x${outH})")
}
finally {
    if ($null -ne $src) { $src.Dispose() }
    if ($null -ne $dst) { $dst.Dispose() }
}
