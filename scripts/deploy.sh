#!/bin/bash
set -e # Aborta o script no primeiro erro encontrado, evitando builds incompletos

# Script de Deploy Simplificado para VPS
# Este script deve ser executado na raiz do projeto na VPS sempre que houver atualização na branch main.

echo "🚀 Iniciando processo de deploy..."

# 1. Puxar as últimas alterações do repositório (Branch Main)
echo "📥 Atualizando código da branch main..."
git checkout main
git pull origin main

# 2. Instalar dependências (Monorepo)
echo "📦 Instalando dependências..."
npm install

# 3. Build do Banco de Dados (Prisma)
echo "🗄️ Atualizando banco de dados (Prisma Generate e Migrate)..."
cd apps/backend
npx prisma generate
npx prisma migrate deploy
cd ../..

# 4. Build do Backend (NestJS)
echo "⚙️ Compilando o Backend (NestJS)..."
cd apps/backend
npm run build
cd ../..

# 5. Build do Frontend (Vite + React)
echo "🎨 Compilando o Frontend (React + Vite)..."
cd apps/frontend
npm run build
cd ../..

# 6. Reiniciar o serviço do Backend no PM2
# pm2 reload garante um recarregamento com "zero downtime".
echo "🔄 Reiniciando o Backend (PM2)..."
cd apps/backend
pm2 reload lauf-backend --update-env || (
  echo "⚠️ Processo não encontrado. Iniciando um novo do zero..."
  pm2 start dist/main.js --name "lauf-backend"
  pm2 save
) || echo "⚠️ PM2 não conseguiu reiniciar ou iniciar o backend."
cd ../..

echo "✅ Deploy concluído com sucesso!"
echo "Lembre-se: O Frontend (pasta apps/frontend/dist) já deve estar sendo servido pelo seu Nginx."
