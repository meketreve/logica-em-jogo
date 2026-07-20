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

# --- Pasta dos mundos salvos + migração do save antigo ---
mkdir -p mundos
# Versões antigas salvavam o mundo livre em world.ljw na raiz. Move pra mundos/
# na primeira execução pra não perder a construção da turma.
if [ ! -f mundos/mundo-livre.ljw ] && [ -f world.ljw ]; then
  mv world.ljw mundos/mundo-livre.ljw
  echo "(mundo livre antigo movido para mundos/mundo-livre.ljw)"
  echo
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
echo "   [8] Carregar mundo salvo (da pasta mundos/)"
echo
read -r -p "Digite o número e tecle Enter (Enter direto = 1): " ESCOLHA

case "$ESCOLHA" in
  2) export LJ_SAVE="cenarios/aula1-sequencia.ljw" ;;
  3) export LJ_SAVE="cenarios/aula2-binario.ljw" ;;
  4) export LJ_SAVE="cenarios/aula3-depurar.ljw" ;;
  5) export LJ_SAVE="cenarios/aula4-decifrar.ljw" ;;
  6) export LJ_SAVE="cenarios/aula5-simetria.ljw" ;;
  7) export LJ_SAVE="cenarios/aula6-manual.ljw" ;;
  8)
    echo
    echo "Mundos salvos em mundos/:"
    SAVES=()
    while IFS= read -r f; do SAVES+=("$f"); done < <(ls -1 mundos/*.ljw 2>/dev/null)
    if [ ${#SAVES[@]} -eq 0 ]; then
      echo "   (nenhum mundo salvo ainda — abrindo o mundo livre)"
      export LJ_SAVE="mundos/mundo-livre.ljw"
    else
      i=1
      for f in "${SAVES[@]}"; do
        nome="$(basename "$f")"
        echo "   [$i] ${nome%.ljw}"
        i=$((i + 1))
      done
      echo
      read -r -p "Número do mundo salvo (Enter = 1): " N
      [ -z "$N" ] && N=1
      SEL="${SAVES[$((N - 1))]}"
      if [ -n "$SEL" ]; then
        export LJ_SAVE="$SEL"
      else
        echo "(número inválido — abrindo o mundo livre)"
        export LJ_SAVE="mundos/mundo-livre.ljw"
      fi
    fi
    ;;
  *) export LJ_SAVE="mundos/mundo-livre.ljw" ;;
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
