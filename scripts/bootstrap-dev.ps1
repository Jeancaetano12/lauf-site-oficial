<#
.SYNOPSIS
    Bootstrap do ambiente de desenvolvimento local para Windows (PowerShell).
.DESCRIPTION
    Verifica e provisiona Node.js >= 24 via winget, ativa Corepack/pnpm no pin do projeto
    e diagnostica Docker/Compose sem instalar ferramentas adicionais.
#>

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 LAUF - Bootstrap do Ambiente de Desenvolvimento (Windows)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

function Get-NodeMajorVersion {
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $rawVersion = & node -v 2>$null
        if ($rawVersion -match '^v?(\d+)') {
            return [int]$Matches[1]
        }
    }
    return 0
}

function Refresh-ProcessPath {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
    $combinedPath = @($userPath, $machinePath) -join ";"
    $env:Path = $combinedPath
}

# 1. Verificação do Node.js
$nodeMajor = Get-NodeMajorVersion

if ($nodeMajor -ge 24) {
    $currentNodeVersion = & node -v
    Write-Host "✔ Node.js compatível detectado: $currentNodeVersion (>= 24)" -ForegroundColor Green
}
else {
    if ($nodeMajor -eq 0) {
        Write-Host "ℹ Node.js não foi encontrado no sistema." -ForegroundColor Yellow
    }
    else {
        $currentNodeVersion = & node -v
        Write-Host "⚠ Node.js $currentNodeVersion está abaixo da versão mínima exigida (>= 24)." -ForegroundColor Yellow
    }

    Write-Host "Iniciando provisionamento do Node.js 24 LTS via winget..." -ForegroundColor Cyan

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Host "🚨 ERRO: O gerenciador 'winget' (Windows Package Manager) não foi encontrado no sistema." -ForegroundColor Red
        Write-Host "Para continuar, instale o App Installer da Microsoft Store ou instale o Node.js >= 24 manualmente." -ForegroundColor Red
        Write-Host "Download oficial do Node.js: https://nodejs.org/" -ForegroundColor Red
        exit 1
    }

    Write-Host "Executando: winget install --id OpenJS.NodeJS.LTS --exact..." -ForegroundColor Cyan
    & winget install --id OpenJS.NodeJS.LTS --exact --accept-package-agreements --accept-source-agreements

    # Atualiza o PATH da sessão atual
    Refresh-ProcessPath

    $newNodeMajor = Get-NodeMajorVersion
    if ($newNodeMajor -lt 24) {
        Write-Host "⚠ Node.js >= 24 foi instalado, mas ainda não está acessível na sessão atual do terminal." -ForegroundColor Yellow
        Write-Host "Por favor, feche este terminal, abra um novo PowerShell e execute este script novamente." -ForegroundColor Yellow
        exit 1
    }

    $newNodeVersion = & node -v
    Write-Host "✔ Node.js $newNodeVersion provisionado com sucesso." -ForegroundColor Green
}

# 2. Ativação e configuração do Corepack e pnpm
Write-Host "Verificando Corepack..." -ForegroundColor Cyan
if (-not (Get-Command corepack -ErrorAction SilentlyContinue)) {
    Write-Host "Corepack ausente no runtime Node atual. Instalando versão aprovada (corepack@0.36.0)..." -ForegroundColor Yellow
    & npm install -g corepack@0.36.0
}

Write-Host "Ativando Corepack..." -ForegroundColor Cyan
& corepack enable

$packagePin = ""
$packageJsonPath = Join-Path $ProjectRoot "package.json"
if (Test-Path $packageJsonPath) {
    try {
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        $packagePin = $packageJson.packageManager
    }
    catch {
        # Fallback silencioso
    }
}

if ($packagePin -and $packagePin -match '^pnpm@') {
    Write-Host "Configurando pin oficial do gerenciador ($packagePin)..." -ForegroundColor Cyan
    & corepack prepare "$packagePin" --activate
}
else {
    Write-Host "⚠ Pin do packageManager não encontrado em package.json. Usando pnpm existente." -ForegroundColor Yellow
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "🚨 ERRO: pnpm não está acessível no PATH mesmo após ativação do Corepack." -ForegroundColor Red
    exit 1
}

$pnpmVersion = & pnpm -v
Write-Host "✔ pnpm operacional: v$pnpmVersion" -ForegroundColor Green

# 3. Diagnóstico de Docker e Docker Compose (orientação apenas - sem instalação)
Write-Host "----------------------------------------------------------"
Write-Host "🔍 Diagnóstico de Contêineres (PostgreSQL Local)" -ForegroundColor Cyan
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVer = & docker --version
    Write-Host "✔ Docker detectado: $dockerVer" -ForegroundColor Green

    $composeVer = & docker compose version 2>$null
    if ($LASTEXITCODE -eq 0 -and $composeVer) {
        Write-Host "✔ Docker Compose detectado: $composeVer" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ Docker Compose não encontrado." -ForegroundColor Yellow
        Write-Host "  Para subir o banco local com 'docker compose up -d postgres', certifique-se de habilitar o Docker Compose no Docker Desktop." -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠ Docker não encontrado no PATH." -ForegroundColor Yellow
    Write-Host "  O Docker Desktop é necessário para executar o banco de dados PostgreSQL localmente no Windows." -ForegroundColor Yellow
    Write-Host "  Instalação do Docker Desktop: https://docs.docker.com/desktop/setup/install/windows-install/" -ForegroundColor Yellow
}

# 4. Instalação das dependências do monorepo
Write-Host "----------------------------------------------------------"
Write-Host "📦 Instalando dependências do projeto com pnpm..." -ForegroundColor Cyan
& pnpm install

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "✅ Bootstrap de desenvolvimento concluído com sucesso!" -ForegroundColor Green
Write-Host "   Para iniciar o desenvolvimento:" -ForegroundColor Green
Write-Host "     1. Suba o banco: docker compose up -d postgres" -ForegroundColor Green
Write-Host "     2. Aplique migrações: pnpm db:migrate" -ForegroundColor Green
Write-Host "     3. Popule dados: pnpm db:seed" -ForegroundColor Green
Write-Host "     4. Inicie o servidor: pnpm dev" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
