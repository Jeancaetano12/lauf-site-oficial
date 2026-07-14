# Skils do Agente e Padrões para Front-end

Sempre que a IA, o Agente de Código (Cursor, Windsurf, GitHub Copilot) ou um desenvolvedor for atuar no front-end, as diretrizes listadas aqui são **absolutas e obrigatórias**.

O front-end é montado utilizando **Vite, TypeScript, TailwindCSS e React**.

## 1. Regras de Clean Architecture no Front-end

- O front-end possui responsabilidade VIZUAL (UI) e de INTERAÇÃO. **Nunca** chame dependências do Banco de Dados (como `@prisma/client`) por acidente desse lado.
- Todo o consumo de dados deve ser extraído unicamente interligando o backend pela sua API REST via `fetch`, `axios` ou hooks otimizados.

## 2. Padrões de Componentes

- Utilize `React Functional Components` ao invés de `Class Components`.
- Nomeie arquivos/componentes em **PascalCase**. Exemplo: `UserProfile.tsx` ou `Header.tsx`.
- Interfaces ou Tipos TS (Typescript DTOs/Responses) que correspondam às entidades do Back-end devem estar isoladas em diretório próprio (ex. `src/types` ou `src/interfaces`) para evitar dependência cíclica e mistura de responsabilidades. Ex: A tipagem de `Usuario` sendo uma representação do JSON recebido da API.
- **Autenticação**: Utilize sempre o hook `useAuth()` proveniente do `AuthContext` para acessar dados do usuário ou métodos de login/logout. Jamais tente ler o `localStorage` manualmente para verificar permissões em componentes.

## 3. Padrões do Vite e TailwindCSS

- **Estilos**: Qualquer componentização de UI, layouts fluidos e estilizações devem ser montados a base das classes utilitárias do TailwindCSS configuradas pela extensão padrão `@tailwindcss/postcss`. Evite criar arquivos locais extensos de `.css` a menos que seja um design estritamente customizável ou impossível via Tailwind.
- Utilize extensões de compilação avançadas do react (React Compiler) para abstrair hooks desnecessários em memoização no escopo deste template, mantendo código performático.
- Não rode comandos como *npx create-* ou instalações desnecessárias que quebrem os scripts globais, pois os artefatos de dev/build estão integrados ao script Workspaces do Monorepo instalado e hospedado na pasta raiz do repositório.

## 4. Deployment e Produção (Environment VPS)
- O Container ou Servidor que hospera o frontend não precisa e NÃO DEVE instalar o NodeJS em produção. 
- Realize o `npm run build` durante uma esteira CI/CD ou localmente.
- O resultado originado na pasta `dist` será constituido apenas por HTML, CSS e JS enxutos.
- Copie apenas a pasta `dist` para o servidor alvo e preencha uma configuração de `Nginx` servindo os arquivos estáticos na porta 80/443. Isso reduz o custo de RAM consumindo apenas megabytes.

## 5. Padrões de Autenticação e API (HttpOnly Cookies)

Este projeto utiliza um fluxo de autenticação altamente seguro baseado em **HttpOnly Cookies** para evitar ataques de roubo de sessão (XSS).
- **Access Token (JWT)**: Vida curta. Gerenciado e armazenado **exclusivamente pelo navegador via cookies**. NUNCA tente acessar ou armazenar esse token via JavaScript (localStorage/sessionStorage).
- **Refresh Token (Opaque)**: Vida longa. Também armazenado como cookie HttpOnly e usado apenas para renovar o Access Token de forma transparente.

### 5.1. O Módulo `api.ts` (Axios e Credentials)
Todas as chamadas ao backend **devem** utilizar a instância exportada em `src/services/api.ts`.
1. **Envio de Cookies (`withCredentials`)**: O Axios está configurado com `withCredentials: true`. Isso garante que o navegador envie automaticamente os cookies de sessão nas requisições, sem a necessidade de manipular headers de `Authorization` manualmente.
2. **Silent Refresh**: Caso uma requisição falhe com erro `401 Unauthorized` (sinalizando expiração do Access Token), o interceptor do Axios fará uma chamada automática (POST) para a rota `/auth/refresh`. O backend validará o cookie do `refreshToken`, renovará os cookies e o interceptor repetirá a requisição original sem o usuário perceber.

### 5.2. AuthContext e useAuth
O `AuthContext` é o "Cérebro" da sessão do lado do Cliente:
- **Sem LocalStorage**: A sessão não é baseada em dados persistentes vulneráveis do lado do cliente (como `localStorage` ou `jwt-decode`).
- **Validação com o Backend**: Ao iniciar a página, o contexto realiza uma validação (`/auth/validar-sessao`) que envia os cookies para o backend, retornando os dados seguros do usuário para popular o estado caso a sessão seja válida.
- Fornece as funções e métodos de fluxo como `login`, `logout` e `solicitarInscricao`.

### 5.3. Redirecionamento e Proteção
- **Página de Login**: Deve verificar se `isAuthenticated` é true e redirecionar para o Hub imediatamente para evitar que o usuário logue duas vezes.
- **Rotas Protegidas**: Utilize o componente `ProtectedRoute` (em `src/components/ProtectedRoute.tsx`) para envolver rotas que exigem autenticação. Ele gerencia o estado de carregamento e redireciona automaticamente para o `/login` caso não haja uma sessão válida.

```tsx
{/* Rota Pai que carrega o Layout de Navegação */}
<Route
  element={
    <ProtectedRoute>
      <HubLayout />
    </ProtectedRoute>
  }
>
  {/* Todas as rotas que precisam do menu lateral/bottom-bar entram aqui como filhas */}
  <Route path="/hub" element={<LaufHub />} />
  <Route path="/aulas" element={<Aulas />} />
  <Route path="/perfil" element={<Perfil />} />
  <Route path="/solicitacoes" element={<Solicitacoes />} />
  <Route path="/extras" element={<Extras />} />
  <Route path="/aulas/:id" element={<AulaDetalhes />} />
  <Route path="/confirmar-presenca" element={<ConfirmarPresenca />} />
  {/* <Route path="/calendario" element={<Calendario />} /> */}
```

## Hooks:
O proprio `AuthContext` é um hook, e ele é o único hook que deve ser usado para autenticação.
Ele possui o seguinte estado:
- `user`: Dados do usuário
- `isAuthenticated`: Verifica se o usuário está autenticado
- `isLoading`: Verifica se o usuário está carregando
- `login`: Método de login
- `logout`: Método de logout
- `solicitarInscricao`: Método de solicitação de inscrição
- `validarSessao`: Método de validação de sessão

### useAulas:
Responsavel por gerenciar as aulas, ele trabalha junto com o componente de calendario para exibir as aulas.
Ele possui os seguintes métodos:
- `buscarAulas`: Busca as aulas, sempre retorna as aulas ordenadas por data e hora
- `buscarProfessores`: Busca os professores
- `criarAula`: Cria uma aula
- `updateAula`: Atualiza uma aula
- `refetch`: Recarrega as aulas
- `isLoading`: Verifica se está carregando
- `error`: Verifica se houve erro
