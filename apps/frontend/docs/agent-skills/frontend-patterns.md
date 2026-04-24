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

## 3. Padrões do Vite e TailwindCSS

- **Estilos**: Qualquer componentização de UI, layouts fluidos e estilizações devem ser montados a base das classes utilitárias do TailwindCSS configuradas pela extensão padrão `@tailwindcss/postcss`. Evite criar arquivos locais extensos de `.css` a menos que seja um design estritamente customizável ou impossível via Tailwind.
- Utilize extensões de compilação avançadas do react (React Compiler) para abstrair hooks desnecessários em memoização no escopo deste template, mantendo código performático.
- Não rode comandos como *npx create-* ou instalações desnecessárias que quebrem os scripts globais, pois os artefatos de dev/build estão integrados ao script Workspaces do Monorepo instalado e hospedado na pasta raiz do repositório.

## 4. Deployment e Produção (Environment VPS)
- O Container ou Servidor que hospera o frontend não precisa e NÃO DEVE instalar o NodeJS em produção. 
- Realize o `npm run build` durante uma esteira CI/CD ou localmente.
- O resultado originado na pasta `dist` será constituido apenas por HTML, CSS e JS enxutos.
- Copie apenas a pasta `dist` para o servidor alvo e preencha uma configuração de `Nginx` servindo os arquivos estáticos na porta 80/443. Isso reduz o custo de RAM consumindo apenas megabytes.
