# Skils do Agente e Padrões para Back-end

Sempre que a IA, o Agente de Código (Cursor, Windsurf, GitHub Copilot) ou um desenvolvedor for atuar no lado servidor, as diretrizes listadas aqui são **absolutas e obrigatórias**. 

A aplicação utiliza o framework **NestJS**, focado na injeção de dependências e modularidade. CUMPRA RIGOROSAMENTE as seguintes regras:

## 1. Responsabilidades em Arquitetura (NestJS)

Não crie rotas "soltas" utilizando express cru. **Tudo** funciona em módulos. O fluxo da aplicação DEVE ser:

### Controllers
- Diretório: `src/<module>/<module>.controller.ts`
- **Única Atribuição**: Receber as requisições HTTP (Decorators `@Get`, `@Post`), tipar e validar a requisição de entrada com **DTOs (Data Transfer Objects)**, e invocar o método do *Service*.
- **O que NÃO fazer**: Jamais chame ou instancie o `PrismaService` no controller. Controller não possui lógica de manipulação de dados de negócio, apenas orquestração de resposta de HTTP.

### Services (Providers)
- Diretório: `src/<module>/<module>.service.ts`
- **Única Atribuição**: Concentrar as regras de negócio, cálculos, tratamentos e interações com o Banco de Dados.
- **Como usar o Prisma**: O Prisma deve ser injetado via Construtor:
  ```typescript
  constructor(private readonly prisma: PrismaService) {}
  ```
- O service é responsável por disparar erros customizados (ex: `throw new NotFoundException('Usuario não encontrado.')`) que refletirão adequadamente na resposta para o Controller.

## 2. Banco de Dados e Prisma

- Estamos utilizando banco **PostgreSQL**.
- O model já iniciou utilizando o modelo e tabela **`Usuario`**. Trabalhe sempre considerando este nome.
- **Migrations**: O comando de migração do prisma (`npx prisma migrate dev`) **só pode ser executado** dentro da pasta base `apps/backend/`. Nunca crie migrações pela raiz com flags contornáveis.
- O Prisma Service principal já foi isolado e injetado globalmente (`PrismaModule`), garantindo uma conexão única persistida via lifecycle hooks.

## 3. Respostas da API
- O Back-end deve sempre retornar JSON em caso de sucesso (com uso do nest isso é automático).
- Garanta que objetos sensíveis (ex: senhas do `Usuario`) sejam removidos do objeto retornado pelo Service antes de chegar ao Controller.

## 4. Deployment e Produção (Environment VPS)
- O Container `Node` não deve incluir pacotes de desenvolvimento (`devDependencies`) para poupar RAM. Rode `npm ci --omit=dev` após o processo de `npm run build` na geração de containers/zip de deploy.
- Utilize sempre `npx prisma migrate deploy` em ambiente de produção para rodar com rapidez em vez de iniciar processos interativos pesados.
- Na VPS, evite iniciar via `npm start`. Execute diretamente a build transpilada via `node dist/main.js`. Em VPS de 1GB de RAM ou menos, instanciar vários workers via PM2 pode ser prejudicial. Preferencialmente instancie um single-thread com `node` ou garanta o limite usando contêineres Alpine Docker controlados de forma minuciosa.

## 5. Autenticação e Autorização (AuthModule)

Sempre que a funcionalidade envolver segurança e controle de acesso, atente-se às seguintes regras padronizadas na aplicação:

- **Tokens e Criptografia**: A senha do usuário JAMAIS deve trafegar ou ser armazenada em texto limpo. Sempre utilize `bcrypt.hash()` antes de salvar e `bcrypt.compare()` no login. Para sessões, foi estabelecido o uso de **JWT (JSON Web Tokens)** associado a Refresh Tokens de longa duração, validados via `@nestjs/jwt`. **Esses tokens devem ser enviados exclusivamente via Cookies `HttpOnly`** para proteger contra ataques de XSS, nunca como resposta JSON direta ou armazenados em `localStorage` no frontend.
- **Proteção de Rotas (Guards)**:
  - Rotas que exigem apenas o usuário estar logado devem ser decoradas com `@UseGuards(JwtAuthGuard)`.
  - Rotas exclusivas por Cargo (ex: funcionalidade administrativa) devem incluir o `@UseGuards(JwtAuthGuard, RolesGuard)` seguido do decorador `@Roles(Cargo.COORDENADOR, Cargo.PROFESSOR)` informando o Array de cargos permitidos.
- **Identificação do Usuário Logado**: Ao invés de trafegar IDs expostos ou resgatar tudo do zero, utilize o custom decorator `@CurrentUser()`, que extrai do token os dados `id`, `matricula`, `email` e `cargo` de forma segura.
- **Validação Global**: As requisições são protegidas globalmente pelo `ValidationPipe` do NestJS. Sendo assim, toda entrada de dados no Controller (`@Body()`) deve possuir uma classe DTO rigorosamente validada pelos decoradores do `class-validator` (ex: `@IsString()`, `@IsNotEmpty()`, `@IsEmail()`).

### 5.1 Considerações sobre o modulo de Autenticação:
- Os disparos de emails solicitado nos requisitos funcionais estão implementados e escritos em um modulo próprio `MailService`, que já foi integrado ao sistema.
- Sempre que for necessário enviar um email, utilize o `MailService` já disponível.
- O `MailService` está configurado para utilizar o SMTP da google, limitado a 500 envios por dia.

## 6. Agendamento de Aulas (AulaModule)

Modulo responsavel por gerenciar aulas e eventos do sistema. Segue as seguintes regras:

### 6.1 Processos em Background (CronJobs)
- O modulo de Aulas possui um job configurado via `@nestjs/schedule` que roda a cada 30 minutos (`@Cron(CronExpression.EVERY_30_MINUTES)`).
- **Cancelamento Automático:** Este job varre o banco buscando por aulas que tenham passado 5 horas do seu início e que não possuam nenhuma presença registrada. Tais aulas têm o seu status atualizado de `AGENDADA` para `CANCELADA` automaticamente, evitando retenção de aulas antigas abertas.

## 7. Registro de presença (PresencaModule)

Modulo responsavel por registrar a presença dos usuários em aulas. Segue as seguintes regras:

## 8. Modulo de Usuarios (UsuariosModule)

Modulo responsavel por gerenciar usuarios do sistema. Segue as seguintes regras:

### 8.1 Modulo de Solicitações (UsuariosModule) 

Um submodulo de usuarios criado para tratar solicitações de inscrição para alunos interessados em participar de um curso oferecido pelo LAUF.
Segue as seguintes regras: