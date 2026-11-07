## 🔗 Vinculação com Issue

Resolve a Issue: #<!-- Insira o número da issue que este PR resolve (ex: #12) para fechamento automático -->

---

## 🥞 PR Empilhado (Stacked PR)

Este PR faz parte de uma cadeia de PRs empilhados?
- [ ] Não (PR único / independente apontando para `main`)
- [ ] Sim (indique os dados da pilha abaixo):
  - **PR Base (dependência anterior):** #<!-- Número do PR anterior ou N/A se for o primeiro da pilha -->
  - **Próximo PR da pilha:** #<!-- Número do próximo PR se já aberto, ou N/A se for o último -->

---

## 📌 Tipo de Mudança

Marque a opção que melhor descreve a sua contribuição:

- [ ] 🚀 **Novo recurso** (`feat`: adiciona nova funcionalidade ou tela)
- [ ] 🐛 **Correção de bug** (`fix`: resolve um comportamento inesperado ou erro)
- [ ] ♻️ **Refatoração** (`refactor`: melhora o código sem alterar comportamento externo)
- [ ] 📝 **Documentação** (`docs`: adiciona ou atualiza documentação, guias ou READMEs)
- [ ] ⚙️ **Manutenção / Tarefa** (`chore`: atualiza dependências, build ou configurações)

---

## 📝 Descrição da Mudança

Descreva resumidamente o que foi implementado neste Pull Request e a justificativa técnica ou funcional da alteração:

<!-- Exemplo:
- Implementa modal de confirmação de presença com leitura de QR Code.
- Adiciona validação de status no backend evitando que chamadas canceladas recebam presenças.
-->

---

## 📸 Evidências Visuais (Screenshots / Gravação)

> 💡 **Recomendado para alterações no Frontend (`apps/frontend`):** Se este PR adiciona novas telas ou modifica componentes visuais, anexe capturas de tela ou gravações demonstrando o antes/depois. Caso a alteração seja apenas no backend ou pequenos ajustes visuais, esta seção pode ser mantida como N/A.

| Antes | Depois |
|---|---|
| <!-- Imagem ou N/A --> | <!-- Imagem ou N/A --> |

---

## ✅ Checklist de Autoverificação

Antes de solicitar a revisão de um mantenedor da LAUF, confirme se você realizou os seguintes passos:

- [ ] Meu código segue as convenções e boas práticas estabelecidas no [CONTRIBUTING.md](../CONTRIBUTING.md).
- [ ] **Rastreabilidade e Limites:** O PR contém no máximo **800 linhas de diff** e toca em até **8 arquivos de código efetivo** (ou está devidamente dividido em PRs Empilhados).
- [ ] Executei a validação de lint e tipos (`pnpm lint` e `pnpm typecheck`) sem novos erros.
- [ ] Executei a suíte de testes unitários localmente (`pnpm test`) e todos os testes passaram com sucesso.
- [ ] Confirmo que **NENHUM** segredo, chave privada, token de autenticação ou arquivo `.env` sensível foi incluído neste commit.
- [ ] Testei manualmente o fluxo alterado na minha máquina local com o ambiente rodando (`pnpm dev`).
