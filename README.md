# Lauf Site - Monorepo (Vite + NestJS + Shared)

Bem-vindo ao repositório do **Lauf Site**. Este projeto é organizado como um **Monorepo** moderno utilizando **PNPM Workspaces**.

## 🏗 Estrutura do Projeto

O ecossistema é dividido em aplicações e pacotes compartilhados:

```text
📁 root
├── 📁 apps
│   ├── 📁 frontend (React 19 + Vite + TailwindCSS v4)
│   └── 📁 backend  (NestJS 11 + Prisma 7 + PostgreSQL 15)
├── 📁 packages
│   └── 📁 shared   (@lauf/shared - Enums e contratos de domínio)
├── 📁 context
│   └── 📁 adrs     (Architecture Decision Records)
├── 📄 docker-compose.yml (Banco de Dados para Desenvolvimento)
├── 📄 docker-compose.prod.yml (PostgreSQL + Backend Containerizado)
├── 📄 pnpm-workspace.yaml (Configuração dos Workspaces)
└── 📄 package.json (Scripts globais do Monorepo)
```

### Regras Gerais e Cuidados
- **Gerenciamento de Pacotes**: Utilizamos **`pnpm`** (`corepack enable`). Executar `pnpm install` na raiz instalará e linkará as dependências de todos os workspaces.
- **Tipagem Compartilhada**: Enums (`Cargo`, `Curso`, `Genero`, `StatusAula`, etc.) e interfaces de DTO comuns residem no pacote `@lauf/shared` (`packages/shared`). Ambos os apps (`apps/frontend` e `apps/backend`) importam de `@lauf/shared`.

---

## 🛠 Comandos de Desenvolvimento

Siga os passos abaixo para configurar e rodar o projeto do zero:

### 1. Iniciar Banco de Dados (Docker)
Antes de rodar a API, certifique-se de que o banco de dados PostgreSQL está rodando. Na raiz do projeto:
```bash
docker compose up -d
# ou: docker-compose up -d
```

### 2. Configurar o Banco de Dados (Prisma)
Ao fazer pull do projeto ou alterações no `schema.prisma`, rode as *migrations* do Prisma:
```bash
pnpm --filter backend exec prisma migrate dev
```

### 3. Rodar a Aplicação
Você pode iniciar individualmente ou as duas simultaneamente a partir da raiz:

**Rodar tudo simultaneamente (Root):**
```bash
pnpm run dev
```

**Rodar apenas o Front-end:**
```bash
pnpm --filter frontend dev
```

**Rodar apenas o Back-end:**
```bash
pnpm --filter backend start:dev
```

**Rodar todos os testes unitários do backend:**
```bash
pnpm test
```

---

## 🚀 Ambiente de Produção (VPS / Oracle Cloud Free Tier)

Em produção, a aplicação roda com a seguinte arquitetura:

1. **Frontend (React + Vite - Estático)**: É gerado o build estático (`pnpm --filter frontend build`) dentro de `apps/frontend/dist`, servido diretamente pelo **Nginx** no host (com certificado SSL via Certbot). O Nginx faz o proxy reverso de `/api/` para `http://127.0.0.1:3000/`.
2. **Backend (NestJS - Container Docker)**: Roda em container isolado gerenciado pelo Docker Compose (`docker-compose.prod.yml`), expondo `127.0.0.1:3000` internamente.
3. **Database (Postgres 15 - Container Docker)**: Roda em container no `docker-compose.prod.yml` com a porta vinculada exclusivamente em `127.0.0.1:5432:5432` por segurança.
4. **Acesso com DBeaver**: Conexão realizada de forma segura do seu computador via **SSH Tunnel** nativo do DBeaver conectando na porta 22 da VPS e acessando `127.0.0.1:5432` internamente.
5. **Deploy Automatizado**: O processo de atualização está automatizado pelo script `bash scripts/deploy.sh`. Consulte [scripts/deploy-skills.md](./scripts/deploy-skills.md) para detalhes.
