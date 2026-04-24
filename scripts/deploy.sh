#!/bin/bash

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
echo "🗄️ Atualizando banco de dados (Prisma Migrate Deploy)..."
cd apps/backend
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
# Certifique-se de que o backend foi iniciado a primeira vez com: 
# pm2 start apps/backend/dist/src/main.js --name "lauf-backend"
echo "🔄 Reiniciando o Backend (PM2)..."
pm2 restart lauf-backend || echo "⚠️ PM2 não encontrou o processo 'lauf-backend'. Se for a primeira vez, inicie com: pm2 start apps/backend/dist/src/main.js --name lauf-backend"

echo "✅ Deploy concluído com sucesso!"
echo "Lembre-se: O Frontend (pasta apps/frontend/dist) já deve estar sendo servido pelo seu Nginx."
