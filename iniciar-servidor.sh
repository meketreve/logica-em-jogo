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

# ============================================================
#  Atualização (git) — só a máquina do PROFESSOR atualiza: o aluno abre o
#  navegador e recebe o cliente DESTE servidor. `client/dist` é versionado,
#  então não há nada pra compilar aqui.
#  Pula sozinho, sem travar a aula, quando: LJ_SEM_UPDATE=1, a pasta não é
#  clone do git, o git não está instalado, o branch não é main, ou a rede não
#  responde.
#  MUDANÇA LOCAL NÃO PULA MAIS A BUSCA (era o bug-567): o `git fetch` acontece
#  de qualquer jeito, e quem sujou os arquivos decide na hora — as mudanças vão
#  pro `git stash` (guardadas, nunca apagadas) e a atualização segue.
# ============================================================

# Depois de um merge bem-sucedido: dependência nova só chega por aqui.
concluir_atualizacao() {
  echo "Conferindo as dependências..."
  npm install || echo "(aviso: npm install falhou — se o servidor não subir, rode 'npm install' à mão)"
}

# Lista de arquivos RASTREADOS modificados nesta máquina, um por linha.
# Arquivo novo/solto NÃO conta (`-uno`): senão qualquer .ljw exportado pra raiz
# entraria na conversa — e o git nunca sobrescreve arquivo não rastreado.
sujeira_local() {
  git status --porcelain --untracked-files=no
}

# Imprime a lista indentada, com teto de 10 linhas (no Windows o suspeito comum
# é fim-de-linha CRLF sujando o repo inteiro; aqui, o diário do OpenWolf).
listar_ate_10() {
  local lista="$1" n
  echo "$lista" | head -n 10 | while IFS= read -r linha; do echo "    $linha"; done
  n="$(echo "$lista" | wc -l | tr -d ' ')"
  [ "$n" -gt 10 ] && echo "    ... e mais $((n - 10)) (são $n no total)"
  return 0
}

atualizar() {
  [ -n "$LJ_SEM_UPDATE" ] && { echo "(LJ_SEM_UPDATE=1: não vou procurar atualização)"; return; }
  [ -d .git ] || { echo "(esta pasta não veio de um clone do git: atualização automática desligada)"; return; }
  command -v git >/dev/null 2>&1 || { echo "(git não encontrado — instale o git para atualizar daqui)"; return; }
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  [ "$branch" = "main" ] || { echo "(branch \"$branch\": atualização automática só vale no main)"; return; }
  echo "Procurando atualização..."
  git fetch --quiet origin || { echo "(sem conexão com o servidor do código — seguindo com a versão instalada)"; return; }
  local atras
  atras="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)"
  [ "$atras" != "0" ] || { echo "Já está na versão mais nova."; return; }
  echo
  echo "Existem $atras atualização(ões) nova(s):"
  git --no-pager log --oneline --no-decorate -n 5 HEAD..origin/main
  echo

  # --- A pasta dos mundos salvos é intocável, e isso é CONFERIDO ---
  # `mundos/` está no .gitignore e nenhum arquivo dela é rastreado, então a
  # atualização não a alcança — os mundos que viajam no repo são os MODELOS de
  # aula, em `cenarios/`. A conferência existe porque o dia em que alguém
  # versionar um .ljw de turma por engano, o professor tem de ser avisado ANTES
  # de a turma perder o que construiu, e não depois. Padrão = NÃO sobrescrever.
  local mundos_tocados
  mundos_tocados="$(git diff --name-only HEAD...origin/main -- mundos/ 2>/dev/null)"
  if [ -n "$mundos_tocados" ]; then
    echo "ATENÇÃO: esta atualização MEXE na pasta dos mundos salvos (mundos/):"
    listar_ate_10 "$mundos_tocados"
    echo "  Os mundos que a sua turma construiu podem ser SOBRESCRITOS."
    read -r -p "  Sobrescrever os mundos salvos? [s/N] (Enter = não): " SOBR
    case "$SOBR" in
      [sS]*) echo "  (ok — a atualização vai sobrescrever mundos/)" ;;
      *) echo "  (mantendo os mundos salvos — atualização cancelada)"; return ;;
    esac
  else
    echo "(seus mundos salvos em mundos/ não são tocados pela atualização)"
  fi

  echo
  read -r -p "Atualizar agora? [S/n] (Enter = sim): " UPD
  case "$UPD" in
    [nN]*) echo "(mantendo a versão atual)"; return ;;
  esac

  # --ff-only: nunca cria commit de merge na máquina da escola; se divergiu,
  # avisa e segue jogando com o que já funciona.
  local saida
  if saida="$(git merge --ff-only origin/main 2>&1)"; then
    echo "$saida"
    echo "Atualizado."
    concluir_atualizacao
    return
  fi

  # O merge recusou. A causa comum NÃO é divergência: é arquivo rastreado
  # modificado aqui que a atualização também mexe (nesta pasta o
  # `.wolf/memory.md` do OpenWolf muda sozinho a cada sessão, e os commits
  # `docs(wolf)` mexem justamente nele).
  local sujo
  sujo="$(sujeira_local)"
  if [ -z "$sujo" ]; then
    # `$saida` NÃO vai pra tela: o git manda rodar `git rebase`/`git merge --no-ff`,
    # e essa não é conversa pra ter com o professor no começo da aula.
    echo
    echo "NÃO foi possível atualizar automaticamente (a cópia local divergiu)."
    echo "Seguindo com a versão instalada."
    return
  fi
  echo
  echo "NÃO foi possível atualizar: há arquivo(s) alterado(s) nesta máquina"
  echo "que a atualização também mexe:"
  listar_ate_10 "$sujo"
  echo
  read -r -p "  Guardar essas mudanças e atualizar mesmo assim? [S/n] (Enter = sim): " GUARDAR
  case "$GUARDAR" in
    [nN]*) echo "  (mantendo a versão atual — nada foi mexido)"; return ;;
  esac
  # `git stash push` GUARDA, não apaga. Sem `--include-untracked` de propósito:
  # arquivo solto na pasta (um .ljw exportado, por exemplo) fica onde está.
  if ! git stash push --quiet -m "lj-auto"; then
    echo "  (não deu para guardar as mudanças — seguindo com a versão instalada)"
    return
  fi
  echo "  Guardado no git (stash \"lj-auto\")."
  if ! git merge --ff-only origin/main 2>/dev/null; then
    echo
    echo "Mesmo assim NÃO deu para atualizar (a cópia local divergiu)."
    echo "Devolvendo as suas mudanças..."
    git stash pop || echo "  (as mudanças seguem guardadas — recupere com: git stash pop)"
    echo "Seguindo com a versão instalada."
    return
  fi
  echo "Atualizado."
  # Sem `stash pop` automático: se o pop conflitar, a pasta fica em conflito no
  # meio da aula. Guardado é reversível; conflito na hora da aula, não.
  echo "  As suas mudanças NÃO foram perdidas: ficaram guardadas no git."
  echo "  Para trazer de volta:            git stash pop"
  echo "  Para só ver o que foi guardado:  git stash list"
  concluir_atualizacao
}
atualizar
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
