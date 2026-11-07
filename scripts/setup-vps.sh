#!/bin/bash

# ==============================================================================
# SCRIPT DE PROVISIONAMENTO INICIAL DA VPS (UBUNTU / DEBIAN / ORACLE CLOUD)
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

echo "💾 3. Configurando Swap de 2GB (Rede de segurança para memória)..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "✅ Swap de 2GB ativado com sucesso!"
else
  echo "ℹ️ Swapfile já existente, mantendo configuração atual."
fi

echo "🟢 4. Instalando Node.js (v24) e habilitando PNPM via Corepack..."
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@latest --activate

echo "🐳 5. Instalando Docker e Docker Compose..."
sudo apt install -y docker.io docker-compose-v2 || sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
# Adiciona o usuário atual ao grupo docker para não precisar usar sudo em todo comando
sudo usermod -aG docker $USER

echo "🔒 6. Instalando Certbot (Para o certificado HTTPS / SSL gratuito)..."
sudo apt install -y certbot python3-certbot-nginx

echo "📁 7. Preparando diretório seguro para a aplicação em /var/www..."
sudo mkdir -p /var/www/lauf-site-oficial
sudo chown -R $USER:www-data /var/www/lauf-site-oficial
sudo chmod -R 755 /var/www/lauf-site-oficial

echo "✅ Instalação concluída com sucesso!"
echo "--------------------------------------------------------"
echo "Versões Instaladas:"
git --version
node -v
pnpm -v
docker --version
docker compose version 2>/dev/null || docker-compose --version
nginx -v
echo "--------------------------------------------------------"
echo "⚠️ IMPORTANTE: Feche o terminal e conecte-se novamente na VPS para que as permissões do Docker funcionem."
echo "ℹ️ Próximo passo: clone o repositório em /var/www/lauf-site-oficial (evite a pasta /root por segurança)."
