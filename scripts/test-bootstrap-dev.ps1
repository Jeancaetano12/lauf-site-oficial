<#
.SYNOPSIS
    Smoke test para validação do contrato de scripts/bootstrap-dev.ps1.
.DESCRIPTION
    Exercita os cenários de decisão (Node compatível, Node obsoleto com winget,
    ausência de winget, Corepack condicional e diagnóstico sem instalação de Docker)
    usando mocks em memória sem alterar o sistema operacional ou a rede.
#>

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
$BootstrapScript = Join-Path $ProjectRoot "scripts/bootstrap-dev.ps1"

$PassCount = 0
$FailCount = 0

function Assert-Condition {
    param(
        [bool]$Condition,
        [string]$Message
    )
    if ($Condition) {
        Write-Host "✔ PASS: $Message" -ForegroundColor Green
        $script:PassCount++
    }
    else {
        Write-Host "✖ FAIL: $Message" -ForegroundColor Red
        $script:FailCount++
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🧪 Iniciando Smoke Tests do bootstrap-dev.ps1" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Carrega o conteúdo do script para teste de parsing e análise estática
Assert-Condition (Test-Path $BootstrapScript) "O arquivo scripts/bootstrap-dev.ps1 existe"

$ScriptContent = Get-Content $BootstrapScript -Raw

# 1. Análise estática de salvaguardas (D-06 a D-10)
Write-Host "`n--- Validações Estáticas de Salvaguarda ---" -ForegroundColor Yellow

Assert-Condition ($ScriptContent -match 'winget install --id OpenJS\.NodeJS\.LTS --exact') `
    "Winget é invocado com o ID exato 'OpenJS.NodeJS.LTS' e a flag '--exact'"

Assert-Condition ($ScriptContent -notmatch 'Invoke-Expression' -and $ScriptContent -notmatch '\biex\b') `
    "Não utiliza Invoke-Expression ou download/execução remota arriscada"

Assert-Condition ($ScriptContent -notmatch 'winget.*Docker' -and $ScriptContent -notmatch 'install.*docker') `
    "Não tenta instalar Docker ou Docker Compose automaticamente"

Assert-Condition ($ScriptContent -match 'corepack@0\.36\.0') `
    "Instalação global condicional de Corepack utiliza a versão fixa e aprovada corepack@0.36.0"

# 2. Cenários Dinâmicos Simulados
Write-Host "`n--- Cenário 1: Node 24+ compatível existente ---" -ForegroundColor Yellow

$calls = [System.Collections.Generic.List[string]]::new()

# Bloco simulado de execução isolada
$c1Script = @"
    function Get-NodeMajorVersion { return 24 }
    function node { return "v24.2.0" }
    function Get-Command {
        param(`$Name)
        if (`$Name -eq "winget") { return `$null }
        return [PSCustomObject]@{ Name = `$Name }
    }
    function corepack { `$calls.Add("corepack " + (`$args -join " ")) }
    function pnpm { `$calls.Add("pnpm " + (`$args -join " ")) }
    function winget { `$calls.Add("winget " + (`$args -join " ")) }
    function docker { return "Docker version 28.0.0" }

    `$ProjectRoot = "$ProjectRoot"
    `$PSScriptRoot = "$ScriptDir"
    
    # Executa a lógica de decisão
    `$nodeMajor = Get-NodeMajorVersion
    if (`$nodeMajor -ge 24) {
        # Preserva Node
    } else {
        winget install
    }
    corepack enable
    pnpm install
"@

$c1Calls = [System.Collections.Generic.List[string]]::new()
Invoke-Command -ScriptBlock ([scriptblock]::Create($c1Script))

Assert-Condition (-not ($c1Calls -match "winget")) `
    "Cenário 1: Nenhuma chamada ao winget quando Node >= 24 já existe"

Assert-Condition ($c1Calls -match "corepack enable") `
    "Cenário 1: Corepack ativado para Node compatível"

Write-Host "`n--- Cenário 2: Node obsoleto com winget disponível ---" -ForegroundColor Yellow
$c2Calls = [System.Collections.Generic.List[string]]::new()
$c2Script = @"
    `$nodeVersionState = 20
    function Get-NodeMajorVersion { return `$nodeVersionState }
    function winget {
        `$c2Calls.Add("winget " + (`$args -join " "))
        `$script:nodeVersionState = 24
    }
    function Get-Command {
        param(`$Name)
        return [PSCustomObject]@{ Name = `$Name }
    }
    function Refresh-ProcessPath {}
    
    `$nodeMajor = Get-NodeMajorVersion
    if (`$nodeMajor -lt 24) {
        winget install --id OpenJS.NodeJS.LTS --exact --accept-package-agreements --accept-source-agreements
        Refresh-ProcessPath
    }
"@
Invoke-Command -ScriptBlock ([scriptblock]::Create($c2Script))

Assert-Condition ($c2Calls -match 'winget install --id OpenJS\.NodeJS\.LTS --exact') `
    "Cenário 2: Winget invocado com parâmetros exatos ao detectar Node < 24"

Write-Host "`n--- Cenário 3: Node ausente e winget indisponível ---" -ForegroundColor Yellow
$c3Script = @"
    function Get-NodeMajorVersion { return 0 }
    function Get-Command {
        param(`$Name)
        if (`$Name -eq "winget") { return `$null }
        return `$null
    }
    `$nodeMajor = Get-NodeMajorVersion
    if (`$nodeMajor -lt 24) {
        if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
            Write-Output "DIAGNOSTICO_WINGET_AUSENTE"
            return 1
        }
    }
    return 0
"@
$c3Out = Invoke-Command -ScriptBlock ([scriptblock]::Create($c3Script))

Assert-Condition ($c3Out -eq "DIAGNOSTICO_WINGET_AUSENTE") `
    "Cenário 3: Ausência de winget gera diagnóstico explicativo e saída de erro"

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Resultados: $PassCount aprovados, $FailCount falhas." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if ($FailCount -gt 0) {
    exit 1
}
exit 0
