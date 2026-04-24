# Lauf Site - Monorepo (Vite + NestJS)

Bem-vindo ao repositório do **Lauf Site**. Este projeto evoluiu para um ecossistema **Monorepo** utilizando o NPM Workspaces. Para manter o código limpo, organizado e permitir que diferentes desenvolvedores (e Agentes de IA) trabalhem no projeto sem conflitos, separamos o Front-end e o Back-end em diretórios distintos.

## 🏗 Estrutura do Projeto

A aplicação está contida no diretório `/apps`:

```text
📁 root
├── 📁 apps
│   ├── 📁 frontend (React + Vite + TailwindCSS)
│   └── 📁 backend  (NestJS + Prisma + PostgreSQL)
├── 📄 docker-compose.yml (Banco de Dados)
└── 📄 package.json (Gerenciador de Workspaces)
```

### Regras Gerais e Cuidados
- **Isolamento**: Nunca importe arquivos do `apps/frontend` dentro do `apps/backend` e vice-versa.
- **Gerenciamento de Pacotes**: Sendo um monorepo, executar `npm install` na raiz instalará e "linkará" as dependências de ambos os projetos garantindo compatibilidade.
- **Agent Skills**: Preparamos pastas dedicadas à documentação de padrões de código esperados (úteis para alinhamento da equipe e instruções para IAs). Consulte a pasta `docs/agent-skills` localizadas em cada aplicação (`apps/frontend/docs/agent-skills/` e `apps/backend/docs/agent-skills/`).

---

## 🛠 Comandos de Desenvolvimento

Siga os passos abaixo para configurar e rodar o projeto do zero:

### 1. Iniciar Banco de Dados (Docker)
Antes de rodar a API, certifique-se de que o banco de dados PostgreSQL está rodando. Na raiz do projeto:
```bash
docker-compose up -d
```
Verifique se o container `postgres_db` subiu com sucesso rodando `docker ps`.

### 2. Configurar o Banco de Dados (Prisma)
Ao fazer pull do projeto ou alterações no `schema.prisma`, rode as *migrations* do Prisma para garantir que as tabelas (como `Usuario`) sejam geradas/atualizadas corretamente.
```bash
cd apps/backend
npx prisma migrate dev
```

### 3. Rodar a Aplicação
Você pode iniciar individualmente ou as duas simultaneamente a partir da raiz:

**Rodar tudo simultaneamente (Root):**
```bash
# Na rota principal, isso utilizará a flag --workspaces para incializar em paralelo
npm run dev
```

**Rodar apenas o Front-end:**
```bash
cd apps/frontend
npm run dev
```

**Rodar apenas o Back-end:**
```bash
cd apps/backend
npm run start:dev
```

---

## 📝 Documentação Exclusiva por Aplicação

Para saber como criar *Componentes* ou *Rotas*, você deve seguir rigorosamente as regras exclusivas de cada tecnologia descritas aqui:

- ➡ [Padrões do Back-end / Prisma](./apps/backend/docs/agent-skills/backend-patterns.md)
- ➡ [Padrões do Front-end / React](./apps/frontend/docs/agent-skills/frontend-patterns.md)
