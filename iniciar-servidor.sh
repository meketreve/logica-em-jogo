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
#  Atualização — só a máquina do PROFESSOR atualiza: o aluno abre o navegador e
#  recebe o cliente DESTE servidor. `client/dist` é versionado, então não há
#  nada pra compilar aqui.
#
#  DOIS CAMINHOS, escolhidos pela pasta:
#   - é clone do git  -> `git fetch` + `merge --ff-only` (o de sempre; é a
#     máquina de quem desenvolve, e o histórico local vale mais que a cópia).
#   - NÃO é clone     -> baixa o pacote do branch no GitHub e copia por cima,
#     o mesmo que o .bat faz na escola (lá o git é bloqueado). A versão
#     instalada fica gravada em ".lj-versao" — o MESMO arquivo do .bat.
#
#  Pula sozinho, sem travar a aula, quando: LJ_SEM_UPDATE=1, falta git (ou
#  curl/tar, no caminho do pacote), o branch não é main, ou a rede não responde.
#  MUDANÇA LOCAL NÃO PULA MAIS A BUSCA (era o bug-567): o `git fetch` acontece
#  de qualquer jeito, e quem sujou os arquivos decide na hora — as mudanças vão
#  pro `git stash` (guardadas, nunca apagadas) e a atualização segue.
# ============================================================
LJ_DONO="meketreve"
LJ_NOME="logica-em-jogo"
LJ_RAMO="main"

# Depois de um merge bem-sucedido: dependência nova só chega por aqui.
#
# O `npm run build` é REDE DE SEGURANÇA (2026-08-23), não o caminho normal:
# `client/dist` é versionado e viaja pronto no repositório, mas um commit que
# mexe em `client/src` e esquece de reconstruir o dist chegaria aqui como TELA
# VELHA. Reconstruir depois de atualizar garante que o patch chegou inteiro.
# A ferramenta já está na máquina: o `npm install` acima não usa `--omit=dev`
# (não pode — o próprio servidor roda com `tsx`, que é devDependency), então o
# `vite` do client já vem junto.
#
# ⚠️ NUNCA fatal. Se o build falhar, o dist que veio no pacote continua ali e a
# aula acontece com a tela de ontem — que é infinitamente melhor que aula
# nenhuma no meio do horário.
concluir_atualizacao() {
  echo "Conferindo as dependências..."
  npm install || echo "(aviso: npm install falhou — se o servidor não subir, rode 'npm install' à mão)"
  echo "Reconstruindo a tela do jogo (alguns segundos)..."
  if npm run build > "${TMPDIR:-/tmp}/lj-build.log" 2>&1; then
    echo "Tela do jogo reconstruída."
  else
    echo "(aviso: não deu para reconstruir a tela — seguindo com a que veio no pacote)"
    echo "(detalhes em ${TMPDIR:-/tmp}/lj-build.log)"
  fi
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

# --- Caminho SEM git: baixa o pacote do branch e copia por cima -------------
# É o que o .bat faz na escola. Diferença de ferramenta, de propósito: o .bat
# baixa .zip porque o tar.exe do Windows lê zip; o tar do GNU NÃO lê zip, então
# aqui o endereço é o .tar.gz. Mesmo conteúdo, mesma pasta de dentro
# (<repo>-<ramo>), mesmo ".lj-versao" gravado no fim.
# O rótulo que a PESSOA lê (2026-09-03: "Loja: monte seu comércio (02/09/2026)",
# não mais "0.9.0") mora em `shared/src/build-info.json` — `data`+`titulo`
# nascem do `changelog.ts` já extraídos por `scripts/gerar-build-info.mjs`
# (Node), então aqui é só JSON simples de campo curto: nada de parsear texto
# livre com dois-pontos dentro em shell puro. O sha de 40 caracteres continua
# sendo a identidade do update (é ele que responde "estou na última?"); o
# rótulo é o que o professor consegue LER na tela e repetir no telefone.
rotulo_build() {
  [ -f "$1" ] || return 0
  local data titulo
  data="$(sed -n 's/.*"data"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$1" | head -n1)"
  titulo="$(sed -n 's/.*"titulo"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p' "$1" | head -n1)"
  [ -n "$titulo" ] || return 0
  if [ -n "$data" ]; then
    echo "$titulo (${data:8:2}/${data:5:2}/${data:0:4})"
  else
    echo "$titulo"
  fi
}

# Diz o que MUDOU, com o rótulo na frente e o commit entre parênteses. Duas
# frases porque os dois casos são diferentes na cabeça do professor: chegou
# novidade NOVA (rótulo mudou) é uma frase; ganhou só correção por baixo do
# capô da MESMA novidade (rótulo igual) é outra — senão "atualizado" parece
# que nada mudou.
anunciar_versao() {
  local antes="$1" depois="$2" commit="$3"
  if [ -n "$antes" ] && [ -n "$depois" ] && [ "$antes" != "$depois" ]; then
    echo "Atualizado! Novidade agora: $depois (commit ${commit:0:7})."
  elif [ -n "$depois" ]; then
    echo "Atualizado — continua em $depois, com as correções mais novas (commit ${commit:0:7})."
  else
    echo "Atualizado para a ${commit:0:7}."
  fi
}

atualizar_pacote() {
  command -v curl >/dev/null 2>&1 || { echo "(esta pasta não veio de um clone do git e não há curl aqui: atualização automática desligada)"; return; }
  command -v tar  >/dev/null 2>&1 || { echo "(esta pasta não veio de um clone do git e não há tar aqui: atualização automática desligada)"; return; }

  echo "Procurando atualização..."
  # O cabeçalho "Accept: ...github.sha" faz a API responder o commit em texto
  # puro, só os 40 caracteres — assim não é preciso ler JSON no shell.
  local nova atual
  nova="$(curl -sL --max-time 15 -H 'Accept: application/vnd.github.sha' \
    "https://api.github.com/repos/$LJ_DONO/$LJ_NOME/commits/$LJ_RAMO" 2>/dev/null | tr -d ' \r\n')"
  # Resposta boa = exatamente 40 caracteres hexadecimais. Erro da API volta como
  # JSON, que nunca passa nas duas conferências.
  case "$nova" in
    ""|*[!0-9a-f]*) echo "(o GitHub não respondeu direito — seguindo com a versão instalada)"; return ;;
  esac
  [ ${#nova} -eq 40 ] || { echo "(o GitHub não respondeu direito — seguindo com a versão instalada)"; return; }

  atual=""
  [ -f .lj-versao ] && atual="$(tr -d ' \r\n' < .lj-versao)"
  [ "$atual" = "$nova" ] && { echo "Já está na versão mais nova."; return; }
  local aqui
  aqui="$(rotulo_build ./shared/src/build-info.json)"
  echo
  if [ -z "$atual" ]; then
    echo "Não dá para saber que versão está instalada aqui (falta o arquivo .lj-versao)."
    echo "A mais nova no GitHub é o commit ${nova:0:7} — baixar agora resolve isso de vez."
  elif [ -n "$aqui" ]; then
    # o rótulo do LADO DE LÁ só se sabe depois de baixar (é o build-info do
    # pacote), então aqui a comparação é de commit e o rótulo é o de casa
    echo "Existe atualização: você está em $aqui (commit ${atual:0:7}) e o GitHub tem o commit ${nova:0:7}"
  else
    echo "Existe atualização: ${atual:0:7} -> ${nova:0:7}"
  fi
  echo
  read -r -p "Atualizar agora? [S/n] (Enter = sim): " UPD
  case "$UPD" in
    [nN]*) echo "(mantendo a versão atual)"; return ;;
  esac

  local tmp tgz src
  tmp="${TMPDIR:-/tmp}/lj-update"
  tgz="${TMPDIR:-/tmp}/lj-update.tar.gz"
  src="$tmp/$LJ_NOME-$LJ_RAMO"
  rm -rf "$tmp" "$tgz"
  echo "Baixando (uns 4 MB)..."
  if ! curl -L --max-time 300 --fail -o "$tgz" \
       "https://github.com/$LJ_DONO/$LJ_NOME/archive/refs/heads/$LJ_RAMO.tar.gz"; then
    echo "(o download falhou — seguindo com a versão instalada)"
    rm -rf "$tmp" "$tgz"; return
  fi
  mkdir -p "$tmp"
  if ! tar -xzf "$tgz" -C "$tmp" 2>/dev/null; then
    echo "(não deu para abrir o pacote — seguindo com a versão instalada)"
    rm -rf "$tmp" "$tgz"; return
  fi
  if [ ! -f "$src/package.json" ]; then
    echo "(o pacote veio num formato inesperado — seguindo com a versão instalada)"
    rm -rf "$tmp" "$tgz"; return
  fi

  # --- A pasta dos mundos salvos é intocável, e isso é CONFERIDO ---
  # `mundos/` está no .gitignore e nenhum arquivo dela é rastreado, então ela
  # não viaja no pacote — os mundos que viajam são os MODELOS de aula, em
  # `cenarios/`. A conferência existe porque o dia em que alguém versionar um
  # .ljw de turma por engano, o professor tem de ser avisado ANTES de a turma
  # perder o que construiu. Padrão = NÃO sobrescrever.
  if [ -d "$src/mundos" ]; then
    echo
    echo "ATENÇÃO: esta atualização TRAZ arquivos para a pasta dos mundos salvos (mundos/):"
    listar_ate_10 "$(ls -1 "$src/mundos")"
    echo "  Os mundos que a sua turma construiu podem ser SOBRESCRITOS."
    read -r -p "  Sobrescrever os mundos salvos? [s/N] (Enter = não): " SOBR
    case "$SOBR" in
      [sS]*) echo "  (ok — a atualização vai sobrescrever mundos/)" ;;
      *) rm -rf "$src/mundos"; echo "  (ok — os mundos salvos ficam como estão)" ;;
    esac
  else
    echo "(seus mundos salvos em mundos/ não são tocados pela atualização)"
  fi

  # --- O próprio launcher mudou nesta atualização? ---
  # O bash lê ESTE arquivo aos poucos enquanto executa: escrever por cima do
  # mesmo inode corrompe a rodada em andamento. Então o novo é gravado ao lado
  # e RENOMEADO por cima — rename troca só o nome, e o processo atual segue
  # lendo o inode velho até o fim. O temporário fica na MESMA pasta de
  # propósito: rename só vale dentro do mesmo sistema de arquivos (vindo de
  # /tmp o `mv` viraria cópia por cima, que é justamente o que se evita).
  # Por isso não há o relançamento de janela que o .bat faz: aqui a rodada atual
  # termina com o launcher velho, e o novo vale na próxima.
  local troca=""
  if ! cmp -s "$src/iniciar-servidor.sh" ./iniciar-servidor.sh; then
    troca=".lj-launcher-novo.sh"
    cp "$src/iniciar-servidor.sh" "./$troca"
  fi
  rm -f "$src/iniciar-servidor.sh"

  # os dois rótulos TÊM de ser lidos antes da cópia: depois dela o build-info
  # de casa já é o novo, e a frase viraria "da X para a X"
  local ver_antes ver_depois
  ver_antes="$(rotulo_build ./shared/src/build-info.json)"
  ver_depois="$(rotulo_build "$src/shared/src/build-info.json")"

  echo "Aplicando a atualização..."
  # `cp -R origem/. destino` escreve por cima e acrescenta, nunca apaga o que é
  # só seu (mundos/, node_modules/, .env, .ljw exportado solto na pasta) — é o
  # robocopy SEM /PURGE do .bat. O "/." leva junto os arquivos ocultos.
  if ! cp -R "$src/." . ; then
    echo "(a cópia falhou — seguindo com a versão instalada)"
    rm -f "./$troca"; rm -rf "$tmp" "$tgz"; return
  fi
  echo "$nova" > .lj-versao
  anunciar_versao "$ver_antes" "$ver_depois" "$nova"
  concluir_atualizacao
  if [ -n "$troca" ]; then
    chmod +x "./$troca"
    mv -f "./$troca" ./iniciar-servidor.sh
    echo "(o próprio launcher mudou — a versão nova vale na próxima vez que você abrir este arquivo)"
  fi
  rm -rf "$tmp" "$tgz"
}

# Qual caminho serve NESTA pasta? Preenche LJ_CAMINHO (git|pacote|nenhum) e
# LJ_MOTIVO (a linha que o professor lê, ou vazio quando não há o que explicar).
#
# ⚠️ **A pergunta certa não é "existe .git?" — é "o git CONSEGUE atualizar
# aqui?".** A pasta da escola tinha um `.git` (sobra de um clone antigo, ou um
# ZIP extraído por cima de um) e os dois launchers a declaravam clone e
# DESLIGAVAM a atualização, mandando rodar `git pull` justamente para quem
# atualiza baixando o ZIP. Presença de pasta não é capacidade (bug-620).
#
# A distinção que decide tudo:
#  - o git **não pode** operar (não instalado, `.git` quebrado, sem `origin`)
#    → o pacote é a única saída, e ele é seguro: copia por cima e nunca apaga;
#  - o git **pode** operar e recusa (branch != main, árvore divergente)
#    → é o git dizendo não, e a resposta é PARAR. Copiar por cima aí pisaria no
#    trabalho de quem desenvolve, que é o motivo original de o caminho existir.
#
# `LJ_UPDATE=pacote` (ou `zip`) força o pacote; `LJ_UPDATE=git` força o git.
decidir_caminho_de_update() {
  LJ_MOTIVO=""
  case "$LJ_UPDATE" in
    pacote|zip)
      LJ_CAMINHO="pacote"
      LJ_MOTIVO="(LJ_UPDATE=$LJ_UPDATE: atualizando pelo pacote do GitHub, sem usar git)"
      return ;;
    git)
      LJ_CAMINHO="git"
      return ;;
  esac
  LJ_CAMINHO="pacote"
  # `-e` e não `-d`: em worktree/submódulo o `.git` é um ARQUIVO apontando pro
  # repositório de verdade, e ele também conta como "aqui tem git".
  [ -e .git ] || return   # veio do ZIP: nem vale mencionar o git
  local porque=""
  if ! command -v git >/dev/null 2>&1; then
    porque="o git não está instalado nesta máquina"
  elif [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" != "true" ]; then
    porque="a pasta .git não é um repositório utilizável"
  elif ! git config --get remote.origin.url >/dev/null 2>&1; then
    porque="o repositório não tem o remoto \"origin\""
  else
    LJ_CAMINHO="git"
    return
  fi
  LJ_MOTIVO="(esta pasta tem .git, mas $porque — atualizando pelo pacote do GitHub)"
}

atualizar() {
  [ -n "$LJ_SEM_UPDATE" ] && { echo "(LJ_SEM_UPDATE=1: não vou procurar atualização)"; return; }
  decidir_caminho_de_update
  if [ "$LJ_CAMINHO" = "pacote" ]; then
    [ -n "$LJ_MOTIVO" ] && echo "$LJ_MOTIVO"
    atualizar_pacote
    return
  fi
  command -v git >/dev/null 2>&1 || {
    echo "(LJ_UPDATE=git mas o git não está instalado — use LJ_UPDATE=pacote para baixar do GitHub)"
    return
  }
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  # Aqui o git PODE operar e está recusando — não se cai pro pacote (ver o
  # comentário do `decidir_caminho_de_update`). Quem quiser forçar, força.
  [ "$branch" = "main" ] || {
    echo "(branch \"$branch\": atualização automática só vale no main)"
    echo "(para baixar o pacote do GitHub mesmo assim: LJ_UPDATE=pacote ./iniciar-servidor.sh)"
    return
  }
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
  local saida ver_antes
  ver_antes="$(rotulo_build ./shared/src/build-info.json)"
  if saida="$(git merge --ff-only origin/main 2>&1)"; then
    echo "$saida"
    anunciar_versao "$ver_antes" "$(rotulo_build ./shared/src/build-info.json)" \
      "$(git rev-parse HEAD 2>/dev/null)"
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
  anunciar_versao "$ver_antes" "$(rotulo_build ./shared/src/build-info.json)" \
    "$(git rev-parse HEAD 2>/dev/null)"
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

# --- Sub-rotina: criar/abrir um mundo PROCEDURAL (enorme) com nome próprio ---
# Não sobrescreve o mundo-livre: cada procedural tem a própria pasta.
criar_procedural() {
  echo
  echo "Mundo PROCEDURAL: gigante (3840x3840), só gera onde você anda."
  echo "O terreno regenera do zero; só o que você CONSTRUIR é salvo."
  read -r -p "Nome do mundo (Enter = 'procedural'): " PNOME
  [ -z "$PNOME" ] && PNOME="procedural"
  PNOME="${PNOME// /-}"   # sem espaços (o nome vira a pasta em mundos/)
  export LJ_SAVE="mundos/$PNOME/$PNOME.ljw"
  export LJ_TAMANHO="E"
  echo "(mundo procedural: mundos/$PNOME/)"
}

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
echo "   [9] Criar mundo PROCEDURAL (gigante, gera conforme você explora)"
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
  9) criar_procedural ;;
  *) export LJ_SAVE="mundos/mundo-livre/mundo-livre.ljw" ;;
esac

# --- Código do professor (opcional) ---
echo
read -r -p "Código do professor (Enter = manter o atual / gerar um): " CODIGO
[ -n "$CODIGO" ] && export LJ_CODIGO="$CODIGO"

# --- Tamanho do mundo (só vale se o mundo for NOVO) ---
# O procedural [9] já fixou LJ_TAMANHO=E; nesse caso, pula o menu de tamanho.
# Carregar mundo salvo [8]: o save já tem as dimensões -> pula o menu de tamanho.
if [ -z "$PULAR_TAMANHO" ] && [ "$LJ_TAMANHO" != "E" ]; then
  echo
  echo "Tamanho do mundo novo:"
  echo "   [P] pequeno 128x128        (padrão)"
  echo "   [M] médio 192x192"
  echo "   [G] grande 256x256         (exige PC melhor)"
  echo "   [E] procedural — gigante, gera conforme você explora"
  read -r -p "Escolha P/M/G/E (Enter = P pequeno): " TAMANHO
  case "$TAMANHO" in
    [mM]) export LJ_TAMANHO="M" ;;
    [gG]) export LJ_TAMANHO="G" ;;
    [eE]|[pP]rocedural|PROCEDURAL) export LJ_TAMANHO="E" ;;
    *) export LJ_TAMANHO="P" ;;
  esac
fi

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
