# Padrões de Testes Unitários no NestJS (Test Patterns)

Este documento dita as regras para que você (Desenvolvedor) ou qualquer Agente de IA construa e entenda arquivos de testes unitários (`.spec.ts`) no back-end.

## O "Mini Ambiente" de Testes (Testing Module)

O NestJS possui um módulo especializado de testes chamado `Test.createTestingModule()`. 
Na aplicação real (rodando `npm run start`), o NestJS sobe o seu banco de dados, o Nginx, os serviços de Email e junta todos os arquivos do projeto de uma vez só. 

No entanto, nos **Testes Unitários**, nós não queremos nada disso. Nós queremos testar **apenas um arquivo por vez** (por exemplo, testar só o `auth.service.ts`). O "Testing Module" cria uma bolha invisível (um mini ambiente) que carrega apenas o `AuthService` e mais nada.

### Por que Mocks (Imitações) existem?
Como esse "Mini Ambiente" não carrega o banco de dados (PrismaService), se o seu `AuthService` tentar salvar um usuário, ele vai dar erro (porque o banco não existe na bolha). 

É por isso que criamos **Mocks**. O Mock é um objeto falso que *finge* ter as mesmas funções do banco de dados, mas ele não salva nada. Ele só "anota" se o serviço mandou salvar ou não.

---

## Palavras Reservadas do Jest (Glossário)

Ao criar os arquivos `.spec.ts`, você notará a presença destas palavras, que pertencem à biblioteca **Jest**:

- **`describe()`**: É apenas um agrupador. Usamos para criar um "Bloco de Texto" visual. Ex: `describe('AuthService')` ou `describe('login')`.
- **`it()`** (ou `test()`): É o teste de fato. Dentro dele é que a execução acontece. Leia como: *"Ele [o sistema] deve fazer tal coisa"*.
- **`beforeEach()`**: É uma função que vai rodar antes de **CADA** `it()`. Geralmente usamos para inicializar o "Testing Module" sempre limpo, sem resíduos do teste anterior.
- **`jest.fn()`**: Cria uma função "espiã" vazia. Ela não faz nada, apenas anota "Fui chamada 1 vez. Com os parâmetros X e Y". É assim que imitamos o Prisma.
- **`jest.spyOn()`**: Serve para "espionar" e alterar funções de bibliotecas de terceiros (como a `bcrypt.hash`).
- **`.mockResolvedValue()`**: Diz para a função espiã o que ela deve devolver. Ex: *"Quando o AuthService pedir para achar um usuário, finja que achou este objeto aqui: {...}"*.
- **`expect()`**: É a "Validação". Onde você checa se o seu serviço fez o que deveria. (Ex: `expect(resultado.message).toBe('Sucesso')`).

---

## Regras Obrigatórias para Criação de Testes
1. NUNCA importe o `PrismaService` real sem providenciar um `useValue: mockPrismaService` no Testing Module. Isso evitará de sujar as tabelas de desenvolvimento.
2. Cada bloco `describe` deve testar um único método da classe.
3. Garanta o uso de `jest.clearAllMocks()` dentro do bloco `afterEach()` para evitar que variáveis globais interfiram em testes futuros.
