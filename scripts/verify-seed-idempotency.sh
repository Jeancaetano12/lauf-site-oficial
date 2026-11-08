#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd -- "${SCRIPT_DIR}/.." && pwd)

fail() {
  echo "ERRO: $*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "Docker não está disponível. Instale e inicie o Docker antes de executar este verificador."
docker compose version >/dev/null 2>&1 || fail "Docker Compose não está disponível. Instale uma versão compatível antes de executar este verificador."

cd "${PROJECT_ROOT}"

psql_query() {
  docker compose exec -T postgres \
    psql -U admin -d lauf_db -v ON_ERROR_STOP=1 -At -c "$1"
}

expect_equal() {
  local actual=$1
  local expected=$2
  local description=$3

  if [[ "${actual}" != "${expected}" ]]; then
    fail "${description}. Esperado: '${expected}'. Obtido: '${actual}'."
  fi
}

docker compose up -d postgres
pnpm db:migrate
pnpm db:seed --force

legacy_matricula='25123456'
psql_query "UPDATE \"Usuario\" SET matricula = '${legacy_matricula}' WHERE email = 'aluno@lauf.com';"

legacy_after_update=$(psql_query "SELECT matricula FROM \"Usuario\" WHERE email = 'aluno@lauf.com';")
expect_equal "${legacy_after_update}" "${legacy_matricula}" "A matrícula legada temporária não foi aplicada"

pnpm db:seed

legacy_after_standard_seed=$(psql_query "SELECT matricula FROM \"Usuario\" WHERE email = 'aluno@lauf.com';")
expect_equal "${legacy_after_standard_seed}" "${legacy_matricula}" "O seed padrão alterou uma conta existente"

pnpm db:seed --force

official_matriculas=$(psql_query "SELECT email || ':' || matricula FROM \"Usuario\" WHERE email IN ('admin@lauf.com', 'professor@lauf.com', 'aluno@lauf.com') ORDER BY CASE email WHEN 'admin@lauf.com' THEN 1 WHEN 'professor@lauf.com' THEN 2 WHEN 'aluno@lauf.com' THEN 3 END;")
expected_official_matriculas=$'admin@lauf.com:240581739\nprofessor@lauf.com:240694182\naluno@lauf.com:25047381'
expect_equal "${official_matriculas}" "${expected_official_matriculas}" "O seed forçado não restaurou exatamente as matrículas oficiais"

echo "OK: seed padrão preserva contas existentes e --force restaura as matrículas oficiais."
