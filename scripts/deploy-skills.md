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

Se esta for a primeira vez que você está configurando a VPS, boa parte do processo manual foi automatizado!

**SOLICITE** o documento **`vps-setup-guide.md`** a um dos responsáveis pelo projeto para ter acesso ao roteiro detalhado de `setup da VPS`.
A preparação inicial agora se resume a:

1. Executar o script **`setup-vps.sh`** para instalar automaticamente todas as dependências da máquina (Node.js, Docker, Nginx, PM2, Certbot, etc.).
2. Clonar o repositório utilizando uma chave SSH.
3. Configurar as variáveis de ambiente (`.env`).
4. Iniciar a infraestrutura primária (Banco de Dados, compilar a API no PM2 e fazer o build do Frontend).
5. Configurar o Nginx e gerar o certificado HTTPS gratuitamente com o Certbot.

Após essa preparação inicial (detalhada no guia), o seu dia a dia de atualizações da aplicação se resume puramente em garantir que as alterações estejam na branch `main` e rodar `bash scripts/deploy.sh` na raiz do projeto na VPS!
