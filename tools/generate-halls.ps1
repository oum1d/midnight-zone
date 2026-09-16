# =============================================================================
# ЗОНА ПОЛУНОЧИ — генерация изображений залов
# -----------------------------------------------------------------------------
# Берёт промпты из tools/photos.json, добавляет к каждому общий хвост про здание
# и камеру (style) и генерирует кадры моделью FLUX.1 [schnell] через AI Horde —
# бесплатную сеть видеокарт добровольцев, без регистрации и без оплаты.
# Лицензия модели Apache 2.0: кадры можно использовать и в коммерческом проекте.
# Результат — tools/photos-raw/<зал>.png, дальше их обрабатывает
# prepare-photos.ps1.
#
# Запуск из папки проекта (залы, у которых кадр уже есть, пропускаются):
#     powershell -ExecutionPolicy Bypass -File tools\generate-halls.ps1
# Перегенерировать конкретные залы:
#     powershell -ExecutionPolicy Bypass -File tools\generate-halls.ps1 -Only squid,glow -Force
# Несколько вариантов на выбор (seed, seed+1 …) в photos-raw/variants:
#     powershell -ExecutionPolicy Bypass -File tools\generate-halls.ps1 -Only voices -Variants 3
# Выбранный вариант переименовать в photos-raw/<зал>.png.
#
# Что выяснено на практике (сентябрь 2026):
# - Без ключа Horde ставит запрос в общую очередь с низким приоритетом: кадр
#   ждёт 5–10 минут. Поэтому скрипт отправляет сразу несколько заданий и
#   забирает их по мере готовности. Свой бесплатный ключ с https://aihorde.net
#   даёт приоритет — его можно передать через переменную окружения AI_HORDE_KEY,
#   в файлы проекта ключ не записывается.
# - Видеокарты с FLUX в сети Horde иногда на минуту пропадают: check отвечает
#   is_possible: false. Это не ошибка — задание живо и дождётся карты.
# - Без ключа кадр не может быть больше 1024x1024 по площади, а стороны должны
#   делиться на 64. 1152x896 проходит; до 4:3 кадр обрезает prepare-photos.ps1.
# - Horde отдаёт WebP. System.Drawing его не читает, поэтому кадр декодируется
#   через WIC (PresentationCore) — кодек WebP есть в Windows 10/11.
# - Та же модель есть в Space black-forest-labs/FLUX.1-schnell на Hugging Face
#   (10 секунд на кадр), но анонимная квота ZeroGPU кончается после двух кадров.
#   Google Nano Banana на ключе без биллинга отвечает limit: 0, а бесплатный
#   Pollinations с 14.09.2026 отдаёт только слабую модель Sana.
#
# Файл сохранён в UTF-8 с BOM, иначе PowerShell 5.1 испортит русские комментарии.
# =============================================================================

param(
  [string[]]$Only,
  [int]$Shift = 0,
  [int]$Variants = 1,
  [int]$MaxActive = 4,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName PresentationCore, WindowsBase

$api = 'https://aihorde.net/api/v2'
$model = 'Flux.1-Schnell fp8 (Compact)'
$key = if ($env:AI_HORDE_KEY) { $env:AI_HORDE_KEY.Trim() } else { '0000000000' }
$headers = @{ apikey = $key; 'Client-Agent' = 'midnight-zone-site:1.1:anonymous' }

$tools = Split-Path -Parent $MyInvocation.MyCommand.Path
$raw = Join-Path $tools 'photos-raw'
$variantsDir = Join-Path $raw 'variants'
foreach ($d in $raw, $variantsDir) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null }
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
$manifest = [System.IO.File]::ReadAllText((Join-Path $tools 'photos.json'), $utf8) | ConvertFrom-Json

# -Only a,b из командной строки приходит одной строкой — разбираем сами
$names = @()
foreach ($o in $Only) { $names += ($o -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } }

# --- HTTP с понятным текстом ошибки ------------------------------------------
function Invoke-Horde([string]$method, [string]$path, $body) {
  $req = @{ Method = $method; Uri = ($api + $path); Headers = $headers; TimeoutSec = 60 }
  if ($body) {
    $req.ContentType = 'application/json'
    $req.Body = $utf8.GetBytes(($body | ConvertTo-Json -Depth 6 -Compress))
  }
  try { return Invoke-RestMethod @req }
  catch {
    $text = $_.Exception.Message
    $resp = $_.Exception.Response
    if ($resp) {
      try { $text = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd() } catch {}
      $text = ('HTTP {0}: {1}' -f [int]$resp.StatusCode, $text)
    }
    throw $text
  }
}

# WebP -> PNG через WIC; заодно проверяет, что пришла настоящая картинка
function Save-AsPng([string]$webp, [string]$png) {
  $fs = [System.IO.File]::OpenRead($webp)
  try {
    $dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($fs,
      [System.Windows.Media.Imaging.BitmapCreateOptions]::None,
      [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
    $frame = $dec.Frames[0]
    if ($frame.PixelWidth -lt 600 -or $frame.PixelHeight -lt 450) { throw 'слишком маленький кадр' }
    $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($frame))
    $out = [System.IO.File]::Create($png)
    try { $enc.Save($out) } finally { $out.Close() }
    return ('{0}x{1}' -f $frame.PixelWidth, $frame.PixelHeight)
  } finally {
    $fs.Close()
  }
}

# --- Очередь заданий ---------------------------------------------------------
# Отправленные задания записываются в photos-raw/horde-jobs.json. Если запуск
# прервать, следующий подхватит их по id, а не отправит те же залы ещё раз.
$jobsFile = Join-Path $raw 'horde-jobs.json'
$active = New-Object System.Collections.Generic.List[object]
$queue = New-Object System.Collections.Generic.Queue[object]

function Save-Jobs {
  $list = @($active.ToArray() | ForEach-Object { @{ name = $_.name; seed = $_.seed; out = $_.out; id = $_.id; tries = $_.tries } })
  [System.IO.File]::WriteAllText($jobsFile, (ConvertTo-Json -InputObject $list -Depth 3), $utf8)
}

function New-Job($p, [int]$seed, [string]$out, [int]$tries, $id) {
  return [pscustomobject]@{
    name = $p.name; seed = $seed; out = $out; tries = $tries; id = $id
    prompt = ($p.prompt + ' ' + $manifest.style); waitingSaid = $false
  }
}

$adopted = @{}
if (Test-Path $jobsFile) {
  # В PowerShell 5.1 ConvertFrom-Json отдаёт массив одним объектом: @(... | ConvertFrom-Json)
  # дал бы массив из одного массива. Через переменную массив разворачивается как надо.
  $saved = [System.IO.File]::ReadAllText($jobsFile, $utf8) | ConvertFrom-Json
  foreach ($j in $saved) {
    # Подхватываем все сохранённые задания, даже вне -Only: они уже стоят в очереди,
    # а иначе Save-Jobs перезаписал бы файл и их id потерялись бы.
    if (-not $j -or -not $j.id) { continue }
    $p = $manifest.photos | Where-Object { $_.name -eq $j.name } | Select-Object -First 1
    $active.Add((New-Job $p ([int]$j.seed) $j.out ([int]$j.tries) $j.id))
    $adopted[$j.out] = $true
    Write-Host ('  подхвачено задание: {0} seed {1}' -f $j.name, $j.seed)
  }
}

foreach ($p in $manifest.photos) {
  if ($names.Count -and ($names -notcontains $p.name)) { continue }
  for ($v = 0; $v -lt $Variants; $v++) {
    $seed = [int]$p.seed + $Shift + $v
    if ($Variants -gt 1) { $out = Join-Path $variantsDir ('{0}-{1}.png' -f $p.name, $seed) }
    else { $out = Join-Path $raw ($p.name + '.png') }
    if ($adopted.ContainsKey($out)) { continue }
    if ((Test-Path $out) -and -not $Force) { Write-Host ('есть кадр, пропуск: ' + $p.name); continue }
    $queue.Enqueue((New-Job $p $seed $out 0 $null))
  }
}
if ($queue.Count -eq 0 -and $active.Count -eq 0) { Write-Output 'Генерировать нечего.'; exit 0 }
Write-Host ('заданий: {0}, модель: {1}' -f ($queue.Count + $active.Count), $model)

$failed = @()
$deadline = (Get-Date).AddMinutes(120)

while (($queue.Count -gt 0 -or $active.Count -gt 0) -and (Get-Date) -lt $deadline) {
  # Дозаполняем активные задания
  while ($queue.Count -gt 0 -and $active.Count -lt $MaxActive) {
    $job = $queue.Peek()
    $body = @{
      prompt = $job.prompt
      params = @{ width = 1152; height = 896; steps = 4; cfg_scale = 1; sampler_name = 'k_euler'; seed = [string]$job.seed; n = 1 }
      models = @($model); nsfw = $false; censor_nsfw = $true; r2 = $true
    }
    try {
      $job.id = (Invoke-Horde 'Post' '/generate/async' $body).id
      $job.tries++
      $job.waitingSaid = $false
      [void]$queue.Dequeue()
      $active.Add($job)
      Save-Jobs
      Write-Host ('  отправлен: {0} seed {1}  id {2}' -f $job.name, $job.seed, $job.id)
    } catch {
      # 429 — лимит одновременных заданий без ключа: подождём, пока освободится
      Write-Host ('  не принят ({0}): {1}' -f $job.name, $_)
      break
    }
  }

  Start-Sleep -Seconds 20

  foreach ($job in $active.ToArray()) {
    $retry = $false
    try { $st = Invoke-Horde 'Get' ('/generate/check/' + $job.id) $null }
    catch {
      # 404 — задание протухло на сервере: отправим заново
      if ("$_" -match 'HTTP 404') {
        Write-Host ('  задание пропало на сервере: ' + $job.name)
        [void]$active.Remove($job); Save-Jobs
        if ($job.tries -lt 3) { $queue.Enqueue($job) } else { $failed += $job.name }
      }
      continue
    }

    if ($st.done) {
      $res = Invoke-Horde 'Get' ('/generate/status/' + $job.id) $null
      $gen = $res.generations | Select-Object -First 1
      if (-not $gen -or $gen.censored) {
        Write-Host ('  кадр отбракован фильтром: ' + $job.name)
        $retry = $true
      } else {
        $tmp = $job.out + '.tmp.webp'
        try {
          Invoke-WebRequest -Uri $gen.img -OutFile $tmp -TimeoutSec 120 -UseBasicParsing
          $size = Save-AsPng $tmp $job.out
          '{0,-11} seed {1}  {2}  {3} KB  ({4})' -f $job.name, $job.seed, $size, [math]::Round((Get-Item $job.out).Length / 1KB), $gen.worker_name
        } catch {
          Write-Host ('  не скачался {0}: {1}' -f $job.name, $_)
          $retry = $true
        } finally {
          if (Test-Path $tmp) { [System.IO.File]::Delete($tmp) }
        }
      }
      [void]$active.Remove($job); Save-Jobs
    } elseif ($st.faulted) {
      Write-Host ('  задание сорвалось: ' + $job.name)
      [void]$active.Remove($job); Save-Jobs
      $retry = $true
    } elseif (-not $st.is_possible -and -not $job.waitingSaid) {
      Write-Host ('  нет свободных видеокарт с моделью, ждём: ' + $job.name)
      $job.waitingSaid = $true
    }

    if ($retry) {
      if ($job.tries -lt 3) { $queue.Enqueue($job) }
      else { $failed += $job.name }
    }
  }
}

foreach ($job in $queue.ToArray()) { $failed += $job.name }
if ($active.Count) {
  Write-Output ('Не дождались, задания остались в photos-raw/horde-jobs.json: ' + (($active.ToArray() | ForEach-Object { $_.name }) -join ', '))
} elseif (Test-Path $jobsFile) {
  [System.IO.File]::Delete($jobsFile)
}
if ($failed.Count) { Write-Output ('НЕ ПОЛУЧИЛОСЬ: ' + (($failed | Select-Object -Unique) -join ', ')) }
