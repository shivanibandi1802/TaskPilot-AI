param([int]$Port = 8080)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    $Port = 8081
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "TaskPilot AI server running at $prefix"
$baseDir = $PSScriptRoot

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        if ($urlPath -eq "api/config" -or $urlPath -eq "api/config/") {
            $supabaseUrl = $env:SUPABASE_URL
            $supabaseAnonKey = $env:SUPABASE_ANON_KEY

            $envFile = Join-Path $baseDir ".env"
            if (Test-Path $envFile) {
                Get-Content $envFile | ForEach-Object {
                    $line = $_.Trim()
                    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
                        $parts = $line.Split("=", 2)
                        $k = $parts[0].Trim()
                        $v = $parts[1].Trim()
                        if ($k -eq "SUPABASE_URL" -and -not $supabaseUrl) { $supabaseUrl = $v }
                        if ($k -eq "SUPABASE_ANON_KEY" -and -not $supabaseAnonKey) { $supabaseAnonKey = $v }
                    }
                }
            }

            $configObj = @{
                supabaseUrl = if ($supabaseUrl) { $supabaseUrl } else { "" }
                supabaseAnonKey = if ($supabaseAnonKey) { $supabaseAnonKey } else { "" }
            }
            $jsonStr = $configObj | ConvertTo-Json -Compress
            $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)

            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $jsonBytes.Length
            $response.AddHeader("Cache-Control", "no-cache")
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            $response.Close()
            continue
        }

        $decodedPath = [System.Uri]::UnescapeDataString($urlPath)
        $filePath = Join-Path $baseDir $decodedPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = $mimeTypes[$ext]
            if (-not $mime) { $mime = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Cache-Control", "no-cache")

            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $notFoundBytes.Length
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
            }
        }
        $response.Close()
    } catch {
        # Catch and continue on client drops
    }
}
