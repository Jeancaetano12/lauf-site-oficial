# Dicionário de Dados e Padrões de Banco (LAUF)

Este documento descreve a estrutura do banco de dados (schema do Prisma) da aplicação, detalhando os modelos, suas finalidades e justificativas para o cumprimento dos requisitos funcionais (RF02 a RF04).

## 1. Enums (Tipos de Dados Predefinidos)

A utilização de Enums no banco ajuda a restringir os dados inseridos a um conjunto de valores válidos e controlados, aumentando a segurança e consistência dos registros.

- **`Curso`**: Representa os cursos permitidos para entrada na liga, conforme a listagem oficial. Evita erros de digitação e padroniza os cadastros.
- **`Cargo`**: Define o nível de permissão (ALUNO, PROFESSOR, MONITOR, COORDENADOR), cumprindo diretamente o RF04, diferenciando os papéis no sistema.
- **`StatusSolicitacao`**: Representa o fluxo de aprovação de um novo membro (PENDENTE, APROVADA, REJEITADA).
- **`StatusAula`**: Controla o ciclo de vida de uma aula regular (AGENDADA, CONCLUIDA, CANCELADA).
- **`StatusEvento`**: Controla o ciclo de vida de um evento externo (AGENDADO, CONCLUIDO, CANCELADO).

## 2. Modelos (Tabelas)

### 2.1. SolicitacaoInscricao
**Objetivo:** Atender ao RF02, permitindo que potenciais membros solicitem a entrada na liga sem criar um usuário ativo imediatamente.
**Justificativa:** Armazena o registro até que um `COORDENADOR` aprove. Possui campos de token gerados sob demanda (após a aprovação) para que o requerente conclua a criação do perfil e senha em um tempo limitado.

**Campos:**
- `id` (String/UUID): Identificador único da solicitação. Utilizar UUID aumenta a segurança (não é previsível).
- `nome` (String): Nome completo.
- `email` (String): E-mail de contato, obrigatório para receber o link.
- `matricula` (String): Validação de vínculo institucional.
- `telefone` (String): Telefone de contato.
- `curso` (Enum: Curso): O curso do ingressante.
- `cargoPretendido` (Enum: Cargo): Informa se o usuário atuará como Aluno ou Professor.
- `status` (Enum: StatusSolicitacao): Padrão `PENDENTE`. Controla a aprovação.
- `tokenRegistro` (String?): Hash/token único de uso único enviado por email após a aprovação para finalizar o cadastro.
- `tokenRegistroExpiraEm` (DateTime?): Data limite para a utilização do link de registro gerado.
- `criadoEm` / `atualizadoEm`: Logs de auditoria do sistema.

### 2.2. Usuario
**Objetivo:** Atender aos RF03 e RF04, armazenando as contas ativas do portal (com senha), permitindo a autenticação (login) e controlando o perfil.
**Justificativa:** Isolamos o Usuário real aprovado do modelo de Solicitação, de forma que o sistema lide no dia a dia apenas com contas válidas. O usuário loga com `matricula` e `senha` conforme RF03.

**Campos:**
- `id` (String/UUID): Identificador único do usuário.
- `email` (String): E-mail da conta de acesso.
- `nome` (String): Nome do usuário.
- `matricula` (String): Utilizada no momento de login (RF03).
- `telefone` (String): Telefone de contato.
- `curso` (Enum: Curso): Curso vinculado do usuário.
- `senha` (String): Armazena a hash gerada a partir da senha (nunca o texto limpo).
- `cargo` (Enum: Cargo): Nível de permissão (Aluno, Professor, etc.). Padrão `ALUNO`.
- `tokenRecuperacaoSenha` (String?): Hash aleatória de uso único para validação da recuperação de senha.
- `tokenRecuperacaoExpiraEm` (DateTime?): Data de validade do link de recuperação (segurança recomendada de 1 hora).
- `criadoEm` / `atualizadoEm`: Logs de auditoria do sistema.

### 2.3. Sessao
**Objetivo:** Implementação de controle de sessão por Refresh Tokens (JWT), garantindo uma boa experiência de usuário ao revalidar tokens expirados sem precisar pedir login frequentemente.
**Justificativa:** Reforça a segurança de autenticação de tokens JWT mantendo sessões de longa duração revogáveis no banco de dados. A partir da nova atualização, estes tokens operam nativamente como **HttpOnly Cookies**.

**Campos:**
- `id` (String/UUID): Identificador da sessão.

- `refreshToken` (String): Token único de longa duração entregue para o client (agora embutido em Cookie) para renovar acessos.
- `usuarioId` (String): Chave estrangeira que aponta para o Usuário.
- `valido` (Boolean): Permite revogar a sessão remotamente (ex: deslogar de todos os dispositivos). Padrão `true`.
- `expiraEm` (DateTime): Prazo máximo até que o usuário seja obrigado a realizar login com senha novamente.
- `criadoEm`: Data e hora do login (início da sessão).

### 2.4. Aula
**Objetivo:** Agendamento e gerenciamento de aulas regulares da liga.
**Justificativa:** Permite que professores e coordenadores criem encontros, além de gerenciar a geração de QR Codes para registro de presença.

**Campos Principais:**
- `id` (String/UUID): Identificador único da aula.
- `titulo`, `local`, `dataHora`: Informações básicas do encontro.
- `status` (Enum: StatusAula): Estado atual da aula. Padrão `AGENDADA`.
- `criadorId`, `professorId`: Relações com `Usuario` indicando quem criou e quem ministrará.
- `qrCodeToken`, `qrCodeExpiraEm`, `qrCodeAtivo`: Controle para chamada por QR Code.

### 2.5. PresencaAula
**Objetivo:** Registro individual de presença de alunos (membros ativos) em aulas regulares.
**Justificativa:** Tabela pivô de relacionamento N:N entre `Aula` e `Usuario`. Trabalha com modelagem positiva (apenas presenças são registradas, faltas são inferidas).

**Campos Principais:**
- `aulaId`, `usuarioId`: Chaves estrangeiras com `onDelete: Cascade`.
- `confirmadoEm`: Data e hora em que a presença foi validada (leitura do QR).

### 2.6. Certificado
**Objetivo:** Comprovação de horas para membros baseada em frequência nas aulas.
**Justificativa:** Emitido após apuração de presença (>= 75%).

**Campos Principais:**
- `usuarioId`: Vínculo com o membro.
- `cargaHoraria`: Quantidade de horas concedidas.
- `emitidoEm`: Data de emissão.

### 2.7. Evento
**Objetivo:** Agendamento de eventos abertos a participantes externos e controle em larga escala.
**Justificativa:** Separado de `Aula` devido a regras de negócio distintas (QR de longa duração, emissão em lote de certificados por email, não exige login).

**Campos Principais:**
- `id`, `titulo`, `local`, `dataHora`: Dados básicos.
- `duracaoMinutos`, `cargaHoraria`: Usados para calcular expiração do QR e valor do certificado.
- `status` (Enum: StatusEvento): Estado do evento.
- `qrCodeToken` e relacionados: Controle da chamada.

### 2.8. ParticipanteExterno
**Objetivo:** Registrar indivíduos sem conta formal no sistema que comparecem a Eventos.
**Justificativa:** Reduz a barreira de entrada, exigindo apenas nome e e-mail no momento de confirmar presença pelo QR.

**Campos Principais:**
- `nome`, `email`: Dados de contato (identificador único por evento).

### 2.9. PresencaEvento
**Objetivo:** Registro de presença para o público externo.
**Justificativa:** Tabela pivô relacionando `Evento` e `ParticipanteExterno`.

### 2.10. CertificadoEvento
**Objetivo:** Registro do certificado gerado para um participante externo.
**Justificativa:** Permite envio por e-mail e conferência de autenticidade no futuro.

## Considerações Adicionais
- As chaves estrangeiras utilizam `onDelete: Cascade` (ex: em `Sessao` vinculado a `Usuario`), indicando que caso um usuário seja excluído do banco, todas as sessões relacionadas sejam apagadas automaticamente.
- Optou-se por utilizar o formato `String` (UUID - Universally Unique Identifier) para todas as chaves primárias. Isso não só adiciona uma camada de ofuscação (escondendo a quantidade de usuários do banco) mas também ajuda numa eventual escalabilidade de sistemas distribuídos.
