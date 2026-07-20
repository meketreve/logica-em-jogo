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
echo "   [2] Aula 1 — Continue a regra"
echo "   [3] Aula 2 — Escreva 45 em binário"
echo "   [4] Aula 3 — Ache os 2 erros"
echo "   [5] Aula 4 — Decifre a mensagem"
echo "   [6] Aula 5 — Conserte o desenho"
echo "   [7] Aula 6 — Siga o manual"
echo
read -r -p "Digite o número e tecle Enter (Enter direto = 1): " ESCOLHA

case "$ESCOLHA" in
  2) export LJ_SAVE="cenarios/aula1-sequencia.ljw" ;;
  3) export LJ_SAVE="cenarios/aula2-binario.ljw" ;;
  4) export LJ_SAVE="cenarios/aula3-depurar.ljw" ;;
  5) export LJ_SAVE="cenarios/aula4-decifrar.ljw" ;;
  6) export LJ_SAVE="cenarios/aula5-simetria.ljw" ;;
  7) export LJ_SAVE="cenarios/aula6-manual.ljw" ;;
  *) export LJ_SAVE="world.ljw" ;;
esac

# --- Código do professor (opcional) ---
echo
read -r -p "Código do professor (Enter = manter o atual / gerar um): " CODIGO
[ -n "$CODIGO" ] && export LJ_CODIGO="$CODIGO"

# --- Tamanho do mundo (só vale se o mundo for NOVO) ---
echo
read -r -p "Tamanho do mundo novo P/M/G (Enter = P pequeno): " TAMANHO
case "$TAMANHO" in
  [mM]) export LJ_TAMANHO="M" ;;
  [gG]) export LJ_TAMANHO="G" ;;
  *) export LJ_TAMANHO="P" ;;
esac

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
