# =============================================================================
# ЗОНА ПОЛУНОЧИ — подготовка силуэтов существ для фона погружения
# -----------------------------------------------------------------------------
# Исходники — линейные иллюстрации 2048x2048 на белом фоне, 200-400 КБ каждая.
# В таком виде на тёмный сайт их ставить нельзя: белый фон, чужой оттенок
# и вес в полмегабайта за одну декорацию. Скрипт для каждой картинки:
#
#   1. считает «насколько пиксель отличается от белого» — это будет прозрачность;
#   2. срезает слабый ореол (у рыбы свечение было запечено в картинку), чтобы
#      светились все существа одинаково — через CSS, а не каждое по-своему;
#   3. перекрашивает линии в фирменный циан #5FF2E4;
#   4. обрезает пустые поля и уменьшает до 640 px по длинной стороне —
#      этого хватает для экрана с двойной плотностью пикселей.
#
# Результат — assets/img/creatures/*.png.
#
# Запуск из папки проекта:
#     powershell -ExecutionPolicy Bypass -File tools\prepare-creatures.ps1
# Другая папка с исходниками:
#     powershell -ExecutionPolicy Bypass -File tools\prepare-creatures.ps1 -Source "D:\art"
#
# Путь к проекту берётся от самого скрипта: в нём есть кириллица, а PowerShell
# 5.1 читает строки в .ps1 без BOM как ANSI и такой путь испортил бы.
# =============================================================================

param(
  [string]$Source = (Join-Path $env:USERPROFILE 'Downloads\Telegram Desktop'),
  [int]$MaxSide = 520,
  # Ступени прозрачности. 256 — без потерь; 32 — под CSS-свечением разницы
  # не видно, а файл сжимается почти вдвое лучше
  [int]$AlphaLevels = 32
)

$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $project 'assets\img\creatures'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# Попиксельная обработка 2048x2048 в цикле PowerShell заняла бы минуты,
# поэтому само вычисление написано на C# и компилируется на лету.
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class CreatureArt
{
    public static string Convert(string src, string dst, int maxSide,
                                 int r, int g, int b, double lo, double hi, double padFrac, int levels)
    {
        double step = 255.0 / Math.Max(1, levels - 1);
        using (var bmp = new Bitmap(src))
        {
            int w = bmp.Width, h = bmp.Height;
            var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            var px = new byte[stride * h];
            Marshal.Copy(data.Scan0, px, 0, px.Length);
            bmp.UnlockBits(data);

            var alpha = new byte[w * h];
            int minX = w, minY = h, maxX = -1, maxY = -1;

            for (int y = 0; y < h; y++)
            {
                int row = y * stride;
                for (int x = 0; x < w; x++)
                {
                    int i = row + x * 4;
                    double A = px[i + 3] / 255.0;
                    // Смешиваем с белым: одинаково работает и для белого фона, и для прозрачного
                    double eb = A * px[i]     + (1 - A) * 255;
                    double eg = A * px[i + 1] + (1 - A) * 255;
                    double er = A * px[i + 2] + (1 - A) * 255;
                    double ink = 1.0 - Math.Min(er, Math.Min(eg, eb)) / 255.0;

                    double t = (ink - lo) / (hi - lo);
                    if (t < 0) t = 0; else if (t > 1) t = 1;
                    t = t * t * (3 - 2 * t);

                    byte a = (byte)Math.Round(t * 255);
                    alpha[y * w + x] = a;
                    if (a > 12)
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (maxX < 0) return "empty";

            int pad = (int)Math.Round(Math.Max(maxX - minX, maxY - minY) * padFrac);
            minX = Math.Max(0, minX - pad);  minY = Math.Max(0, minY - pad);
            maxX = Math.Min(w - 1, maxX + pad); maxY = Math.Min(h - 1, maxY + pad);
            int cw = maxX - minX + 1, ch = maxY - minY + 1;

            using (var full = new Bitmap(cw, ch, PixelFormat.Format32bppArgb))
            {
                var fd = full.LockBits(new Rectangle(0, 0, cw, ch), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                var outPx = new byte[fd.Stride * ch];
                for (int y = 0; y < ch; y++)
                {
                    for (int x = 0; x < cw; x++)
                    {
                        int o = y * fd.Stride + x * 4;
                        outPx[o] = (byte)b; outPx[o + 1] = (byte)g; outPx[o + 2] = (byte)r;
                        outPx[o + 3] = alpha[(y + minY) * w + (x + minX)];
                    }
                }
                Marshal.Copy(outPx, 0, fd.Scan0, outPx.Length);
                full.UnlockBits(fd);

                double scale = Math.Min(1.0, (double)maxSide / Math.Max(cw, ch));
                int ow = Math.Max(1, (int)Math.Round(cw * scale));
                int oh = Math.Max(1, (int)Math.Round(ch * scale));

                using (var outBmp = new Bitmap(ow, oh, PixelFormat.Format32bppArgb))
                {
                    using (var gr = Graphics.FromImage(outBmp))
                    using (var ia = new ImageAttributes())
                    {
                        // Цвет везде одинаковый, поэтому при сглаживании не появится
                        // тёмной каймы — смешиваются только прозрачности
                        gr.CompositingMode = CompositingMode.SourceCopy;
                        gr.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        gr.PixelOffsetMode = PixelOffsetMode.HighQuality;
                        ia.SetWrapMode(WrapMode.TileFlipXY);
                        gr.DrawImage(full, new Rectangle(0, 0, ow, oh), 0, 0, cw, ch, GraphicsUnit.Pixel, ia);
                    }

                    // После уменьшения ещё раз выставляем цвет и огрубляем прозрачность:
                    // меньше разных значений — лучше сжатие PNG
                    var od = outBmp.LockBits(new Rectangle(0, 0, ow, oh), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                    var op = new byte[od.Stride * oh];
                    Marshal.Copy(od.Scan0, op, 0, op.Length);
                    for (int i = 0; i < op.Length; i += 4)
                    {
                        byte a = (byte)Math.Min(255, Math.Round(Math.Round(op[i + 3] / step) * step));
                        op[i] = (byte)b; op[i + 1] = (byte)g; op[i + 2] = (byte)r; op[i + 3] = a;
                    }
                    Marshal.Copy(op, 0, od.Scan0, op.Length);
                    outBmp.UnlockBits(od);
                    outBmp.Save(dst, ImageFormat.Png);
                }
                return ow + "x" + oh;
            }
        }
    }
}
'@

# Порядок важен: «jellyfish» тоже содержит «fish», поэтому медуза ищется раньше рыбы
$map = @(
  @{ Pattern = '*jellyfish*';     Name = 'jellyfish' },
  @{ Pattern = '*seahorse*';      Name = 'seahorse'  },
  @{ Pattern = '*manta*';         Name = 'manta'     },
  @{ Pattern = '*crab*';          Name = 'crab'      },
  @{ Pattern = '*octopus*';       Name = 'octopus'   },
  @{ Pattern = '*deep-sea_fish*'; Name = 'fish'      }
)

$files = Get-ChildItem -Path $Source -File -Include *.png, *.jpg, *.jpeg -Recurse:$false -ErrorAction SilentlyContinue
if (-not $files) { $files = Get-ChildItem -Path (Join-Path $Source '*') -File -Include *.png, *.jpg, *.jpeg }

foreach ($item in $map) {
  $srcFile = $files | Where-Object { $_.Name -like $item.Pattern } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $srcFile) {
    Write-Output ("{0,-10} нет исходника по маске {1}" -f $item.Name, $item.Pattern)
    continue
  }
  $dst = Join-Path $outDir ($item.Name + '.png')
  $size = [CreatureArt]::Convert($srcFile.FullName, $dst, $MaxSide, 0x5F, 0xF2, 0xE4, 0.18, 0.72, 0.02, $AlphaLevels)
  $kb = [math]::Round((Get-Item $dst).Length / 1KB)
  Write-Output ("{0,-10} {1,-9} {2,4} КБ  <- {3}" -f $item.Name, $size, $kb, $srcFile.Name)
}
