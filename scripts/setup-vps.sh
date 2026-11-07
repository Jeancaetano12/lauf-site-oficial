#!/bin/bash
set -e

# ==============================================================================
# SCRIPT DE PROVISIONAMENTO INICIAL DA VPS (UBUNTU / DEBIAN / ORACLE CLOUD)
# Como usar:
# 1. Acesse sua VPS via SSH
# 2. Dê permissão de execução: chmod +x scripts/setup-vps.sh
# 3. Execute: sudo ./scripts/setup-vps.sh
# ==============================================================================

# Salvaguarda: Detecção de sessão SSH com escape explícito (D-15)
if [ -z "$SSH_CLIENT" ] && [ -z "$SSH_TTY" ] && [ "$1" != "--force-vps" ]; then
  echo "🚨 ALERTA DE SEGURANÇA: Nenhuma sessão SSH detectada!"
  echo "Este script instala serviços nativos (Nginx, Swap, etc.) e é exclusivo para a VPS."
  echo "Para forçar a execução localmente (ex: VM de teste), utilize: sudo ./scripts/setup-vps.sh --force-vps"
  exit 1
fi

# Identificação do usuário real não-root (D-18)
TARGET_USER="${SUDO_USER:-$USER}"

echo "🚀 Iniciando a preparação da VPS para o usuário: $TARGET_USER..."

echo "📦 1. Atualizando repositórios do sistema..."
sudo apt update && sudo apt upgrade -y

echo "🛠️ 2. Instalando ferramentas essenciais (Git, Curl, Nginx)..."
sudo apt install -y git curl unzip nginx software-properties-common

# Idempotência na configuração de Swap (D-17)
echo "💾 3. Configurando Swap de 2GB (Rede de segurança para memória)..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  fi
  echo "✅ Swap de 2GB ativado com sucesso!"
else
  echo "ℹ️ Swapfile já existente, mantendo configuração atual."
fi

# Padronização em Node.js 24 (D-16)
echo "🟢 4. Instalando Node.js (v24) e habilitando PNPM via Corepack..."
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@latest --activate

echo "🐳 5. Instalando Docker e Docker Compose..."
sudo apt install -y docker.io docker-compose-v2 || sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
# Adiciona o usuário real ao grupo docker para não precisar usar sudo em todo comando (D-18)
sudo usermod -aG docker "$TARGET_USER"

echo "🔒 6. Instalando Certbot (Para o certificado HTTPS / SSL gratuito)..."
sudo apt install -y certbot python3-certbot-nginx

# Permissões adequadas com o usuário alvo (D-18)
echo "📁 7. Preparando diretório seguro para a aplicação em /var/www..."
sudo mkdir -p /var/www/lauf-site-oficial
sudo chown -R "$TARGET_USER":www-data /var/www/lauf-site-oficial
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
