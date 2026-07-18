#!/usr/bin/env bash
# ============================================================
#  Lógica em Jogo — iniciar o servidor (Linux / WSL / macOS)
#  Uso:  ./iniciar-servidor.sh
#  (na primeira vez:  chmod +x iniciar-servidor.sh)
# ============================================================
cd "$(dirname "$0")" || exit 1

echo "============================================"
echo "   LÓGICA EM JOGO — iniciar servidor"
echo "============================================"
echo

# --- Dependências instaladas? (só na primeira vez) ---
if [ ! -d node_modules ]; then
  echo "Primeira vez: instalando dependências (demora alguns minutos)..."
  echo
  npm install || { echo "ERRO ao instalar as dependências. O Node.js está instalado?"; exit 1; }
fi

# --- Qual mundo abrir ---
echo "Escolha o mundo:"
echo "   [1] Mundo livre (construção livre)   <-- padrão"
echo "   [2] Aula 1"
echo "   [3] Aula 2"
echo "   [4] Aula 3"
echo
read -r -p "Digite o número e tecle Enter (Enter direto = 1): " ESCOLHA

case "$ESCOLHA" in
  2) export LJ_SAVE="cenarios/aula1.ljw" ;;
  3) export LJ_SAVE="cenarios/aula2.ljw" ;;
  4) export LJ_SAVE="cenarios/aula3.ljw" ;;
  *) export LJ_SAVE="world.ljw" ;;
esac

# --- Código do professor (opcional) ---
echo
read -r -p "Código do professor (Enter = manter o atual / gerar um): " CODIGO
[ -n "$CODIGO" ] && export LJ_CODIGO="$CODIGO"

# Cria o mundo caso ainda não exista (vale para o "mundo livre" na 1ª vez).
export LJ_NOVO=1

echo
echo "--------------------------------------------"
echo " Mundo:  $LJ_SAVE"
echo " Os ALUNOS abrem no navegador o endereço"
echo " http://...:8080 que aparece logo abaixo."
echo " Para PARAR: Ctrl+C."
echo "--------------------------------------------"
echo

npm run start -w server
