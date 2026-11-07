#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd -- "${SCRIPT_DIR}/.." && pwd)

cd "${PROJECT_ROOT}"

echo "=========================================================="
echo "🚀 LAUF - Bootstrap do Ambiente Local de Desenvolvimento"
echo "=========================================================="

# 1. Verificação do Node.js
get_node_major() {
  if command -v node >/dev/null 2>&1; then
    local v
    v=$(node -v 2>/dev/null || echo "")
    if [[ "${v}" =~ ^v([0-9]+) ]]; then
      echo "${BASH_REMATCH[1]}"
      return 0
    fi
  fi
  echo "0"
}

NODE_MAJOR=$(get_node_major)

if [ "${NODE_MAJOR}" -ge 24 ]; then
  echo "✔ Node.js compatível detectado: $(node -v) (>= 24)"
else
  if [ "${NODE_MAJOR}" -eq 0 ]; then
    echo "ℹ Node.js não foi encontrado no sistema."
  else
    echo "⚠ Node.js $(node -v) está abaixo da versão mínima exigida (>= 24)."
  fi

  echo "Iniciando provisionamento do Node.js 24 LTS..."

  # Validação do Sistema Operacional (restrito a Debian/Ubuntu)
  OS_RELEASE_FILE="${BOOTSTRAP_OS_RELEASE:-/etc/os-release}"
  if [ ! -f "${OS_RELEASE_FILE}" ]; then
    echo "🚨 ERRO: Não foi possível identificar a distribuição Linux (${OS_RELEASE_FILE} ausente)." >&2
    echo "Este script suporta provisionamento automático apenas em distribuições Debian ou Ubuntu." >&2
    echo "Por favor, instale o Node.js >= 24 manualmente: https://nodejs.org/" >&2
    exit 1
  fi

  IS_SUPPORTED_LINUX=false
  if grep -Eq '^(ID|ID_LIKE)=.*(ubuntu|debian)' "${OS_RELEASE_FILE}"; then
    IS_SUPPORTED_LINUX=true
  fi

  if [ "${IS_SUPPORTED_LINUX}" != "true" ] || ! command -v apt-get >/dev/null 2>&1; then
    echo "🚨 ERRO: Distribuição Linux ou gerenciador de pacotes não suportado automaticamente." >&2
    echo "O provisionamento automático requer Debian ou Ubuntu com gerenciador 'apt-get'." >&2
    echo "Por favor, instale o Node.js >= 24 manualmente usando o gerenciador de pacotes da sua distro: https://nodejs.org/" >&2
    exit 1
  fi

  if ! command -v curl >/dev/null 2>&1; then
    echo "Instalando curl..."
    sudo apt-get update
    sudo apt-get install -y curl
  fi

  echo "Baixando script de configuração oficial da NodeSource (Node 24.x)..."
  SETUP_SCRIPT_TMP=$(mktemp /tmp/nodesource_setup_XXXXXX.sh)
  curl -fsSL https://deb.nodesource.com/setup_24.x -o "${SETUP_SCRIPT_TMP}"
  
  echo "Executando script de repositório NodeSource..."
  sudo -E bash "${SETUP_SCRIPT_TMP}"
  rm -f "${SETUP_SCRIPT_TMP}"

  echo "Instalando nodejs..."
  sudo apt-get install -y nodejs

  # Revalidação
  NODE_MAJOR=$(get_node_major)
  if [ "${NODE_MAJOR}" -lt 24 ]; then
    echo "🚨 ERRO: Falha na validação do Node.js após instalação. Versão detectada: $(node -v 2>/dev/null || echo 'nenhuma')." >&2
    exit 1
  fi
  echo "✔ Node.js $(node -v) instalado com sucesso."
fi

# 2. Ativação e configuração do Corepack e pnpm
echo "Verificando Corepack..."
if ! command -v corepack >/dev/null 2>&1; then
  echo "Corepack ausente no runtime Node atual. Instalando versão aprovada (corepack@0.36.0)..."
  npm install -g corepack@0.36.0
fi

echo "Ativando Corepack..."
corepack enable

PACKAGE_PIN=""
if [ -f "package.json" ]; then
  PACKAGE_PIN=$(node -e "try { const p = require('./package.json').packageManager; if (p) process.stdout.write(p); } catch {}" 2>/dev/null || true)
fi

if [[ "${PACKAGE_PIN}" =~ ^pnpm@ ]]; then
  echo "Configurando pin oficial do gerenciador (${PACKAGE_PIN})..."
  corepack prepare "${PACKAGE_PIN}" --activate
else
  echo "⚠ Pin do packageManager não encontrado em package.json. Usando pnpm existente."
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "🚨 ERRO: pnpm não está acessível no PATH mesmo após ativação do Corepack." >&2
  exit 1
fi
echo "✔ pnpm operacional: v$(pnpm -v)"

# 3. Diagnóstico de Docker e Docker Compose (orientação apenas - sem instalação)
echo "----------------------------------------------------------"
echo "🔍 Diagnóstico de Contêineres (PostgreSQL Local)"
if command -v docker >/dev/null 2>&1; then
  echo "✔ Docker detectado: $(docker --version)"
  if docker compose version >/dev/null 2>&1; then
    echo "✔ Docker Compose detectado: $(docker compose version)"
  else
    echo "⚠ Docker Compose não encontrado."
    echo "  Para subir o banco de dados local com 'docker compose up -d postgres', instale o Docker Compose."
  fi
else
  echo "⚠ Docker não encontrado no PATH."
  echo "  O Docker é necessário para executar o banco de dados PostgreSQL localmente."
  echo "  Instalação do Docker: https://docs.docker.com/engine/install/"
fi

# 4. Instalação das dependências do monorepo
echo "----------------------------------------------------------"
echo "📦 Instalando dependências do projeto com pnpm..."
pnpm install

echo "=========================================================="
echo "✅ Bootstrap de desenvolvimento concluído com sucesso!"
echo "   Para iniciar o desenvolvimento:"
echo "     1. Suba o banco: docker compose up -d postgres"
echo "     2. Aplique migrações: pnpm db:migrate"
echo "     3. Popule dados: pnpm db:seed"
echo "     4. Inicie o servidor: pnpm dev"
echo "=========================================================="
