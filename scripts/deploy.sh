#!/bin/bash
set -e # Aborta o script no primeiro erro encontrado, evitando deploys incompletos

# Script de Deploy para VPS (Ubuntu / Debian / Oracle Cloud)
# Este script deve ser executado exclusivamente na raiz do projeto na VPS sempre que houver atualização na branch main.
# Uso obrigatório: bash scripts/deploy.sh --prod

# ==============================================================================
# SALVAGUARDAS OPERACIONAIS PRÉ-DEPLOY
# ==============================================================================

# 1. Trava obrigatória de argumento --prod (D-08)
if [ "$1" != "--prod" ]; then
  echo "❌ ERRO: Para executar o deploy em produção, use explicitamente: bash scripts/deploy.sh --prod"
  echo "⚠️ Esta salvaguarda impede execuções acidentais na sua máquina local de desenvolvimento."
  exit 1
fi

# 2. Bloqueio estrito de execução como root / sudo (D-09)
if [ "$EUID" -eq 0 ]; then
  echo "❌ ERRO: Não execute o deploy como root ou com sudo."
  echo "ℹ️ Execute como o usuário comum da VPS pertencente ao grupo docker para evitar problemas de permissão nos arquivos compilados."
  exit 1
fi

# 3. Verificação de integridade do Git (D-10)
echo "🔍 Verificando integridade do repositório Git..."
if ! git diff-index --quiet HEAD --; then
  echo "❌ ERRO: Existem modificações locais não commitadas ou branch suja."
  echo "Abortando o deploy para evitar descarte acidental de trabalho."
  exit 1
fi

# 4. Pré-validação de variáveis de ambiente (D-11)
echo "🔒 Validando variáveis de ambiente em apps/backend/.env..."
if [ ! -f "apps/backend/.env" ]; then
  echo "❌ ERRO: Arquivo apps/backend/.env não encontrado!"
  exit 1
fi

if grep -q "suasenhasupersecreta" apps/backend/.env || grep -q "gere_um_segredo_jwt_longo_e_seguro" apps/backend/.env; then
  echo "❌ ERRO: O arquivo apps/backend/.env contém valores de exemplo/placeholders inseguros!"
  exit 1
fi

if [ -f ".env" ] && grep -q "suasenhasupersecreta" .env; then
  echo "❌ ERRO: O arquivo .env na raiz contém valores de exemplo/placeholders inseguros ('suasenhasupersecreta')!"
  exit 1
fi

# ==============================================================================
# FLUXO DE EXECUÇÃO DO DEPLOY
# ==============================================================================

echo "🚀 Iniciando processo de deploy..."

# 1. Puxar as últimas alterações do repositório (Branch Main)
echo "📥 1. Atualizando código da branch main..."
git checkout main
git pull origin main

# 2. Instalar dependências (Monorepo pnpm)
echo "📦 2. Instalando dependências com pnpm..."
pnpm install --frozen-lockfile

# 3. Build do Pacote Compartilhado (@lauf/shared)
echo "🧱 3. Compilando o pacote compartilhado (@lauf/shared)..."
pnpm --filter @lauf/shared build

# 4. Build do Frontend (Vite + React)
echo "🎨 4. Compilando o Frontend (React + Vite)..."
pnpm --filter frontend build

# 5. Build e Inicialização dos Containers (Backend NestJS + PostgreSQL)
echo "🐳 5. Subindo/atualizando containers com Docker Compose..."
COMPOSE_CMD="docker compose -f docker-compose.prod.yml"
if ! command -v docker &>/dev/null || ! docker compose version &>/dev/null; then
  COMPOSE_CMD="docker-compose -f docker-compose.prod.yml"
fi

$COMPOSE_CMD up -d --build

# 6. Migração do Prisma com diagnóstico de logs em caso de falha (D-12)
echo "🗄️ 6. Aplicando migrations do Prisma no banco de produção..."
if ! $COMPOSE_CMD exec -T backend pnpm exec prisma migrate deploy; then
  echo "❌ ERRO FATAL: Falha ao aplicar migrations no banco de dados!"
  echo "📋 Exibindo as últimas 50 linhas dos logs do backend para diagnóstico:"
  $COMPOSE_CMD logs --tail=50 backend
  exit 1
fi

# 7. Smoke test HTTP pós-deploy (D-13)
echo "🩺 7. Executando smoke test HTTP na API (aguardando resposta em http://127.0.0.1:3000/)..."
SUCCESS=0
for i in $(seq 1 10); do
  if curl -sf http://127.0.0.1:3000/ > /dev/null 2>&1; then
    SUCCESS=1
    break
  fi
  echo "⏳ Tentativa $i/10: aguardando subida da API... (3s)"
  sleep 3
done

if [ $SUCCESS -ne 1 ]; then
  echo "⚠️ ALERTA: A API não respondeu com HTTP 200 dentro de 30 segundos no loopback 127.0.0.1:3000."
  echo "📋 Verifique os logs com: $COMPOSE_CMD logs --tail=50 backend"
  exit 1
fi

echo "✅ Deploy concluído com sucesso!"
echo "Lembre-se: O Frontend (pasta apps/frontend/dist) está sendo servido pelo Nginx,"
echo "e o Backend está rodando em container isolado na porta 127.0.0.1:3000."
