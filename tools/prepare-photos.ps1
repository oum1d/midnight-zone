# =============================================================================
# ЗОНА ПОЛУНОЧИ — подготовка фотографий залов из tools/photos-raw
#
#   assets/img/halls/<slug>-lg.jpg  — 1200x900, для широких экранов и ретины
#   assets/img/halls/<slug>-sm.jpg  — 600x450, для карточек на обычных экранах
#   assets/data/exhibition.js       — блок photoCredits между метками
#   CREDITS.md                      — таблица авторов и лицензий
#
# Запуск из папки проекта:
#     powershell -ExecutionPolicy Bypass -File tools\prepare-photos.ps1
#
# Скрипт перенесён из проекта «ГУЛ», где проверен на 17 кадрах. Файл сохранён
# в UTF-8 с BOM: без BOM PowerShell 5.1 читает его как ANSI и портит русский
# текст, который скрипт пишет в CREDITS.md.
#
# КОГДА ПОЯВЯТСЯ НАСТОЯЩИЕ ФОТО ВЫСТАВКИ
# Положить их в tools/photos-raw под именами залов (edge.jpg … unknown.jpg),
# удалить tools/photos-raw/credits.json и запустить скрипт. Кадры пройдут ту же
# тонировку, а подписи авторов на сайте исчезнут сами.
# =============================================================================

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$tools = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $tools
$raw = Join-Path $tools 'photos-raw'
$dst = Join-Path $root 'assets\img\halls'
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Force -Path $dst | Out-Null }

$utf8 = New-Object System.Text.UTF8Encoding($false)
$manifest = [System.IO.File]::ReadAllText((Join-Path $tools 'photos.json'), $utf8) | ConvertFrom-Json
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

# ============================================================================
# ТОНИРОВКА
# ----------------------------------------------------------------------------
# Одна матрица цвета на всю серию. Для каждого пикселя:
#   яркость L = 0.299 R + 0.587 G + 0.114 B
#   контраст и яркость вокруг середины: L' = (L - 0.5) * contrast + 0.5 + brightness
#   цвет = shadow + (highlight - shadow) * L'
# Всё это линейно, поэтому укладывается в одну ColorMatrix и считается
# GDI+ за один проход, а не циклом по миллиону пикселей.
# ============================================================================
function Hex([string]$hex) {
  $h = $hex.TrimStart('#')
  # Скобки вокруг каждого деления обязательны: в PowerShell запятая связывает
  # сильнее деления, и без скобок получилось бы деление на массив
  return @(
    ([Convert]::ToInt32($h.Substring(0, 2), 16) / 255.0),
    ([Convert]::ToInt32($h.Substring(2, 2), 16) / 255.0),
    ([Convert]::ToInt32($h.Substring(4, 2), 16) / 255.0)
  )
}

$grade = $manifest.grade
$lo = Hex $grade.shadow
$hi = Hex $grade.highlight
$c = [double]$grade.contrast
$b = [double]$grade.brightness

# mix — доля тонировки. 1: чистый монохром в цветах shadow→highlight.
# Меньше 1: к тонировке подмешивается исходный цвет с тем же контрастом —
# у серии одна гамма и одинаковые тени, но свет и материалы остаются живыми,
# и кадр выглядит как фотография, а не как дизайнерская обработка.
# Смесь двух линейных преобразований тоже линейна, так что это по-прежнему
# одна ColorMatrix и один проход GDI+.
$mix = if ($null -ne $grade.mix) { [double]$grade.mix } else { 1.0 }

function New-GradeMatrix([double]$b) {
  $cm = New-Object System.Drawing.Imaging.ColorMatrix
  $offset = 0.5 - 0.5 * $c + $b
  $k = 1 - $mix
  # GDI+ умножает строку [R G B A 1] на матрицу: MatrixIJ — вклад входа I в выход J.
  # Тонировка: вклад канала I в выход J = (hi[J]-lo[J]) * c * вес яркости I.
  # Исходный цвет: вклад канала I только в свой же выход, с тем же контрастом c.
  $wts = @(0.299, 0.587, 0.114)
  for ($i = 0; $i -lt 3; $i++) {
    for ($j = 0; $j -lt 3; $j++) {
      $tone = ($hi[$j] - $lo[$j]) * $c * $wts[$i]
      $own = if ($i -eq $j) { $c } else { 0 }
      # set_Item, а не $cm[$i, $j]: в PowerShell запись через запятую в скобках
      # легко читается как выборка из массива, а не как вызов индексатора
      $cm.set_Item($i, $j, [single]($mix * $tone + $k * $own))
    }
  }
  for ($j = 0; $j -lt 3; $j++) {
    $cm.set_Item(4, $j, [single]($mix * ($lo[$j] + ($hi[$j] - $lo[$j]) * $offset) + $k * $offset))
  }
  $cm.Matrix33 = 1; $cm.Matrix44 = 1
  return $cm
}

function New-Frame($img, [int]$W, [int]$H, [double]$fx, [double]$fy, $cm) {
  $ratio = $W / $H
  if ($img.Width / $img.Height -gt $ratio) {
    $ch = $img.Height; $cw = [int]($ch * $ratio)
    $cx = [int](($img.Width - $cw) * $fx); $cy = 0
  } else {
    $cw = $img.Width; $ch = [int]($cw / $ratio)
    $cx = 0; $cy = [int](($img.Height - $ch) * $fy)
  }
  # Мелкий исходник не растягиваем: апскейл даёт мыло, а не детали
  if ($cw -lt $W) { $W = $cw; $H = [int]($cw / $ratio) }

  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  $attrs = New-Object System.Drawing.Imaging.ImageAttributes
  $attrs.SetColorMatrix($cm)
  # Без этого бикубика тянет прозрачность из-за края кадра — по периметру светлая кайма
  $attrs.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)

  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $W, $H)), $cx, $cy, $cw, $ch, [System.Drawing.GraphicsUnit]::Pixel, $attrs)

  # Виньетка: эллипс шире кадра, центр прозрачный, к краям темнее.
  # Сводит кадры с разной экспозицией по краям — глаз читает серию как одну съёмку.
  $v = [double]$grade.vignette
  if ($v -gt 0) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse([int](-$W * 0.25), [int](-$H * 0.25), [int]($W * 1.5), [int]($H * 1.5))
    $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $brush.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
    $brush.SurroundColors = @([System.Drawing.Color]::FromArgb([int](255 * $v), 2, 10, 18))
    $brush.FocusScales = New-Object System.Drawing.PointF(0.45, 0.45)
    $g.FillRectangle($brush, 0, 0, $W, $H)
    $brush.Dispose(); $path.Dispose()
  }

  $attrs.Dispose(); $g.Dispose()
  return $bmp
}

# Подбор качества под бюджет: кадр не тяжелее заданного числа КБ
function Save-Budget($bmp, [string]$out, [int]$q, [int]$minQ, [int]$budgetKB) {
  do {
    $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$q)
    $bmp.Save($out, $codec, $params)
    $kb = (Get-Item $out).Length / 1KB
    $q -= 4
  } while ($kb -gt $budgetKB -and $q -ge $minQ)
  return @{ kb = [math]::Round($kb); q = $q + 4; size = "$($bmp.Width)x$($bmp.Height)" }
}

# ============================================================================
# КАДРЫ
# ============================================================================
$total = 0
$done = @()
foreach ($p in $manifest.photos) {
  # Генераторы отдают кто JPEG, кто PNG — берём что есть
  $src = @('.jpg', '.jpeg', '.png') | ForEach-Object { Join-Path $raw ($p.name + $_) } | Where-Object { Test-Path $_ } | Select-Object -First 1
  # Нет чистового кадра — берём черновик из draft-halls.ps1, чтобы зал не стоял пустым
  if (-not $src) { $src = @('.jpg', '.png') | ForEach-Object { Join-Path $raw ('draft\' + $p.name + $_) } | Where-Object { Test-Path $_ } | Select-Object -First 1 }
  if (-not $src) { Write-Output ("missing raw: " + $p.name); continue }
  if ($src -match '\\draft\\') { Write-Output ("draft: " + $p.name) }

  $exposure = if ($p.exposure) { [double]$p.exposure } else { 0 }
  $matrix = New-GradeMatrix ($b + $exposure)
  $img = [System.Drawing.Image]::FromFile($src)
  try {
    $big = New-Frame $img 1200 900 $p.fx $p.fy $matrix
    $a = Save-Budget $big (Join-Path $dst ($p.name + '-lg.jpg')) 82 56 150
    $big.Dispose()

    $small = New-Frame $img 600 450 $p.fx $p.fy $matrix
    $s = Save-Budget $small (Join-Path $dst ($p.name + '-sm.jpg')) 80 54 48
    $small.Dispose()

    $total += $a.kb + $s.kb
    $done += $p.name
    '{0,-11} lg {1,-9} {2,4} KB q{3}   sm {4,-8} {5,3} KB q{6}' -f $p.name, $a.size, $a.kb, $a.q, $s.size, $s.kb, $s.q
  } finally {
    $img.Dispose()
  }
}
"images total: $total KB"

# ============================================================================
# АВТОРЫ -> exhibition.js и CREDITS.md
# ----------------------------------------------------------------------------
# Источник один: credits.json, который собирает fetch-photos.ps1. Переписывать
# авторов и лицензии руками — верный способ ошибиться.
# ============================================================================
$creditsPath = Join-Path $raw 'credits.json'
$credits = @{}
if (Test-Path $creditsPath) {
  $json = [System.IO.File]::ReadAllText($creditsPath, $utf8) | ConvertFrom-Json
  foreach ($prop in $json.PSObject.Properties) { $credits[$prop.Name] = $prop.Value }
}

function Js([string]$s) { return "'" + ($s -replace '\\', '\\\\' -replace "'", "\'") + "'" }

# «Steve Knight from Halstead, United Kingdom» — так Flickr подписывает перенесённые
# снимки. Для подписи под кадром хватает имени.
function Short-Author([string]$a) { return ($a -replace '\s+from\s+.*$', '').Trim() }

$lines = @()
foreach ($name in $done) {
  if (-not $credits.ContainsKey($name)) { continue }
  $cr = $credits[$name]
  $lines += ('    {0}: {{ author: {1}, license: {2}, licenseUrl: {3}, source: {4} }}' -f `
    $name, (Js (Short-Author $cr.author)), (Js $cr.license), (Js $cr.licenseUrl), (Js $cr.source))
}

# photoSource подсказывает странице, что показать под сеткой залов:
#   commons   — список авторов (обязателен для CC BY и CC BY-SA)
#   generated — честная пометка, что это визуализация, а не фото выставки
#   none      — ничего, в карточках стоят заглушки
$source = if ($lines.Count) { 'commons' } elseif ($done.Count) { 'generated' } else { 'none' }
if ($lines.Count) { $creditsJs = "  photoCredits: {`n" + ($lines -join ",`n") + "`n  }," }
else { $creditsJs = '  photoCredits: {},' }
$block = "  photoSource: '$source',`n" + $creditsJs

$exPath = Join-Path $root 'assets\data\exhibition.js'
$ex = [System.IO.File]::ReadAllText($exPath, $utf8)
$pattern = '(?s)(// photoCredits:begin\r?\n).*?(\r?\n\s*// photoCredits:end)'
if ($ex -notmatch $pattern) { throw 'exhibition.js: markers photoCredits:begin/end not found' }
$ex = [regex]::Replace($ex, $pattern, { param($m) $m.Groups[1].Value + $block + $m.Groups[2].Value })
[System.IO.File]::WriteAllText($exPath, $ex, $utf8)
"exhibition.js: photoSource = $source, photoCredits = $($lines.Count)"

# --- CREDITS.md --------------------------------------------------------------
# Файл пересобирается целиком. Для сгенерированной серии — честная пометка
# и ссылка на промпты, для снимков с Commons — таблица авторов и лицензий.
$md = New-Object System.Collections.Generic.List[string]

if ($source -eq 'generated') {
  $md.Add('# Изображения залов')
  $md.Add('')
  $md.Add('Выставка «Зона полуночи» вымышленная, фотографий её залов не существует.')
  $md.Add('Изображения на странице залов — визуализация, сгенерированная нейросетью')
  $md.Add('FLUX.1 [schnell] от Black Forest Labs (лицензия Apache 2.0, коммерческое использование')
  $md.Add('разрешено) через `tools/generate-halls.ps1`.')
  $md.Add('На сайте это сказано прямо, под сеткой залов. Когда выставка откроется,')
  $md.Add('их нужно заменить настоящей съёмкой.')
  $md.Add('')
  $md.Add('Чтобы двенадцать кадров выглядели как залы одного здания, у всех промптов')
  $md.Add('общий хвост с описанием архитектуры, света и камеры — `tools/photos.json` → `style`,')
  $md.Add('промпты целиком — `tools/hall-prompts.md`. Поверх генерации вся серия проходит')
  $md.Add(('одну цветокоррекцию: тонировка {0} → {1} с долей {2}, контраст ×{3}, виньетка.' -f $grade.shadow, $grade.highlight, $mix, $grade.contrast))
  $md.Add('Скрипт — `tools/prepare-photos.ps1`.')
  $md.Add('')
  $md.Add('## Когда появятся настоящие фото')
  $md.Add('')
  $md.Add('Положить их в `tools/photos-raw/` под именами залов (`edge.jpg` … `unknown.jpg`)')
  $md.Add('и запустить `tools/prepare-photos.ps1`. Цветокоррекция останется той же.')
}
elseif ($source -eq 'commons') {
  $md.Add('# Авторы фотографий')
  $md.Add('')
  $md.Add('На странице залов стоят свободные фотографии с [Wikimedia Commons](https://commons.wikimedia.org/).')
  $md.Add(('**Изменения во всех кадрах:** кадрирование, уменьшение, тонировка {0} → {1} с долей {2},' -f $grade.shadow, $grade.highlight, $mix))
  $md.Add(('контраст ×{0}, виньетка. Настройки — `tools/photos.json` → `grade`, скрипт — `tools/prepare-photos.ps1`.' -f $grade.contrast))
  $md.Add('')
  $md.Add('| Кадр | Где на сайте | Автор | Лицензия | Оригинал |')
  $md.Add('|---|---|---|---|---|')
  foreach ($p in $manifest.photos) {
    if (-not $credits.ContainsKey($p.name)) { continue }
    $cr = $credits[$p.name]
    $lic = if ($cr.licenseUrl) { '[{0}]({1})' -f $cr.license, $cr.licenseUrl } else { $cr.license }
    $title = ($cr.title -replace '\.(jpe?g|png)$', '') -replace '\s*\(\d{8,}\)$', ''
    $srcUrl = $cr.source -replace '\(', '%28' -replace '\)', '%29'
    $md.Add(('| {0} | {1} | {2} | {3} | [{4}]({5}) |' -f $p.name, $p.where, (Short-Author $cr.author), $lic, ($title -replace '\|', '/'), $srcUrl))
  }
  $md.Add('')
  $md.Add('CC BY и CC BY-SA требуют указывать автора, лицензию и изменения; изменённая копия')
  $md.Add('кадра под CC BY-SA остаётся под CC BY-SA.')
}

if ($md.Count) {
  [System.IO.File]::WriteAllText((Join-Path $root 'CREDITS.md'), ($md -join "`n") + "`n", $utf8)
  "CREDITS.md: $source"
}
