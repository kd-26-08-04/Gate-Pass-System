# PowerShell script to create basic PNG assets for Expo app

# Create a simple colored PNG using PowerShell and .NET Graphics
Add-Type -AssemblyName System.Drawing

function Create-ColoredPNG {
    param(
        [string]$FilePath,
        [int]$Width,
        [int]$Height,
        [string]$BackgroundColor = "Green",
        [string]$Text = "GP"
    )
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Create background brush
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::$BackgroundColor)
    $graphics.FillRectangle($brush, 0, 0, $Width, $Height)
    
    # Add text
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $font = New-Object System.Drawing.Font("Arial", ($Width / 20), [System.Drawing.FontStyle]::Bold)
    $textSize = $graphics.MeasureString($Text, $font)
    $x = ($Width - $textSize.Width) / 2
    $y = ($Height - $textSize.Height) / 2
    $graphics.DrawString($Text, $font, $textBrush, $x, $y)
    
    # Save as PNG
    $bitmap.Save($FilePath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    
    Write-Host "Created: $FilePath"
}

# Create assets directory
$assetsDir = "k:/Project for SALE/Gate pass System/mobile-app/assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -Path $assetsDir -ItemType Directory -Force
}

# Create PNG assets
Create-ColoredPNG -FilePath "$assetsDir/icon.png" -Width 1024 -Height 1024 -BackgroundColor "Green" -Text "GP"
Create-ColoredPNG -FilePath "$assetsDir/splash.png" -Width 1242 -Height 2208 -BackgroundColor "DarkGreen" -Text "Gate Pass"
Create-ColoredPNG -FilePath "$assetsDir/adaptive-icon.png" -Width 1024 -Height 1024 -BackgroundColor "Green" -Text "GP"
Create-ColoredPNG -FilePath "$assetsDir/favicon.png" -Width 48 -Height 48 -BackgroundColor "Green" -Text "GP"

Write-Host "All PNG assets created successfully!"
Write-Host "Note: These are basic colored PNG files. For production, replace with professionally designed assets."