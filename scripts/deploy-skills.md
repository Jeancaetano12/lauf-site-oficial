# Padrões de Deploy para Produção

Este documento detalha as estratégias, a arquitetura e os scripts relacionados ao processo de implantação (Deploy) da aplicação na VPS de produção.

## 1. Estratégia de Branches (Git Flow)

A organização recomendada para o repositório é manter a branch `main` exclusiva para **código finalizado e testado**.
- **Desenvolvimento:** O trabalho do dia a dia deve ser realizado em branches independentes (ex: `feature/nome-da-feature`, `fix/correcao-bug`).
- **Produção:** Após a finalização e testes na branch de desenvolvimento, o código é mesclado (via Pull Request/Merge) na branch `main`.
- A VPS (Servidor de Produção) **apenas** deve puxar o código diretamente da branch `main`.

## 2. O Script de Deploy (`deploy.sh`)

Para evitar a execução manual de múltiplos passos e mitigar erros em ambiente de produção, utilizamos o script `deploy.sh` localizado na raiz desta pasta `scripts`.

**Como utilizar na VPS:**
Sempre que a branch `main` receber uma atualização, acesse a raiz do projeto no terminal da sua VPS e execute:
```bash
bash scripts/deploy.sh
```

**O que o script faz nos bastidores?**
1. **Pull Automatizado:** Executa `git checkout main` e `git pull origin main` para pegar o código mais recente.
2. **Dependências:** Executa `npm install` na raiz para instalar os pacotes (graças ao NPM Workspaces, isso resolve para backend e frontend).
3. **Prisma Migrate:** Roda `npx prisma migrate deploy` na pasta do backend para refletir eventuais atualizações da modelagem (`schema.prisma`) no banco de dados com total segurança, diferente do `migrate dev`.
4. **Build do Backend:** Roda o processo de compilação do NestJS (`npm run build`).
5. **Build do Frontend:** Roda a compilação final do Vite + React (`npm run build`), gerando as versões mais recentes dos arquivos visuais dentro da pasta `dist` (arquivos que o seu Nginx está servindo).
6. **Reload do PM2:** Reinicia o processo principal chamado `lauf-backend` no PM2 para aplicar a nova versão da API de forma imediata (evitando indisponibilidade prolongada).

## 3. Preparando o Terreno (Primeira vez na VPS)

Se esta for a primeira vez que você está subindo a aplicação no servidor, o script não fará tudo sozinho. Cumpra o roteiro inicial de preparação:

1. **Requisitos Essenciais:** Instale o Node.js (v20+), Git, Nginx e Docker na sua VPS.
2. **Globais do NPM:** Instale o gerenciador de processos PM2 de forma global (`npm install -g pm2`).
3. **Repositório:** Faça o `git clone` do repositório no seu servidor.
4. **Iniciando o Banco:** Suba o banco de dados Postgres usando seu container (`docker-compose up -d`).
5. **Iniciando a API no PM2:** Execute os passos de inicialização do backend apenas essa primeira vez manualmente:
   ```bash
   cd apps/backend
   npm install
   npx prisma migrate deploy
   npm run build
   pm2 start dist/src/main.js --name "lauf-backend"
   ```
6. **Configuração do Nginx (Proxy Reverso):**
   Edite a configuração do Nginx (normalmente em `/etc/nginx/sites-available/default`) para:
   - Apontar o seu diretório raiz (root) para a pasta compilada estática: `root /caminho/do/seu/projeto/apps/frontend/dist;`
   - Configurar o bloco `location /api/` que funcione como um **Proxy Reverso** (redirecionamento silencioso). Isso diz para o Nginx pegar chamadas da web para a API e enviá-las para a porta 3000 do PM2 localmente:
     ```nginx
     location /api/ {
         proxy_pass http://localhost:3000;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
     }
     ```
   - Lembre-se de reiniciar o Nginx após a configuração (`sudo systemctl restart nginx`).

Após essa preparação inicial, o seu dia a dia se resume puramente em aprovar as alterações na branch principal e rodar `bash scripts/deploy.sh` na VPS!
