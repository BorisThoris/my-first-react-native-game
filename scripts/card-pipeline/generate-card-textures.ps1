param(
    [string]$OutputDir = "src/renderer/assets/textures/cards",
    [string]$SourceBackPath = "src/renderer/assets/textures/cards/reference-back.png",
    [int]$Size = 512
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function Get-Color {
    param([string]$Hex)
    return [System.Drawing.ColorTranslator]::FromHtml($Hex)
}

function New-RoundedRectPath {
    param(
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius
    )

    $diameter = $Radius * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

function New-CardTexture {
    param(
        [string]$Path,
        [string]$TopHex,
        [string]$BottomHex,
        [string]$AccentHex,
        [string]$RimHex,
        [string]$PatternHexA,
        [string]$PatternHexB
    )

    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $top = Get-Color $TopHex
    $bottom = Get-Color $BottomHex
    $accent = Get-Color $AccentHex
    $rim = Get-Color $RimHex
    $patternA = Get-Color $PatternHexA
    $patternB = Get-Color $PatternHexB

    $baseGradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($Size, $Size)),
        $top,
        $bottom
    )
    $graphics.FillRectangle($baseGradient, 0, 0, $Size, $Size)

    $cardInset = [int]($Size * 0.12)
    $cardWidth = $Size - ($cardInset * 2)
    $cardHeight = $Size - ($cardInset * 2)
    $cardRadius = [float]($Size * 0.1)
    $cardPath = New-RoundedRectPath -X $cardInset -Y $cardInset -Width $cardWidth -Height $cardHeight -Radius $cardRadius

    $panelGradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF($cardInset, $cardInset)),
        (New-Object System.Drawing.PointF(([single]($cardInset + $cardWidth)), ([single]($cardInset + $cardHeight)))),
        $top,
        $bottom
    )
    $graphics.FillPath($panelGradient, $cardPath)

    $graphics.SetClip($cardPath)

    $random = New-Object System.Random(1337)
    $penA = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(44, $patternA), [float]($Size * 0.004))
    $penB = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(38, $patternB), [float]($Size * 0.0032))
    $step = [int]($Size * 0.08)
    for ($x = -$Size; $x -lt $Size * 2; $x += $step) {
        $graphics.DrawLine($penA, $x, 0, $x + $Size, $Size)
        $graphics.DrawLine($penB, $x, $Size, $x - $Size, 0)
    }

    for ($i = 0; $i -lt 1200; $i++) {
        $px = $random.Next(0, $Size)
        $py = $random.Next(0, $Size)
        $noiseColor = if ($i % 2 -eq 0) { [System.Drawing.Color]::FromArgb(22, 255, 255, 255) } else { [System.Drawing.Color]::FromArgb(18, $accent) }
        $brush = New-Object System.Drawing.SolidBrush($noiseColor)
        $graphics.FillRectangle($brush, $px, $py, 1, 1)
        $brush.Dispose()
    }

    $glowColor = [System.Drawing.Color]::FromArgb(84, $accent)
    $glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($cardPath)
    $glowBrush.CenterColor = $glowColor
    $glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $accent))
    $graphics.FillPath($glowBrush, $cardPath)

    $graphics.ResetClip()

    $outerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(188, $rim), [float]($Size * 0.007))
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(122, 250, 241, 220), [float]($Size * 0.003))
    $graphics.DrawPath($outerPen, $cardPath)
    $innerPath = New-RoundedRectPath `
        -X ([single]($cardInset + ($Size * 0.018))) `
        -Y ([single]($cardInset + ($Size * 0.018))) `
        -Width ([single]($cardWidth - ($Size * 0.036))) `
        -Height ([single]($cardHeight - ($Size * 0.036))) `
        -Radius ([single]($cardRadius * 0.74))
    $graphics.DrawPath($innerPen, $innerPath)

    $highlightRect = New-Object System.Drawing.RectangleF(0, 0, [single]$Size, [single]($Size * 0.42))
    $highlightBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $highlightRect,
        [System.Drawing.Color]::FromArgb(48, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
        90
    )
    $graphics.FillRectangle($highlightBrush, 0, 0, $Size, [int]($Size * 0.42))

    $baseGradient.Dispose()
    $panelGradient.Dispose()
    $penA.Dispose()
    $penB.Dispose()
    $glowBrush.Dispose()
    $outerPen.Dispose()
    $innerPen.Dispose()
    $highlightBrush.Dispose()
    $innerPath.Dispose()
    $cardPath.Dispose()
    $graphics.Dispose()

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

function New-RoughnessTexture {
    param(
        [string]$Path,
        [int]$BaseValue,
        [int]$Variance,
        [float]$StreakStrength
    )

    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::FromArgb($BaseValue, $BaseValue, $BaseValue))
    $random = New-Object System.Random(4242)

    for ($y = 0; $y -lt $Size; $y++) {
        $lineDelta = [int](($random.NextDouble() - 0.5) * $Variance)
        for ($x = 0; $x -lt $Size; $x++) {
            $grain = [int](($random.NextDouble() - 0.5) * $Variance)
            $streak = [int]([Math]::Sin(($x + $y * $StreakStrength) * 0.08) * ($Variance * 0.42))
            $value = [Math]::Max(0, [Math]::Min(255, $BaseValue + $lineDelta + $grain + $streak))
            $color = [System.Drawing.Color]::FromArgb($value, $value, $value)
            $bitmap.SetPixel($x, $y, $color)
        }
    }

    $graphics.Dispose()
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

function New-CardBackFromReference {
    param(
        [string]$Path,
        [string]$ReferencePath
    )

    if (-not (Test-Path $ReferencePath)) {
        throw "Reference card back not found: $ReferencePath"
    }

    $source = New-Object System.Drawing.Bitmap($ReferencePath)
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.Clear([System.Drawing.Color]::FromArgb(255, 8, 13, 21))
    $graphics.DrawImage($source, 0, 0, $Size, $Size)

    $outerBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($Size, $Size)),
        [System.Drawing.Color]::FromArgb(54, 13, 22, 34),
        [System.Drawing.Color]::FromArgb(74, 8, 12, 19)
    )
    $graphics.FillRectangle($outerBrush, 0, 0, $Size, $Size)

    $frameInset = [single]($Size * 0.13)
    $frameSize = [single]($Size - $frameInset * 2)
    $frameRadius = [single]($Size * 0.09)
    $framePath = New-RoundedRectPath -X $frameInset -Y $frameInset -Width $frameSize -Height $frameSize -Radius $frameRadius
    $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(182, 212, 165, 88), [single]($Size * 0.006))
    $graphics.DrawPath($framePen, $framePath)

    $innerPath = New-RoundedRectPath `
        -X ([single]($frameInset + $Size * 0.018)) `
        -Y ([single]($frameInset + $Size * 0.018)) `
        -Width ([single]($frameSize - $Size * 0.036)) `
        -Height ([single]($frameSize - $Size * 0.036)) `
        -Radius ([single]($frameRadius * 0.72))
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 128, 214, 245), [single]($Size * 0.003))
    $graphics.DrawPath($innerPen, $innerPath)

    $source.Dispose()
    $outerBrush.Dispose()
    $framePen.Dispose()
    $innerPen.Dispose()
    $framePath.Dispose()
    $innerPath.Dispose()
    $graphics.Dispose()

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

function New-CardFrontTemplateFromReference {
    param(
        [string]$Path,
        [string]$ReferencePath
    )

    if (-not (Test-Path $ReferencePath)) {
        throw "Reference card back not found: $ReferencePath"
    }

    $source = New-Object System.Drawing.Bitmap($ReferencePath)
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.Clear([System.Drawing.Color]::FromArgb(255, 7, 11, 18))
    $graphics.DrawImage($source, 0, 0, $Size, $Size)

    $toneBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($Size, $Size)),
        [System.Drawing.Color]::FromArgb(140, 9, 28, 46),
        [System.Drawing.Color]::FromArgb(168, 5, 10, 16)
    )
    $graphics.FillRectangle($toneBrush, 0, 0, $Size, $Size)

    $vignetteRect = New-Object System.Drawing.RectangleF([single]($Size * 0.18), [single]($Size * 0.18), [single]($Size * 0.64), [single]($Size * 0.64))
    $vignetteBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush((New-RoundedRectPath -X $vignetteRect.X -Y $vignetteRect.Y -Width $vignetteRect.Width -Height $vignetteRect.Height -Radius ([single]($Size * 0.1))))
    $vignetteBrush.CenterColor = [System.Drawing.Color]::FromArgb(84, 28, 49, 72)
    $vignetteBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $graphics.FillEllipse($vignetteBrush, $vignetteRect)

    $foilBand = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF([single](-$Size * 0.2), [single]($Size * 0.08))),
        (New-Object System.Drawing.PointF([single]($Size * 1.2), [single]($Size * 0.34))),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
    )
    $blend = New-Object System.Drawing.Drawing2D.ColorBlend
    $blend.Colors = @(
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(74, 120, 215, 245),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
    )
    $blend.Positions = @(0.0, 0.5, 1.0)
    $foilBand.InterpolationColors = $blend
    $graphics.FillRectangle($foilBand, 0, 0, $Size, [int]($Size * 0.36))

    $frameInset = [single]($Size * 0.12)
    $frameSize = [single]($Size - $frameInset * 2)
    $frameRadius = [single]($Size * 0.1)
    $framePath = New-RoundedRectPath -X $frameInset -Y $frameInset -Width $frameSize -Height $frameSize -Radius $frameRadius
    $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(176, 219, 178, 102), [single]($Size * 0.006))
    $graphics.DrawPath($framePen, $framePath)

    $innerPath = New-RoundedRectPath `
        -X ([single]($frameInset + $Size * 0.016)) `
        -Y ([single]($frameInset + $Size * 0.016)) `
        -Width ([single]($frameSize - $Size * 0.032)) `
        -Height ([single]($frameSize - $Size * 0.032)) `
        -Radius ([single]($frameRadius * 0.74))
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(122, 143, 223, 242), [single]($Size * 0.003))
    $graphics.DrawPath($innerPen, $innerPath)

    $source.Dispose()
    $toneBrush.Dispose()
    $vignetteBrush.Dispose()
    $foilBand.Dispose()
    $framePen.Dispose()
    $innerPen.Dispose()
    $framePath.Dispose()
    $innerPath.Dispose()
    $graphics.Dispose()

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

<#
  Card face raster: same substrate and ornament language as back.png (reference art + back pipeline),
  then the same tone / vignette / foil / double-frame pass as the legacy front-template — reads as a matched pair.
  Requires back.png to exist (run after New-CardBackFromReference).
#>
function New-CardFrontFaceImage {
    param(
        [string]$Path,
        [string]$BackImagePath
    )

    if (-not (Test-Path $BackImagePath)) {
        throw "Card back image not found (expected back.png): $BackImagePath"
    }

    $backBmp = New-Object System.Drawing.Bitmap($BackImagePath)
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.DrawImage($backBmp, 0, 0, $Size, $Size)
    $backBmp.Dispose()

    # Same treatment as New-CardFrontTemplateFromReference — keeps face in the same family as the reference back art.
    $toneBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($Size, $Size)),
        [System.Drawing.Color]::FromArgb(125, 9, 28, 46),
        [System.Drawing.Color]::FromArgb(152, 5, 10, 16)
    )
    $graphics.FillRectangle($toneBrush, 0, 0, $Size, $Size)
    $toneBrush.Dispose()

    $vignetteRect = New-Object System.Drawing.RectangleF([single]($Size * 0.18), [single]($Size * 0.18), [single]($Size * 0.64), [single]($Size * 0.64))
    $vignettePath = New-RoundedRectPath -X $vignetteRect.X -Y $vignetteRect.Y -Width $vignetteRect.Width -Height $vignetteRect.Height -Radius ([single]($Size * 0.1))
    $vignetteBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($vignettePath)
    $vignetteBrush.CenterColor = [System.Drawing.Color]::FromArgb(72, 28, 49, 72)
    $vignetteBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $graphics.FillEllipse($vignetteBrush, $vignetteRect)
    $vignetteBrush.Dispose()
    $vignettePath.Dispose()

    $foilBand = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF([single](-$Size * 0.2), [single]($Size * 0.08))),
        (New-Object System.Drawing.PointF([single]($Size * 1.2), [single]($Size * 0.34))),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
    )
    $blend = New-Object System.Drawing.Drawing2D.ColorBlend
    $blend.Colors = @(
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(68, 120, 215, 245),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
    )
    $blend.Positions = @(0.0, 0.5, 1.0)
    $foilBand.InterpolationColors = $blend
    $graphics.FillRectangle($foilBand, 0, 0, $Size, [int]($Size * 0.36))
    $foilBand.Dispose()

    $frameInset = [single]($Size * 0.12)
    $frameSize = [single]($Size - $frameInset * 2)
    $frameRadius = [single]($Size * 0.1)
    $framePath = New-RoundedRectPath -X $frameInset -Y $frameInset -Width $frameSize -Height $frameSize -Radius $frameRadius
    $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(176, 219, 178, 102), [single]($Size * 0.006))
    $graphics.DrawPath($framePen, $framePath)

    $innerPath = New-RoundedRectPath `
        -X ([single]($frameInset + $Size * 0.016)) `
        -Y ([single]($frameInset + $Size * 0.016)) `
        -Width ([single]($frameSize - $Size * 0.032)) `
        -Height ([single]($frameSize - $Size * 0.032)) `
        -Radius ([single]($frameRadius * 0.74))
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(122, 143, 223, 242), [single]($Size * 0.003))
    $graphics.DrawPath($innerPen, $innerPath)

    $framePen.Dispose()
    $innerPen.Dispose()
    $framePath.Dispose()
    $innerPath.Dispose()
    $graphics.Dispose()

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

New-CardBackFromReference -Path (Join-Path $OutputDir "back.png") -ReferencePath $SourceBackPath
New-CardFrontFaceImage -Path (Join-Path $OutputDir "front-face.png") -BackImagePath (Join-Path $OutputDir "back.png")
New-CardTexture -Path (Join-Path $OutputDir "edge.png") -TopHex "#202a38" -BottomHex "#111722" -AccentHex "#9cc4e8" -RimHex "#b8cce2" -PatternHexA "#8cb3d5" -PatternHexB "#2e3f57"

New-RoughnessTexture -Path (Join-Path $OutputDir "panel-roughness.png") -BaseValue 170 -Variance 34 -StreakStrength 0.2
New-RoughnessTexture -Path (Join-Path $OutputDir "edge-roughness.png") -BaseValue 182 -Variance 26 -StreakStrength 0.34

Write-Output ("Generated card textures in " + (Resolve-Path $OutputDir))
