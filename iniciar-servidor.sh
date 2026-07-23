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

# --- Pasta dos mundos salvos + migração de saves antigos ---
mkdir -p mundos
# Cada mundo virou uma PASTA própria: mundos/<nome>/<nome>.ljw + chat.log.
# Migra layouts antigos pra esse formato na 1ª execução, sem perder a turma.
# 1) world.ljw na raiz (layout mais antigo) -> mundos/mundo-livre/
if [ -f world.ljw ] && [ ! -e mundos/mundo-livre/mundo-livre.ljw ]; then
  mkdir -p mundos/mundo-livre
  mv world.ljw mundos/mundo-livre/mundo-livre.ljw
  echo "(world.ljw antigo movido para mundos/mundo-livre/)"
fi
# 2) mundos/*.ljw achatados (layout anterior) -> mundos/<nome>/<nome>.ljw
for f in mundos/*.ljw; do
  [ -e "$f" ] || continue
  nome="$(basename "${f%.ljw}")"
  [ -e "mundos/$nome/$nome.ljw" ] && continue
  mkdir -p "mundos/$nome"
  mv "$f" "mundos/$nome/$nome.ljw"
  echo "(mundo '$nome' movido para a própria pasta)"
done

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
    for d in mundos/*/; do
      [ -d "$d" ] || continue
      nome="$(basename "$d")"
      [ -f "$d$nome.ljw" ] && SAVES+=("mundos/$nome/$nome.ljw")
    done
    if [ ${#SAVES[@]} -eq 0 ]; then
      echo "   (nenhum mundo salvo ainda — abrindo o mundo livre)"
      export LJ_SAVE="mundos/mundo-livre/mundo-livre.ljw"
    else
      i=1
      for f in "${SAVES[@]}"; do
        echo "   [$i] $(basename "$(dirname "$f")")"
        i=$((i + 1))
      done
      echo
      read -r -p "Número do mundo salvo (Enter = 1): " N
      [ -z "$N" ] && N=1
      SEL="${SAVES[$((N - 1))]}"
      if [ -n "$SEL" ]; then
        export LJ_SAVE="$SEL"
        PULAR_TAMANHO=1
      else
        echo "(número inválido — abrindo o mundo livre)"
        export LJ_SAVE="mundos/mundo-livre/mundo-livre.ljw"
      fi
    fi
    ;;
  *) export LJ_SAVE="mundos/mundo-livre/mundo-livre.ljw" ;;
esac

# --- Código do professor (opcional) ---
echo
read -r -p "Código do professor (Enter = manter o atual / gerar um): " CODIGO
[ -n "$CODIGO" ] && export LJ_CODIGO="$CODIGO"

# --- Tamanho do mundo (só vale se o mundo for NOVO) ---
# Carregar mundo salvo [8]: o save já tem as dimensões -> pula o menu de tamanho.
if [ -z "$PULAR_TAMANHO" ]; then
  echo
  read -r -p "Tamanho do mundo novo P/M/G (Enter = P pequeno): " TAMANHO
  case "$TAMANHO" in
    [mM]) export LJ_TAMANHO="M" ;;
    [gG]) export LJ_TAMANHO="G" ;;
    *) export LJ_TAMANHO="P" ;;
  esac
fi

# --- Desempenho da água (opcional, só se o FPS cair) ---
# Teto de células de água que FLUEM por tick. Menor = FPS mais estável numa
# cascata grande (a água escorre um pouco mais devagar). Enter = padrão (256).
echo
read -r -p "Água por tick — só se o FPS cair em cascata grande (Enter = padrão 256): " AGUA
[ -n "$AGUA" ] && export LJ_AGUA_TICK="$AGUA"

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
