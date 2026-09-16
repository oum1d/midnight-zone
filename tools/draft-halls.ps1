# =============================================================================
# ЗОНА ПОЛУНОЧИ — черновые кадры залов, пока чистовые стоят в очереди
# -----------------------------------------------------------------------------
# Чистовую серию делает generate-halls.ps1 (FLUX.1 schnell через AI Horde), но
# без ключа очередь занимает до часа. Чтобы залы на сайте не стояли пустыми,
# этот скрипт за пару минут делает черновики через бесплатный Pollinations
# (модель Sana — слабее, но сразу) и кладёт их в photos-raw/draft/<зал>.jpg.
#
# prepare-photos.ps1 берёт черновик, только если чистового кадра нет. Как только
# чистовой придёт, повторный запуск prepare-photos.ps1 его и поставит.
#
# Запуск из папки проекта (черновики делаются только для залов без кадра):
#     powershell -ExecutionPolicy Bypass -File tools\draft-halls.ps1
#
# Pollinations ставит знак в правый нижний угол, поэтому кадр просится выше
# нужного и нижние 9 % отрезаются. Очередь одна на IP — запросы идут по одному.
#
# Файл сохранён в UTF-8 с BOM, иначе PowerShell 5.1 испортит русские комментарии.
# =============================================================================

param([string[]]$Only)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Drawing

$tools = Split-Path -Parent $MyInvocation.MyCommand.Path
$raw = Join-Path $tools 'photos-raw'
$draft = Join-Path $raw 'draft'
if (-not (Test-Path $draft)) { New-Item -ItemType Directory -Path $draft | Out-Null }

$utf8 = New-Object System.Text.UTF8Encoding($false)
$manifest = [System.IO.File]::ReadAllText((Join-Path $tools 'photos.json'), $utf8) | ConvertFrom-Json
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

$names = @()
foreach ($o in $Only) { $names += ($o -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } }

foreach ($p in $manifest.photos) {
  if ($names.Count -and ($names -notcontains $p.name)) { continue }
  $final = @('.jpg', '.jpeg', '.png') | Where-Object { Test-Path (Join-Path $raw ($p.name + $_)) }
  if ($final -and -not $names.Count) { continue }

  $uri = 'https://image.pollinations.ai/prompt/' + [Uri]::EscapeDataString($p.prompt + ' ' + $manifest.style) +
         '?width=1280&height=1060&nologo=true&seed=' + $p.seed
  $tmp = Join-Path $draft ($p.name + '.tmp')
  $out = Join-Path $draft ($p.name + '.jpg')

  $ok = $false
  foreach ($wait in 0, 20, 45) {
    if ($wait) { Start-Sleep -Seconds $wait }
    try {
      Invoke-WebRequest -Uri $uri -OutFile $tmp -TimeoutSec 180 -UseBasicParsing
      $probe = [System.Drawing.Image]::FromFile($tmp)
      $good = ($probe.Width -ge 600 -and $probe.Height -ge 450)
      $probe.Dispose()
      if ($good) { $ok = $true; break }
    } catch {
      Write-Host ('  ошибка ' + $p.name + ': ' + $_.Exception.Message)
    }
  }
  if (-not $ok) { Write-Output ('НЕ ПОЛУЧИЛОСЬ: ' + $p.name); continue }

  $img = [System.Drawing.Image]::FromFile($tmp)
  try {
    $w = $img.Width
    $h = [int][math]::Floor($img.Height * 0.91)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), 0, 0, $w, $h, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]92)
    $bmp.Save($out, $codec, $params)
    $bmp.Dispose()
  } finally {
    $img.Dispose()
  }
  [System.IO.File]::Delete($tmp)
  '{0,-11} черновик {1}x{2}  {3} KB' -f $p.name, $w, $h, [math]::Round((Get-Item $out).Length / 1KB)
}
