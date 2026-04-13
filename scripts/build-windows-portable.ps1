$ErrorActionPreference = "Stop"

function Ensure-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $name"
  }
}

Write-Host "== Big Five: Windows portable build ==" -ForegroundColor Cyan

Ensure-Command cargo
Ensure-Command pnpm

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$tauriBinDir = Join-Path $repoRoot "src-tauri\bin"
$outDir = Join-Path $repoRoot "dist\windows-portable"

New-Item -ItemType Directory -Force -Path $tauriBinDir | Out-Null
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "`n[1/4] Build backend sidecar (release)..." -ForegroundColor Yellow
cargo build -p backend --release

$backendExeCandidates = @(
  (Join-Path $repoRoot "target\release\backend.exe"),
  (Join-Path $repoRoot "backend\target\release\backend.exe")
)
$backendExe = $backendExeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $backendExe) {
  throw ("backend.exe not found. Tried:`n- " + ($backendExeCandidates -join "`n- "))
}

$sidecarExe = Join-Path $tauriBinDir "backend-x86_64-pc-windows-msvc.exe"
Copy-Item -Force $backendExe $sidecarExe
Write-Host "Sidecar: $sidecarExe" -ForegroundColor DarkGray

Write-Host "`n[2/4] Build frontend (dist)..." -ForegroundColor Yellow
pnpm -C frontend install
pnpm -C frontend build

Write-Host "`n[3/4] Build Tauri (portable, no installers)..." -ForegroundColor Yellow
$tauriCli = Join-Path $repoRoot "frontend\node_modules\@tauri-apps\cli\tauri.js"
if (-not (Test-Path $tauriCli)) {
  throw "Tauri CLI not found at $tauriCli (did pnpm install succeed?)"
}
Push-Location (Join-Path $repoRoot "src-tauri")
try {
  node $tauriCli build --bundles none
} finally {
  Pop-Location
}

$tauriExeCandidates = @(
  (Join-Path $repoRoot "src-tauri\target\release\bigfive-tauri.exe"),
  (Join-Path $repoRoot "target\release\bigfive-tauri.exe")
)
$tauriExe = $tauriExeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $tauriExe) {
  $searchRoots = @(
    (Join-Path $repoRoot "src-tauri\target\release"),
    (Join-Path $repoRoot "target\release")
  ) | Where-Object { Test-Path $_ }

  $fallback = $null
  foreach ($root in $searchRoots) {
    $fallback = Get-ChildItem -Path $root -Filter "*.exe" |
      Where-Object { $_.Name -notmatch "backend" } |
      Select-Object -First 1
    if ($null -ne $fallback) { break }
  }

  if ($null -eq $fallback) {
    throw "Tauri exe not found under src-tauri\\target\\release or target\\release"
  }
  $tauriExe = $fallback.FullName
}

Write-Host "`n[4/4] Collect artifacts..." -ForegroundColor Yellow
$tauriOutExe = Join-Path $outDir (Split-Path $tauriExe -Leaf)
$sidecarOutExe = Join-Path $outDir (Split-Path $sidecarExe -Leaf)
$backendOutExe = Join-Path $outDir "backend.exe"

foreach ($p in @($tauriOutExe, $sidecarOutExe, $backendOutExe)) {
  if (Test-Path $p) {
    try { Remove-Item -Force $p -ErrorAction Stop } catch { }
  }
}

Copy-Item -Force $tauriExe $tauriOutExe
Copy-Item -Force $sidecarExe $sidecarOutExe
Copy-Item -Force $sidecarExe $backendOutExe

$readme = @"
Big Five (Windows portable)

How to run:
- Keep these two files in the same folder:
  - $(Split-Path $tauriExe -Leaf)
  - backend.exe
- Double-click the app exe.

Notes:
- Requires WebView2 runtime (usually present on Windows 10/11).
"@
Set-Content -Encoding UTF8 -Path (Join-Path $outDir "README.txt") -Value $readme

Write-Host "`nDone." -ForegroundColor Green
Write-Host "Output: $outDir" -ForegroundColor Green

