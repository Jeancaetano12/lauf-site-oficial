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

## 5. Padrões de Autenticação e API (JWT & Refresh Token)

Este projeto utiliza um fluxo de autenticação robusto baseado em dois tokens:
- **Access Token (JWT)**: Vida curta. Enviado em todas as requisições no header `Authorization`.
- **Refresh Token (Opaque)**: Vida longa. Armazenado no `localStorage` e usado apenas para renovar o Access Token.

### 5.1. O Módulo `api.ts` (Axios Interceptors)
Todas as chamadas ao backend **devem** utilizar a instância exportada em `src/services/api.ts`. Ela possui interceptores que:
1.  **Injeção Automática**: Anexa o `accessToken` do `localStorage` em cada request de saída.
2.  **Silent Refresh**: Caso uma requisição falhe com erro `401 Unauthorized`, o interceptor pausa as requisições pendentes, tenta renovar o token chamando `/auth/refresh` e, em caso de sucesso, repete a requisição original de forma transparente para o usuário.

### 5.2. AuthContext e useAuth
O `AuthContext` é o "Cérebro" da sessão:
- Gerencia o estado `user` (decodificado via `jwt-decode`).
- Fornece as funções `login`, `logout` e `solicitarInscricao`.
- **Persistência**: Ao carregar a página, o context tenta ler o storage e restaurar a sessão automaticamente.

### 5.3. Redirecionamento e Proteção
- **Página de Login**: Deve verificar se `isAuthenticated` é true e redirecionar para o Hub imediatamente.
- **Rotas Protegidas**: (Padrão a implementar) Utilize componentes de "Guard" ou verifique `isAuthenticated` dentro do `useEffect` das páginas privadas para evitar acesso não autorizado.

