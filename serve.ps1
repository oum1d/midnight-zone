# =============================================================================
# ЗОНА ПОЛУНОЧИ — мини-сервер статики на чистом PowerShell
# -----------------------------------------------------------------------------
# Сайт открывается двойным кликом по index.html и без сервера. Этот скрипт
# нужен для трёх вещей:
#   1) проверить sitemap.xml и robots.txt по настоящему http-адресу;
#   2) увидеть работу заголовков безопасности (они ниже — их же ставить
#      на реальном хостинге);
#   3) проверить страницу 404, которая на file:// не показывается.
#
# Запуск из папки проекта:
#     powershell -ExecutionPolicy Bypass -File serve.ps1
# Остановка: Ctrl+C
#
# Путь берётся от самого скрипта, а не прописан строкой: в пути есть кириллица,
# а PowerShell 5.1 читает .ps1 без BOM как ANSI и такую строку испортил бы.
# =============================================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8123

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Output "Port $port busy or blocked. Close the other server and retry."
    exit 1
}

Write-Output "http://localhost:$port/  ->  $root"
Write-Output "Ctrl+C to stop"

while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
        if ($path -eq '/') { $path = '/index.html' }

        $rel = $path.TrimStart('/') -replace '/', '\'
        $file = Join-Path $root $rel

        # Защита от выхода за пределы папки проекта (../../ в адресе)
        $full = [System.IO.Path]::GetFullPath($file)
        if (-not $full.StartsWith([System.IO.Path]::GetFullPath($root))) {
            $ctx.Response.StatusCode = 403
            $ctx.Response.Close()
            continue
        }

        if (Test-Path -LiteralPath $full -PathType Leaf) {
            switch ([System.IO.Path]::GetExtension($full).ToLower()) {
                '.html' { $type = 'text/html; charset=utf-8' }
                '.css'  { $type = 'text/css; charset=utf-8' }
                '.js'   { $type = 'application/javascript; charset=utf-8' }
                '.json' { $type = 'application/json; charset=utf-8' }
                '.svg'  { $type = 'image/svg+xml' }
                '.xml'  { $type = 'application/xml; charset=utf-8' }
                '.txt'  { $type = 'text/plain; charset=utf-8' }
                '.png'  { $type = 'image/png' }
                '.jpg'  { $type = 'image/jpeg' }
                '.webp' { $type = 'image/webp' }
                '.woff2' { $type = 'font/woff2' }
                default { $type = 'application/octet-stream' }
            }
            $bytes = [System.IO.File]::ReadAllBytes($full)
            $ctx.Response.StatusCode = 200
        } else {
            $bytes = [System.IO.File]::ReadAllBytes((Join-Path $root '404.html'))
            $type = 'text/html; charset=utf-8'
            $ctx.Response.StatusCode = 404
        }

        # ---------------------------------------------------------------------
        # Заголовки безопасности. Ровно те же нужно выставить на реальном
        # хостинге — в README есть версии для Nginx и Netlify.
        #
        # CSP разрешает шрифты Google и запрещает всё остальное внешнее.
        # 'unsafe-inline' для стилей нужен из-за <svg style> и inline-правил,
        # которые скрипт ставит на элементы; для скриптов он НЕ разрешён.
        # Метатегом CSP не ставится намеренно: на протоколе file:// источник
        # 'self' не совпадает ни с чем, и сайт перестал бы открываться
        # двойным кликом — а это одно из условий проекта.
        # ---------------------------------------------------------------------
        $csp = "default-src 'self'; " +
               "script-src 'self'; " +
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
               "font-src 'self' https://fonts.gstatic.com; " +
               "img-src 'self' data:; " +
               "connect-src 'self'; " +
               "object-src 'none'; " +
               "base-uri 'none'; " +
               "form-action 'self'; " +
               "frame-ancestors 'none'"

        $ctx.Response.Headers.Add('Content-Security-Policy', $csp)
        $ctx.Response.Headers.Add('X-Content-Type-Options', 'nosniff')
        $ctx.Response.Headers.Add('Referrer-Policy', 'strict-origin-when-cross-origin')
        $ctx.Response.Headers.Add('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()')
        $ctx.Response.Headers.Add('X-Frame-Options', 'DENY')

        $ctx.Response.ContentType = $type
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $ctx.Response.Close()
    } catch {
        Write-Output "err: $_"
    }
}
