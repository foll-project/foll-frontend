param(
    [string]$EnvFile = "env/deploy.env",
    [switch]$LbOnly
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $Root "..")

function Invoke-Gcloud {
    param(
        [Parameter(Mandatory)][string[]]$Arguments,
        [switch]$AllowFailure,
        [switch]$Quiet
    )

    $previousEap = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    $output = & gcloud @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousEap

    if (-not $Quiet) {
        foreach ($line in $output) {
            if ($line -is [System.Management.Automation.ErrorRecord]) {
                if (-not $AllowFailure) { Write-Host $line.ToString() }
            } elseif ($null -ne $line -and "$line".Length -gt 0) {
                Write-Host $line
            }
        }
    }

    if ($exitCode -ne 0 -and -not $AllowFailure) {
        throw "gcloud fallo (exit $exitCode): gcloud $($Arguments -join ' ')"
    }

    return ($exitCode -eq 0)
}

function Get-CloudRunHost {
    param([string]$Service)
    $previousEap = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    $url = gcloud run services describe $Service --project $GCP_PROJECT --region $GCP_REGION --format="value(status.url)" 2>$null
    $ErrorActionPreference = $previousEap
    if ([string]::IsNullOrWhiteSpace($url)) { throw "No se pudo obtener URL de $Service" }
    return ($url -replace '^https?://', '' -replace '/$', '')
}

if (-not (Test-Path $EnvFile)) {
    Write-Error "No existe $EnvFile"
}

Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    if ($_ -match '^\s*([^=]+)=(.*)$') {
        Set-Variable -Name $matches[1] -Value $matches[2] -Scope Script
    }
}

if (-not $GCP_PROJECT) { throw "GCP_PROJECT no definido en $EnvFile" }
if (-not $KRAKEND_HOST) { throw "KRAKEND_HOST no definido en $EnvFile" }

$Region = if ($GCP_REGION) { $GCP_REGION } else { "southamerica-east1" }
$Tag = if ($FRONTEND_TAG) { $FRONTEND_TAG } else { "prod" }
$FrontendImage = if ($FRONTEND_IMAGE) { $FRONTEND_IMAGE } else { "foll-frontend" }
$LbImage = if ($LB_IMAGE) { $LB_IMAGE } else { "foll-frontend-lb" }
$LbService = if ($LB_SERVICE) { $LB_SERVICE } else { "foll-frontend-lb" }

$Registry = "$Region-docker.pkg.dev/$GCP_PROJECT/foll"
$FrontendRemote = "$Registry/${FrontendImage}:$Tag"
$LbRemote = "$Registry/${LbImage}:$Tag"

if (-not $LbOnly) {
    Write-Host ">> Build imagen frontend (USE_LOCAL_STACK=false en stack.config.ts)"
    docker build -f dockerfile -t "${FrontendImage}:$Tag" .

    Write-Host ">> Push $FrontendRemote"
    docker tag "${FrontendImage}:$Tag" $FrontendRemote
    docker push $FrontendRemote

    foreach ($n in 1..3) {
        $svc = "foll-frontend-$n"
        Write-Host ">> Deploy Cloud Run $svc"
        Invoke-Gcloud -Arguments @(
            "run", "deploy", $svc,
            "--project", $GCP_PROJECT,
            "--image", $FrontendRemote,
            "--region", $Region,
            "--platform", "managed",
            "--port", "80",
            "--allow-unauthenticated"
        )
    }
} else {
    Write-Host ">> Modo -LbOnly: omitiendo build/deploy de foll-frontend-1/2/3"
}

$host1 = Get-CloudRunHost "foll-frontend-1"
$host2 = Get-CloudRunHost "foll-frontend-2"
$host3 = Get-CloudRunHost "foll-frontend-3"

Write-Host ">> Generar nginx LB cloud ($host1, $host2, $host3)"
$template = Get-Content "nginx/nginx.prod.cloud.template.conf" -Raw
$nginxConf = $template `
    -replace '__FRONTEND_1_HOST__', $host1 `
    -replace '__FRONTEND_2_HOST__', $host2 `
    -replace '__FRONTEND_3_HOST__', $host3 `
    -replace '__KRAKEND_HOST__', $KRAKEND_HOST
Set-Content -Path "nginx/nginx.prod.cloud.conf" -Value $nginxConf -NoNewline

Write-Host ">> Build imagen load-balancer"
docker build -f nginx/Dockerfile.lb.cloud -t "${LbImage}:$Tag" ./nginx

Write-Host ">> Push $LbRemote"
docker tag "${LbImage}:$Tag" $LbRemote
docker push $LbRemote

Write-Host ">> Deploy Cloud Run $LbService (publico)"
Invoke-Gcloud -Arguments @(
    "run", "deploy", $LbService,
    "--project", $GCP_PROJECT,
    "--image", $LbRemote,
    "--region", $Region,
    "--platform", "managed",
    "--port", "8080",
    "--allow-unauthenticated"
)

$previousEap = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
$publicUrl = gcloud run services describe $LbService --project $GCP_PROJECT --region $Region --format="value(status.url)" 2>$null
$ErrorActionPreference = $previousEap

Write-Host ""
Write-Host "Deploy frontend completado."
Write-Host "URL publica (load balancer): $publicUrl"
Write-Host ""
Write-Host "IMPORTANTE - SignalR CORS en backend Azure:"
$corsOrigins = "http://localhost:5173,https://foll-frontend.vercel.app,$publicUrl"
Write-Host ('  az webapp config appsettings set --name foll-backend-upc --resource-group rg-foll-prod --settings Cors__AllowedOrigins="' + $corsOrigins + '"')
Write-Host "  az webapp restart --name foll-backend-upc --resource-group rg-foll-prod"
