#!/bin/bash

# ==============================================================================
# SCRIPT DE PROVISIONAMENTO INICIAL DA VPS (UBUNTU / DEBIAN)
# Como usar:
# 1. Acesse sua VPS via SSH
# 2. Crie um arquivo com: nano setup-vps.sh
# 3. Cole este código dentro dele e salve
# 4. Dê permissão: chmod +x setup-vps.sh
# 5. Execute: sudo ./setup-vps.sh
# ==============================================================================

echo "🚀 Iniciando a preparação da VPS..."

echo "📦 1. Atualizando repositórios do sistema..."
sudo apt update && sudo apt upgrade -y

echo "🛠️ 2. Instalando ferramentas essenciais (Git, Curl, Nginx)..."
sudo apt install -y git curl unzip nginx software-properties-common

echo "🟢 3. Instalando Node.js (v20) e NPM..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "⚙️ 4. Instalando o PM2 globalmente..."
sudo npm install -g pm2

echo "🐳 5. Instalando Docker e Docker Compose..."
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
# Adiciona o usuário atual ao grupo docker para não precisar usar sudo em todo comando
sudo usermod -aG docker $USER

echo "🔒 6. Instalando Certbot (Para o certificado HTTPS / SSL gratuito)..."
sudo apt install -y certbot python3-certbot-nginx

echo "✅ Instalação concluída com sucesso!"
echo "--------------------------------------------------------"
echo "Versões Instaladas:"
git --version
node -v
npm -v
docker --version
pm2 -v
nginx -v
echo "--------------------------------------------------------"
echo "⚠️ IMPORTANTE: Feche o terminal e conecte-se novamente na VPS para que as permissões do Docker funcionem."
