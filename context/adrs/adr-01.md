# ADR-01: Modernização do Monorepo (pnpm), Containerização do Backend, Segurança de Banco via SSH Tunnel e Preparação para Observabilidade (Oracle Cloud Free Tier)

- **Status:** Aceito
- **Data:** 17/10/2026
- **Decisores:** Jean Caetano / Arquitetura do Projeto LAUF

---

## 1. Contexto e Problema

O portal da **Liga de Arduino Uninassau Fortaleza (LAUF)** é estruturado como um monorepo contendo:
- `apps/frontend`: Single Page Application (SPA) em React 19, Vite e TailwindCSS v4.
- `apps/backend`: API REST em NestJS 11, Prisma 7 e PostgreSQL 15.
- `packages/shared` (`@lauf/shared`): Biblioteca interna compartilhada de Enums e contratos de domínio.

Originalmente, a infraestrutura e o ciclo de deploy foram desenhados para uma **VPS Linux restrita (1GB de RAM)** operando em um modelo híbrido:
1. **Gerenciador de Pacotes:** Utilizava `npm workspaces`, que apresentava alto consumo de memória RAM e disco durante instalações em servidor, além de permitir *phantom dependencies* devido ao *hoisting* frouxo.
2. **Banco de Dados:** O PostgreSQL 15 rodava em container Docker (`docker-compose.prod.yml`), porém com a porta `5432:5432` publicada em `0.0.0.0` (exposta diretamente para a internet pública, contornando regras de firewall UFW do sistema operacional) para permitir acesso externo via **DBeaver**.
3. **Backend (NestJS):** Compilado e executado diretamente no sistema operacional do host via **PM2** (`pm2 start dist/main.js`).
4. **Frontend (React/Vite):** Compilado em arquivos estáticos (`apps/frontend/dist`) e entregue diretamente pelo **Nginx** no host, que também realiza a terminação SSL (Certbot) e atua como proxy reverso (`/api/` -> `127.0.0.1:3000`).

Com a evolução do projeto e a **transição planejada da VPS de 1GB de RAM para uma instância na Oracle Cloud Free Tier (OCI)**, surgiram quatro necessidades arquiteturais:
1. **Portabilidade e Migração de Servidor:** Facilitar a mudança da VPS atual de 1GB para a VPS da Oracle Cloud Free Tier (incluindo compatibilidade transparente com instâncias `x86_64` e `ARM64 Ampere A1`).
2. **Prontidão para Observabilidade e Logs Profissionais:** Preparar o ambiente para coleta centralizada de logs estruturados, rotação automática de arquivos de log, *healthchecks* e métricas de containers (ex: Dozzle, Grafana Loki, Promtail, Prometheus).
3. **Segurança do Banco de Dados + Acesso via DBeaver:** Eliminar a exposição pública da porta `5432` na internet (e evitar a abertura da porta 5432 nas *Security Lists* da VCN da Oracle Cloud) sem perder a capacidade de análise de dados pelo **DBeaver**.
4. **Eficiência do Monorepo:** Adotar um gerenciador de pacotes moderno com isolamento estrito e suporte nativo a pacotes compartilhados (`@lauf/shared`).

---

## 2. Fatores de Decisão (Decision Drivers)

1. **Capacidade de Observabilidade Padrão de Mercado:** Integração nativa via Docker Socket (`/var/run/docker.sock`) para ferramentas de monitoramento e logs, com rotação automática em disco.
2. **Portabilidade Multi-VPS e Multi-Arquitetura:** Independência da versão do Node.js ou bibliotecas nativas do sistema operacional hospedeiro durante a migração para a Oracle Cloud Free Tier.
3. **Segurança por Padrão (Zero Trust na Camada de Dados):** Banco de dados inacessível pela internet pública, mantendo acesso administrativo seguro via túnel criptografado.
4. **Confiabilidade em Ambientes de Baixa ou Alta Memória:** Operar com segurança tanto na VPS legada de 1GB (com Swap e limites de container) quanto escalar recursos facilmente na Oracle Cloud Free Tier.

---

## 3. Opções Consideradas

### Opção A: Manter o Modelo Híbrido (Postgres no Docker + Backend no PM2 no Host)
- **Prós:**
  - Não exige a criação de um `Dockerfile` para a aplicação NestJS.
  - Consumo de memória marginalmente menor em repouso por não haver um segundo container.
- **Contras:**
  - **Observabilidade frágil:** O PM2 armazena logs em arquivos de texto locais (`/root/.pm2/logs/*.log`) sem rotação nativa por padrão, gerando risco de esgotamento de disco (100% de uso do SSD) e queda do banco de dados.
  - **Dificuldade de integração com ferramentas modernas:** Coletores como Dozzle, Promtail/Loki e cAdvisor não descobrem processos do PM2 automaticamente como fazem com containers Docker.
  - **Maior atrito na migração para a Oracle Cloud:** Exige provisionar e manter versões exatas do Node.js, PM2 e bibliotecas do sistema operacional diretamente no host.

### Opção B (Escolhida): Monorepo com `pnpm` + Backend Containerizado (`docker-compose.prod.yml`) + Acesso DBeaver via SSH Tunnel
- **Descrição:**
  - Migrar o monorepo de `npm` para **`pnpm`** (`pnpm-workspace.yaml`), criando o pacote interno `@lauf/shared`.
  - Empacotar o Backend NestJS em um **`Dockerfile` multi-stage** que resolve o workspace `pnpm`, compila `@lauf/shared`, gera o Prisma Client, compila o NestJS e produz uma imagem enxuta de produção (`node:20-alpine`).
  - Orquestrar **`postgres`** e **`backend`** juntos no `docker-compose.prod.yml` sob uma rede interna isolada (`lauf_network`), com *healthchecks*, limites de memória configurados e driver de log `json-file` com rotação automática (`max-size: "10m"`, `max-file: "3"`).
  - Aposentar o uso do **PM2**. O **Nginx** permanece no host servindo os arquivos estáticos de `apps/frontend/dist` e fazendo proxy reverso de `/api/` para `127.0.0.1:3000`.
  - Restringir o bind do PostgreSQL para `"127.0.0.1:5432:5432"` e realizar o acesso externo pelo **DBeaver** utilizando o recurso nativo de **SSH Tunnel** do próprio DBeaver.

---

## 4. Decisão

**Adotar a Opção B.**

### Justificativa Técnica

1. **Fundação Sólida para Observabilidade:**
   Com o Backend e o PostgreSQL rodando em containers Docker com rotação de logs nativa, o sistema impede o esgotamento de disco e permite plugar ferramentas como **Dozzle** (interface web de logs em tempo real com ~10MB de RAM) ou **Grafana Loki + Promtail** lendo diretamente o Docker Socket, sem configurações manuais de caminho de arquivo.
2. **Migração Transparente para a Oracle Cloud Free Tier:**
   A containerização completa da camada de aplicação e banco de dados garante que a mudança da VPS de 1GB para a Oracle Cloud Free Tier (seja em arquitetura `x86_64` ou `ARM64 Ampere A1`) ocorra sem incompatibilidades de binários (`bcrypt`, `prisma`) e permita aproveitar os recursos superiores da OCI basta ajustando os limites no `docker-compose.prod.yml`.
3. **Segurança no Acesso pelo DBeaver (SSH Tunnel):**
   Publicar o banco como `127.0.0.1:5432:5432` fecha completamente a porta 5432 na internet pública e dispensa abrir regras de firewall na VCN da Oracle Cloud. O uso da aba **SSH** nativa do DBeaver mantém 100% da usabilidade para análise de dados, trafegando de forma criptografada pela porta 22 (SSH).
4. **Proteção de Memória (Swap + `pnpm`):**
   A adoção do `pnpm` reduz drasticamente o consumo de RAM e disco, e o provisionamento automático de **2GB de Swap** no `scripts/setup-vps.sh` protege o servidor durante a execução do `docker compose build`.

---

## 5. Consequências

### Positivas
- **Orquestração Unificada:** Banco de dados e API gerenciados juntos via `docker compose -f docker-compose.prod.yml`.
- **Eliminação do PM2:** Menos uma ferramenta global para instalar, atualizar e monitorar no sistema operacional.
- **Isolamento de Rede:** Comunicação entre `backend` e `postgres` ocorre internamente na rede virtual do Docker (`postgres:5432`), expondo no loopback do host apenas `127.0.0.1:3000` (para o Nginx) e `127.0.0.1:5432` (para túnel SSH do DBeaver).
- **Portabilidade Imediata:** O `Dockerfile` multi-stage funciona de forma idêntica em qualquer servidor Linux (Ubuntu/Debian, x86_64 ou ARM64).

### Trade-offs Aceitos
- O processo de deploy (`scripts/deploy.sh`) passa a construir/atualizar a imagem Docker do backend (`docker compose -f docker-compose.prod.yml up -d --build`).
- Para conectar o **DBeaver** ao banco de produção, deve-se habilitar a aba **SSH** na configuração da conexão no DBeaver informando o IP e a chave/credencial SSH da VPS.
