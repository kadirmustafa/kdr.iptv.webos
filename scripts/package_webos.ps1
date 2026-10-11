<#
.SYNOPSIS
    KDR IPTV - LG webOS TV Paketleme ve Hazırlık Scripti
.DESCRIPTION
    Bu script webosApp klasöründeki web uygulamasını derler ve LG webOS TV için .ipk paketine dönüştürür.
#>

param (
    [string]$OutputDir = "$PSScriptRoot\..\webos-build"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " [1/3] webOS Web Uygulaması Derleniyor..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\.."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Hata: Web derlemesi başarısız oldu!"
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " [2/3] Dağıtım Klasörü Hazırlanıyor..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$aresInstalled = Get-Command "ares-package" -ErrorAction SilentlyContinue

if ($aresInstalled) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " [3/3] webOS .ipk Paketi Oluşturuluyor..." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    ares-package "$PSScriptRoot\..\dist" -o $OutputDir
    Write-Host "`nBaşarılı! Paket konumu: $OutputDir" -ForegroundColor Green
} else {
    Write-Host "`n[BİLGİ] 'ares-package' (webOS CLI) sistemde bulunamadı." -ForegroundColor Yellow
    Write-Host "Kurmak için terminalden:" -ForegroundColor White
    Write-Host "  npm install -g @webos-tools/cli" -ForegroundColor Cyan
    Write-Host "`nAlternatif olarak derlenmiş 'webosApp/dist' klasörünü doğrudan webOS CLI ile paketleyebilirsiniz." -ForegroundColor White
}
