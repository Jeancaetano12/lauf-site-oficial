# Guia de Contribuição — LAUF Site Oficial

Seja muito bem-vindo(a) ao repositório do **Portal Oficial da Liga de Arduino Uninassau Fortaleza (LAUF)**! 🚀

Este projeto é desenvolvido e mantido por estudantes, monitores e professores da Liga. Nosso objetivo é construir uma plataforma moderna, estável e segura para gerenciar inscrições, chamadas em tempo real via QR Code, eventos e certificados.

Toda contribuição — seja corrigindo um bug, sugerindo uma melhoria, escrevendo testes ou aprimorando a documentação — é extremamente bem-vinda!

---

## 📋 Sumário

1. [Código de Conduta](#-código-de-conduta)
2. [Arquitetura do Monorepo](#-arquitetura-do-monorepo)
3. [Primeiros Passos (Setup Local)](#-primeiros-passos-setup-local)
4. [Fluxo de Trabalho Git e Branches](#-fluxo-de-trabalho-git-e-branches)
5. [Padrão de Conventional Commits](#-padrão-de-conventional-commits)
6. [Taxonomia Oficial de Labels](#-taxonomia-oficial-de-labels)
7. [Padrões de Código e Qualidade](#-padrões-de-código-e-qualidade)
8. [Política de Code Review e Pull Requests](#-política-de-code-review-e-pull-requests)
   - [8.1 Requisitos de Submissão e Aprovação](#1-requisitos-de-submissão-e-aprovação)
   - [8.2 Rastreabilidade e Limites de Tamanho de PR (800 linhas / 8 arquivos)](#2-rastreabilidade-e-limites-de-tamanho-de-pr)
   - [8.3 Funcionamento e Regras para PRs Empilhados (Stacked PRs)](#3-funcionamento-e-regras-para-prs-empilhados-stacked-prs)

---

## 🤝 Código de Conduta

Esperamos que todos os colaboradores sigam o nosso [Código de Conduta](CODE_OF_CONDUCT.md), baseado no **Contributor Covenant v2.1**. Nosso ambiente deve ser acolhedor, respeitoso e livre de assédio para todos, independentemente do nível de experiência.

Dúvidas ou relatos podem ser tratados diretamente com os coordenadores e líderes no **Discord oficial da LAUF**.

---

## 🏗 Arquitetura do Monorepo

O projeto utiliza **`pnpm workspaces`** e é estruturado em três pacotes principais:

```text
📁 root
├── 📁 apps
│   ├── 📁 frontend (React 19 + Vite + TailwindCSS v4)
│   └── 📁 backend  (NestJS 11 + Prisma 7 + PostgreSQL 15)
├── 📁 packages
│   └── 📁 shared   (@lauf/shared - Enums, tipos e gerador semântico Nano ID)
├── 📁 context
│   └── 📁 adrs     (Architecture Decision Records, ex: adr-01.md)
└── 📄 docker-compose.yml (PostgreSQL local para desenvolvimento)
```

- **`packages/shared` (`@lauf/shared`)**: Contém contratos comuns, Enums canônicos (`Cargo`, `StatusAula`, etc.) e helpers utilitários. Sempre que o `shared` for alterado, ele precisa ser compilado (`pnpm --filter @lauf/shared build`).
- **`apps/backend`**: API RESTful desenvolvida em NestJS com Prisma ORM e PostgreSQL.
- **`apps/frontend`**: Interface SPA em React 19 empacotada com Vite.

---

## 🚀 Primeiros Passos (Setup Local)

1. **Pré-requisitos:**
   - Node.js versão **22 LTS** ou superior.
   - Gerenciador de pacotes **pnpm** instalado (`corepack enable` ou `npm install -g pnpm@11`).
   - Docker e Docker Compose instalados (para o banco de dados).

2. **Instalação das dependências:**
   ```bash
   pnpm install
   ```

3. **Ambiente e Banco de Dados:**
   ```bash
   cp .env.example .env
   docker compose up -d
   pnpm --filter backend exec prisma migrate dev
   ```

4. **Rodando a aplicação em desenvolvimento:**
   ```bash
   pnpm dev
   ```
   O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3000`.

---

## 🌿 Fluxo de Trabalho Git e Branches

Adotamos um fluxo **Trunk-Based simplificado**, onde todos os Pull Requests apontam diretamente para a branch **`main`**.

### 1. Nomenclatura Padrão de Branches
Para manter a rastreabilidade com o backlog do GitHub, as branches devem seguir o formato:

```text
<tipo>/<issue-id>-<descricao-curta>
```

**Exemplos:**
- `feat/12-login-google`
- `fix/45-expiracao-token-sessao`
- `refactor/78-desacoplamento-solicitacoes`

### 2. Exceções para Ajustes Menores
Para pequenas tarefas de manutenção, correções de digitação ou atualizações de documentação que não justifiquem a abertura prévia de uma issue, você pode omitir o ID da issue:
- `chore/ajuste-script-lint`
- `docs/atualiza-instrucoes-docker`

### 3. Estratégia de Merge no GitHub
- Utilizamos **Merge commit tradicional** ao integrar PRs na branch `main`. Isso garante a preservação da linha do tempo e de todos os micro-commits do autor para fins de histórico e aprendizado dos membros.

---

## ✍️ Padrão de Conventional Commits

Nossas mensagens de commit são escritas em **Português**, seguindo a especificação do **Conventional Commits**:

```text
<tipo>(<escopo opcional>): <descrição no imperativo em português>
```

### Tipos Permitidos
- **`feat`**: Nova funcionalidade ou recurso para o usuário.
- **`fix`**: Correção de bug ou comportamento inesperado.
- **`docs`**: Alterações exclusivas em documentação (README, guias, comentários).
- **`chore`**: Atualizações de dependências, tarefas de build ou manutenção de scripts.
- **`refactor`**: Refatoração de código que não altera comportamento nem adiciona funcionalidade.
- **`test`**: Adição ou correção de testes automatizados.
- **`perf`**: Melhorias de desempenho e otimização.

### Escopos Recomendados
O escopo pode indicar o **workspace** ou o **domínio funcional**:
- **Por workspace:** `feat(frontend):`, `fix(backend):`, `chore(shared):`, `docs(root):`
- **Por domínio:** `feat(auth):`, `fix(presenca):`, `refactor(aulas):`

### Bons Exemplos:
- `feat(frontend): adiciona modal de confirmacao de presenca via qr code`
- `fix(backend): trata retorno vazio com status 200 ok na listagem de aulas`
- `docs(root): inclui guia de solucao de problemas no readme`
- `chore(shared): atualiza dependencias do nanoid e scripts tsup`

---

## 🏷 Taxonomia Oficial de Labels

Para manter o repositório organizado e facilitar o direcionamento de tarefas, utilizamos um sistema padronizado de labels em **4 dimensões**:

### 1. Dimensão de Tipo (`tipo: *`)
| Label | Cor | Propósito |
|---|---|---|
| `tipo: bug` | Vermelho 🔴 | Comportamento quebrado, erro de execução ou falha de sistema. |
| `tipo: feature` | Verde 🟢 | Nova funcionalidade ou evolução de negócio. |
| `tipo: chore` | Cinza ⚪ | Manutenção de dependências, infraestrutura ou ajustes de build. |
| `tipo: docs` | Azul claro 🔵 | Criação ou revisão de documentação e guias. |
| `tipo: refactor` | Roxo 🟣 | Melhoria interna de código sem alteração no comportamento externo. |

### 2. Dimensão de Escopo (`escopo: *`)
| Label | Propósito |
|---|---|
| `escopo: frontend` | Alterações localizadas em `apps/frontend` (React/Vite/Tailwind). |
| `escopo: backend` | Alterações localizadas em `apps/backend` (NestJS/Prisma). |
| `escopo: shared` | Alterações em contratos e pacotes de `packages/shared`. |
| `escopo: infra` | Docker, Nginx, Compose, VPS e infraestrutura de deploy. |

### 3. Dimensão de Comunidade e Incentivo
| Label | Propósito |
|---|---|
| `good first issue` 🟡 | **Ideal para calouros e novos membros.** Tarefas com escopo delimitado e fácil de implementar para fazer o primeiro PR na Liga. |
| `help wanted` 🟢 | Tarefas em que os líderes e mantenedores solicitam ativamente apoio de qualquer membro da comunidade. |

### 4. Dimensão de Prioridade e Status
| Label | Propósito |
|---|---|
| `prioridade: alta` | Deve ser priorizado para a próxima entrega/correção crítica. |
| `prioridade: media` | Fluxo normal de desenvolvimento planejado. |
| `prioridade: baixa` | Melhoria conveniente, sem urgência. |
| `status: bloqueado` ⛔ | **Tarefa pausada/impedida.** Sinaliza que o item está documentado, mas não deve ser iniciado por depender de decisão externa, aprovação de liderança ou intervenção direta de um mantenedor. |

---

## 📐 Padrões de Código e Qualidade

- **Nomenclatura de Arquivos:**
  - Componentes React: `PascalCase.tsx` (ex: `ModalQrCode.tsx`)
  - Serviços e Controladores NestJS: `kebab-case.<role>.ts` (ex: `aula.service.ts`, `auth.controller.ts`)
  - Enums e DTOs: declarados preferencialmente no `@lauf/shared` para evitar divergências.
- **Formatação e Estilo:**
  - O projeto utiliza **Prettier** (aspas simples, vírgula no final, indentação de 2 espaços).
  - Execute a formatação antes de abrir o PR: `pnpm --filter backend format`.
- **Testes Automatizados:**
  - Todo novo endpoint ou serviço de domínio deve ser acompanhado de testes unitários (`*.spec.ts`).
  - Para rodar a suíte completa: `pnpm test`.

---

## 🔍 Política de Code Review e Pull Requests

### 1. Requisitos de Submissão e Aprovação
- **Status do CI:** O pipeline automatizado do GitHub Actions deve estar completamente verde (`pnpm lint`, `pnpm typecheck`, `pnpm build` e `pnpm test`).
- **Aprovação Obrigatória:** Todo Pull Request necessita de **pelo menos 1 aprovação** de um mantenedor ou líder técnico da Liga para que o merge seja liberado.
- **Ambiente de Aprendizado:** As revisões de código na LAUF são feitas com foco pedagógico. Sugestões e comentários buscam compartilhar boas práticas e acelerar o aprendizado dos novos integrantes.

---

### 2. Rastreabilidade e Limites de Tamanho de PR
Para garantir revisões humanas de alta qualidade, reduzir o tempo de feedback e manter a rastreabilidade limpa no histórico do Git, adotamos limites estritos para cada Pull Request:

- **Limite de Linhas:** No máximo **800 linhas de diff** (somatório de linhas adicionadas e removidas).
- **Limite de Arquivos:** No máximo **8 arquivos de código efetivo** modificados.
  - *O que conta como código efetivo:* arquivos `.ts`, `.tsx`, `.js`, `.css`, arquivos de configuração ou controllers/services/componentes.
  - *Exceções não contabilizadas no limite de arquivos:* arquivos de trava (`pnpm-lock.yaml`), schemas ou migrations geradas pelo Prisma, e arquivos de assets/imagens.
- **Se sua demanda exceder esses limites:** O PR **não** deve ser aberto como um monolito. Ele **deve** ser obrigatoriamente decomposto em **PRs Empilhados (Stacked PRs)**.

---

### 3. Funcionamento e Regras para PRs Empilhados (Stacked PRs)
Quando uma funcionalidade ou refatoração for ampla demais para caber nos limites de 800 linhas / 8 arquivos, o fluxo correto é criar uma **cadeia de PRs atômicos e incrementais**, onde cada etapa resolve uma fatia coesa da solução.

#### 💡 Exemplo de Decomposição:
Para uma funcionalidade complexa (ex: Emissão de Certificados com QR Code):
- **PR 1:** Contratos, tipos e enums no `@lauf/shared` (base: `main`).
- **PR 2:** Modelagem no Prisma, migrations e endpoints no `apps/backend` (base: branch do PR 1).
- **PR 3:** Componentes de interface e hooks no `apps/frontend` (base: branch do PR 2).

#### 📋 Regras Obrigatórias para a Pilha:
1. **Configuração de Base no GitHub:**
   - O primeiro PR da pilha aponta a branch base para `main`.
   - Os PRs subsequentes da pilha devem apontar temporariamente a sua *base branch* no GitHub para a branch do PR imediatamente anterior. Dessa forma, o revisor visualiza **apenas o diff delta daquela etapa**.
2. **Sinalização no Template de PR:**
   - Preencha a seção `🥞 PR Empilhado (Stacked PR)` no [template de Pull Request](.github/pull_request_template.md), indicando explicitamente qual é o PR anterior e qual é o próximo.
3. **Autonomia, Compilação e CI Verde em Cada PR:**
   - Cada PR individual da pilha **deve compilar e passar no CI de forma independente** (`pnpm lint`, `pnpm typecheck` e `pnpm test`). Nunca envie um PR quebrado ou que dependa de correções de compilação no PR seguinte.
4. **Ordem Estrita de Merge e Atualização de Base:**
   - Os PRs devem ser revisados e mergeados **estritamente em ordem sequencial** (da base para o topo: PR 1 → PR 2 → PR 3).
   - Quando o PR 1 for mergeado na `main`, o autor deve:
     1. Acessar o PR 2 no GitHub e alterar a *base branch* para `main`.
     2. Fazer o rebase ou sincronização local da branch do PR 2 com a `main` atualizada (`git pull --rebase origin main`) e subir o push.
