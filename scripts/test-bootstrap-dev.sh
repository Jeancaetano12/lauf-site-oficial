#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd -- "${SCRIPT_DIR}/.." && pwd)
BOOTSTRAP_SCRIPT="${PROJECT_ROOT}/scripts/bootstrap-dev.sh"

fail() {
  echo "TEST FAIL: $*" >&2
  exit 1
}

pass() {
  echo "TEST PASS: $*"
}

TMP_TEST_DIR=$(mktemp -d /tmp/test-bootstrap-dev-XXXXXX)
trap 'rm -rf "${TMP_TEST_DIR}"' EXIT

mkdir -p "${TMP_TEST_DIR}/bin" "${TMP_TEST_DIR}/etc" "${TMP_TEST_DIR}/log"

MOCK_LOG="${TMP_TEST_DIR}/log/calls.log"
touch "${MOCK_LOG}"

# Helper para criar binários falsos (mocks)
make_mock() {
  local name=$1
  local body=$2
  cat <<EOF > "${TMP_TEST_DIR}/bin/${name}"
#!/usr/bin/env bash
echo "${name} \$*" >> "${MOCK_LOG}"
${body}
EOF
  chmod +x "${TMP_TEST_DIR}/bin/${name}"
}

echo "=== Iniciando Smoke Tests do bootstrap-dev.sh ==="

# --- Cenário 1: Node >= 24 compatível já instalado ---
echo "--- Cenário 1: Node 24+ já presente (nenhuma instalação deve ocorrer) ---"
: > "${MOCK_LOG}"
cat <<'EOF' > "${TMP_TEST_DIR}/etc/os-release"
ID=ubuntu
VERSION_ID="24.04"
EOF

make_mock "node" '
if [ "${1:-}" = "-v" ]; then
  echo "v24.2.0"
  exit 0
fi
if [ "${1:-}" = "-e" ]; then
  echo "pnpm@11.19.0"
  exit 0
fi
'
make_mock "corepack" '
echo "corepack $*"
exit 0
'
make_mock "pnpm" '
echo "11.19.0"
exit 0
'
make_mock "docker" '
echo "Docker version 28.0.0"
exit 0
'
make_mock "apt-get" '
echo "ERRO: apt-get não deveria ser chamado no Cenário 1" >&2
exit 1
'
make_mock "sudo" '
echo "ERRO: sudo não deveria ser chamado no Cenário 1" >&2
exit 1
'
make_mock "curl" '
echo "ERRO: curl não deveria ser chamado no Cenário 1" >&2
exit 1
'

export PATH="${TMP_TEST_DIR}/bin:${PATH}"
export BOOTSTRAP_OS_RELEASE="${TMP_TEST_DIR}/etc/os-release"

bash "${BOOTSTRAP_SCRIPT}" > "${TMP_TEST_DIR}/output_c1.txt" 2>&1 || fail "Cenário 1 falhou na execução"

if grep -q "apt-get" "${MOCK_LOG}"; then
  fail "Cenário 1 chamou apt-get indevidamente"
fi
if grep -q "sudo" "${MOCK_LOG}"; then
  fail "Cenário 1 chamou sudo indevidamente"
fi
if grep -q "curl" "${MOCK_LOG}"; then
  fail "Cenário 1 chamou curl indevidamente"
fi
pass "Cenário 1: Node compatível preservado sem chamadas de rede ou privilégio"

# --- Cenário 2: Sistema não-Debian/Ubuntu (deve abortar com diagnóstico em pt-BR) ---
echo "--- Cenário 2: Sistema não suportado (ex: Fedora) ---"
: > "${MOCK_LOG}"
cat <<'EOF' > "${TMP_TEST_DIR}/etc/os-release"
ID=fedora
VERSION_ID="40"
EOF

# Node obsoleto para acionar a rota de instalação
make_mock "node" '
echo "v20.0.0"
exit 0
'

set +e
bash "${BOOTSTRAP_SCRIPT}" > "${TMP_TEST_DIR}/output_c2.txt" 2>&1
C2_EXIT=$?
set -e

if [ "${C2_EXIT}" -eq 0 ]; then
  fail "Cenário 2 deveria retornar código não-zero para sistema não suportado"
fi
if ! grep -qi "Debian" "${TMP_TEST_DIR}/output_c2.txt" && ! grep -qi "Ubuntu" "${TMP_TEST_DIR}/output_c2.txt"; then
  fail "Cenário 2 não apresentou orientação explicativa mencionando Debian/Ubuntu"
fi
if grep -q "dnf" "${MOCK_LOG}" || grep -q "yum" "${MOCK_LOG}" || grep -q "pacman" "${MOCK_LOG}"; then
  fail "Cenário 2 tentou usar gerenciador alternativo automaticamente"
fi
pass "Cenário 2: Sistema não suportado encerra com erro claro e sem efeitos colaterais"

# --- Cenário 3: Node ausente em Ubuntu (instalação segura via NodeSource) ---
echo "--- Cenário 3: Node ausente em Ubuntu (instalação via NodeSource sem pipe remoto) ---"
: > "${MOCK_LOG}"
cat <<'EOF' > "${TMP_TEST_DIR}/etc/os-release"
ID=ubuntu
VERSION_ID="22.04"
EOF

# Remove node mock temporariamente para simular ausência
rm -f "${TMP_TEST_DIR}/bin/node"

make_mock "curl" '
# Simula download do script para arquivo
for arg in "$@"; do
  if [[ "$arg" == */setup_24.x* ]]; then
    # cria arquivo falso
    out_file="${@: -1}"
    echo "#!/bin/bash" > "$out_file"
    echo "echo nodesource-script-executed" >> "$out_file"
    chmod +x "$out_file"
    exit 0
  fi
done
exit 0
'
make_mock "sudo" '
while [ $# -gt 0 ] && [[ "$1" == -* ]]; do
  shift
done
"$@"
'
make_mock "apt-get" '
if [ "${1:-}" = "install" ]; then
  cat <<EON > "'"${TMP_TEST_DIR}"'/bin/node"
#!/usr/bin/env bash
if [ "\${1:-}" = "-v" ]; then
  echo "v24.0.0"
  exit 0
fi
if [ "\${1:-}" = "-e" ]; then
  echo "pnpm@11.19.0"
  exit 0
fi
EON
  chmod +x "'"${TMP_TEST_DIR}"'/bin/node"
fi
exit 0
'

bash "${BOOTSTRAP_SCRIPT}" > "${TMP_TEST_DIR}/output_c3.txt" 2>&1 || {
  echo "--- Detalhes do erro no Cenário 3 ---"
  cat "${TMP_TEST_DIR}/output_c3.txt"
  fail "Cenário 3 falhou na execução"
}

if ! grep -q "curl" "${MOCK_LOG}"; then
  fail "Cenário 3 não invocou curl para baixar NodeSource"
fi
if ! grep -q "apt-get install.*nodejs" "${MOCK_LOG}"; then
  fail "Cenário 3 não instalou nodejs via apt-get"
fi
pass "Cenário 3: Node ausente instalado com sucesso via NodeSource e apt-get"

# --- Cenário 4: Checagem estrita contra instalação de Docker/Compose ---
echo "--- Cenário 4: Garantir ausência total de tentativas de instalação de Docker ---"
if grep -q "apt-get.*docker" "${MOCK_LOG}" || grep -q "apt-get.*docker-compose" "${MOCK_LOG}"; then
  fail "Cenário 4 detectou tentativa indevida de instalar Docker via apt-get"
fi
pass "Cenário 4: Nenhuma tentativa de instalação de Docker/Compose detectada"

echo "=== Todos os testes do test-bootstrap-dev.sh foram aprovados com sucesso! ==="
