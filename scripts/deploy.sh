#!/bin/bash
set -e # Aborta o script no primeiro erro encontrado, evitando deploys incompletos

# Script de Deploy para VPS (Ubuntu / Debian / Oracle Cloud)
# Este script deve ser executado na raiz do projeto na VPS sempre que houver atualização na branch main.

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
if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  docker compose -f docker-compose.prod.yml up -d --build
  echo "🗄️ 6. Aplicando migrations do Prisma no banco de produção..."
  docker compose -f docker-compose.prod.yml exec -T backend pnpm exec prisma migrate deploy
else
  docker-compose -f docker-compose.prod.yml up -d --build
  echo "🗄️ 6. Aplicando migrations do Prisma no banco de produção..."
  docker-compose -f docker-compose.prod.yml exec -T backend pnpm exec prisma migrate deploy
fi

echo "✅ Deploy concluído com sucesso!"
echo "Lembre-se: O Frontend (pasta apps/frontend/dist) está sendo servido pelo Nginx,"
echo "e o Backend está rodando em container isolado na porta 127.0.0.1:3000."
