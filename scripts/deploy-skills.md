# Padrões de Deploy para Produção

Este documento detalha as estratégias, a arquitetura e os scripts relacionados ao processo de implantação (Deploy) da aplicação na VPS de produção (Ubuntu / Debian / Oracle Cloud Free Tier).

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
2. **Dependências:** Executa `pnpm install --frozen-lockfile` na raiz para resolver dependências de todos os workspaces com velocidade e economia de RAM.
3. **Build do Pacote Compartilhado:** Compila `@lauf/shared` (`pnpm --filter @lauf/shared build`) para disponibilizar Enums e contratos para os demais pacotes.
4. **Build do Frontend:** Roda a compilação final do Vite + React (`pnpm --filter frontend build`), gerando a pasta `apps/frontend/dist` estática servida pelo Nginx.
5. **Containers Docker:** Sobe e atualiza os containers via `docker compose -f docker-compose.prod.yml up -d --build` (iniciando o PostgreSQL e a imagem Docker do backend NestJS).
6. **Prisma Migrate:** Executa `docker compose exec -T backend pnpm exec prisma migrate deploy` para aplicar migrations com segurança.

## 3. Preparando o Terreno (Primeira vez na VPS)

Na primeira configuração da VPS (Ubuntu tradicional ou Oracle Cloud Free Tier):

1. Executar o script **`setup-vps.sh`** para instalar automaticamente as dependências da máquina (Node.js 24, PNPM via Corepack, Docker, Docker Compose, Nginx, Certbot e Swap de 2GB).
2. Clonar o repositório em `/var/www/lauf-site-oficial` utilizando uma chave SSH (nunca na pasta `/root`, seguindo o padrão de segurança FHS).
3. Configurar as variáveis de ambiente (`.env` na raiz e `apps/backend/.env`).
4. Rodar `bash scripts/deploy.sh` em `/var/www/lauf-site-oficial` para subir o banco, a API no Docker e o build do frontend.
5. Configurar o Nginx (`nginx-poc.conf`) e gerar o certificado HTTPS gratuitamente com o Certbot.

## 4. Acesso ao Banco de Dados de Produção via DBeaver (SSH Tunnel)

Por segurança, o PostgreSQL roda com a porta vinculada exclusivamente em `127.0.0.1:5432:5432` no `docker-compose.prod.yml`, ficando invisível para scanners da internet pública.

**Como conectar com o DBeaver do seu computador:**
1. Na configuração de conexão do PostgreSQL no DBeaver, vá até a aba **SSH**.
2. Marque **Use SSH Tunnel**:
   - **Host/IP:** IP da VPS (ou domínio `laufoficial.site`)
   - **Port:** `22`
   - **User:** seu usuário SSH da VPS (`root` ou `ubuntu`)
   - **Authentication:** Senha ou Private Key da VPS.
3. Na aba **Main** do PostgreSQL:
   - **Host:** `127.0.0.1` (ou `localhost`)
   - **Port:** `5432`
   - **Database / User / Password:** credenciais do seu banco de dados.
4. Clique em **Test Connection** e conecte-se com total segurança!
