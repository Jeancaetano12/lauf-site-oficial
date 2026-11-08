#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd -- "${SCRIPT_DIR}/.." && pwd)

cd "${PROJECT_ROOT}"

fail() {
  echo "❌ ERRO DE CONSISTÊNCIA DE ONBOARDING: $*" >&2
  exit 1
}

pass() {
  echo "✔ $*"
}

echo "=========================================================="
echo "🔍 Verificando Consistência Documental de Onboarding"
echo "=========================================================="

# 1. Validação das Fontes Autoritativas
SEED_FILE="apps/backend/prisma/seed.ts"
PKG_FILE="package.json"
BOOTSTRAP_SH="scripts/bootstrap-dev.sh"
BOOTSTRAP_PS="scripts/bootstrap-dev.ps1"
README="README.md"
CONTRIBUTING="CONTRIBUTING.md"

for src in "${SEED_FILE}" "${PKG_FILE}" "${BOOTSTRAP_SH}" "${BOOTSTRAP_PS}" "${README}" "${CONTRIBUTING}"; do
  if [ ! -f "${src}" ]; then
    fail "Fonte autoritativa ou documento ausente: '${src}'."
  fi
done
pass "Todas as fontes autoritativas e documentos existem."

# 2. Extração do Pin do Gerenciador de Pacotes
PIN=$(node -e "try { const p = require('./package.json').packageManager; if (p) process.stdout.write(p); } catch {}" 2>/dev/null || true)
if [ -z "${PIN}" ]; then
  fail "Não foi possível extrair packageManager do package.json."
fi
echo "Pin autoritativo em package.json: ${PIN}"

for doc in "${README}" "${CONTRIBUTING}"; do
  if ! grep -qF "${PIN}" "${doc}"; then
    fail "${doc} não declara o pin oficial '${PIN}'."
  fi
  if grep -q "pnpm@latest" "${doc}"; then
    fail "${doc} contém recomendação proibida 'pnpm@latest'."
  fi
done
pass "Pin do pnpm (${PIN}) sincronizado em README.md e CONTRIBUTING.md (sem pnpm@latest)."

# 3. Extração das Credenciais Oficiais do Seed
extract_seed_matricula() {
  local email=$1
  node -e "
    const fs = require('fs');
    const content = fs.readFileSync('${SEED_FILE}', 'utf8');
    const emailIdx = content.indexOf('${email}');
    if (emailIdx === -1) process.exit(1);
    const chunk = content.slice(emailIdx, emailIdx + 300);
    const match = chunk.match(/matricula:\s*'([^']+)'/);
    if (!match) process.exit(1);
    process.stdout.write(match[1]);
  " 2>/dev/null || true
}

ADMIN_MATRICULA=$(extract_seed_matricula "admin@lauf.com")
PROF_MATRICULA=$(extract_seed_matricula "professor@lauf.com")
ALUNO_MATRICULA=$(extract_seed_matricula "aluno@lauf.com")

if [ -z "${ADMIN_MATRICULA}" ] || [ -z "${PROF_MATRICULA}" ] || [ -z "${ALUNO_MATRICULA}" ]; then
  fail "Não foi possível extrair todas as matrículas oficiais de ${SEED_FILE}."
fi

echo "Matrículas autoritativas do seed:"
echo "  - admin@lauf.com: ${ADMIN_MATRICULA}"
echo "  - professor@lauf.com: ${PROF_MATRICULA}"
echo "  - aluno@lauf.com: ${ALUNO_MATRICULA}"

for doc in "${README}" "${CONTRIBUTING}"; do
  for email_mat in "admin@lauf.com|${ADMIN_MATRICULA}" "professor@lauf.com|${PROF_MATRICULA}" "aluno@lauf.com|${ALUNO_MATRICULA}"; do
    IFS="|" read -r email mat <<< "${email_mat}"
    if ! grep -qF "${email}" "${doc}"; then
      fail "${doc} não documenta o e-mail oficial '${email}'."
    fi
    if ! grep -qF "${mat}" "${doc}"; then
      fail "${doc} não documenta a matrícula oficial '${mat}' para '${email}'."
    fi
  done
  if ! grep -qF "senha123" "${doc}"; then
    fail "${doc} não documenta a senha padrão 'senha123'."
  fi
done
pass "Credenciais oficiais (e-mails, matrículas e senha123) sincronizadas em README.md e CONTRIBUTING.md."

# 4. Comandos e Caminhos dos Scripts de Bootstrap
for doc in "${README}" "${CONTRIBUTING}"; do
  if ! grep -qF "scripts/bootstrap-dev.sh" "${doc}"; then
    fail "${doc} não instrui a execução de scripts/bootstrap-dev.sh."
  fi
  if ! grep -qF "scripts/bootstrap-dev.ps1" "${doc}"; then
    fail "${doc} não instrui a execução de scripts/bootstrap-dev.ps1."
  fi
done
pass "Scripts de bootstrap (scripts/bootstrap-dev.sh e scripts/bootstrap-dev.ps1) devidamente referenciados."

# 5. Reset Forçado do Seed (--force)
for doc in "${README}" "${CONTRIBUTING}"; do
  if ! grep -qF "pnpm db:seed --force" "${doc}"; then
    fail "${doc} não explica o uso deliberado de 'pnpm db:seed --force' para restaurar matrículas em instalações legadas."
  fi
done
pass "Instrução de reset deliberado 'pnpm db:seed --force' presente em ambos os guias."

# 6. Requisito de Versão do Node (>= 24) e Diagnóstico de Docker
for doc in "${README}" "${CONTRIBUTING}"; do
  if ! grep -qE "Node(\.js)?.*(>= ?24|24)" "${doc}"; then
    fail "${doc} não declara o requisito de Node.js >= 24."
  fi
  if ! grep -qE "Docker" "${doc}"; then
    fail "${doc} não menciona Docker como pré-requisito local."
  fi
done
pass "Requisitos de Node >= 24 e Docker confirmados em README.md e CONTRIBUTING.md."

echo "=========================================================="
echo "✅ Todos os contratos de onboarding estão 100% sincronizados!"
echo "=========================================================="
