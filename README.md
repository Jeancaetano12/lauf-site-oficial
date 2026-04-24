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

## 🚀 Ambiente de Produção (VPS com Recursos Limitados)

Sendo uma aplicação que rodará em um ambiente internetizado e com recursos regrados (como uma VPS básica vCPU e alguns gigas de RAM/Disco), **é expressamente proibido** subir a aplicação da mesma forma que fazemos o ambiente de Desenvolvimento (`npm run dev`).

**Cuidados Primordiais e Arquitetura na VPS:**

Em produção, o Frontend e o Backend assumem papéis independentes e se comunicam através de um servidor Web (Proxy Reverso):

1. **Frontend (React + Vite - Estático)**: NUNCA utilize o script `dev` do Vite em produção. Você executará o `npm run build` na pasta do frontend para gerar uma pasta `dist` estática contendo HTML/CSS/JS. Esse pacote não roda um processo Node.js; ele é apenas entregue por um servidor web leve, como o **Nginx** (custo de memória < 15MB RAM). O Nginx escuta a porta 80/443 e entrega as telas diretamente aos visitantes.
2. **Backend (NestJS - Background Process)**: O Nest é compilado rodando `npm run build` na pasta backend, gerando JavaScript puro na pasta `dist`. Em vez de rodar no modo dev, executamos a API em segundo plano usando um gerenciador de processos nativo como o **PM2** (ex: `pm2 start dist/main.js`). Ele ficará rodando em uma porta interna (como a 3000), garantindo auto-restart e baixo consumo.
3. **Comunicação (A Mágica do Proxy Reverso)**: Para que o site (servido estaticamente) consiga acessar a API (rodando internamente no PM2), o **Nginx** atua como intermediário. Ele é configurado de forma que requisições para a rota `/api` (ou qualquer endpoint do seu backend) sejam redirecionadas automaticamente e de forma transparente para a porta do seu PM2.
4. **Database (Prisma + Postgres)**: Rodará via Docker Compose. Em sua VPS, evite que o container Docker do PostgreSQL coma a memória usando limites (`mem_limit`). Ao invés de rodar `migrate dev`, executamos **apenas** `npx prisma migrate deploy` para aplicar com segurança as atualizações na estrutura do banco.

> **💡 Dica de Deploy Automatizado:** O processo de deploy está documentado e automatizado pelo script `deploy.sh`. Consulte a documentação na pasta `scripts/` para entender como colocar atualizações em produção.

---

## 📝 Documentação Exclusiva por Aplicação

Para saber como criar *Componentes* ou *Rotas*, você deve seguir rigorosamente as regras exclusivas de cada tecnologia descritas aqui:

- ➡ [Padrões do Back-end / Prisma](./apps/backend/docs/agent-skills/backend-patterns.md)
- ➡ [Padrões do Front-end / React](./apps/frontend/docs/agent-skills/frontend-patterns.md)
