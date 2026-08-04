@echo off
REM ============================================================
REM  Logica em Jogo - iniciar o servidor (Windows)
REM  Basta dar DUPLO-CLIQUE neste arquivo.
REM  (Roda pelo cmd.exe, entao NAO cai no bloqueio do PowerShell.)
REM ============================================================
chcp 65001 >nul
title Logica em Jogo - Servidor
cd /d "%~dp0"

echo ============================================
echo    LOGICA EM JOGO - iniciar servidor
echo ============================================
echo.

REM ============================================================
REM  Atualizacao (git) - so a maquina do PROFESSOR atualiza:
REM  o aluno abre o navegador e recebe o cliente deste servidor.
REM  client\dist e VERSIONADO, entao nao precisa compilar nada aqui.
REM  Pula sozinho, SEM travar a aula, quando: LJ_SEM_UPDATE=1, a pasta nao
REM  e um clone do git, o git nao esta instalado, o branch nao e o main, ou
REM  a rede nao responde.
REM  MUDANCA LOCAL NAO PULA MAIS A BUSCA (era o bug-567): o "git fetch"
REM  acontece de qualquer jeito, e quem sujou os arquivos decide na hora - as
REM  mudancas vao pro "git stash" (guardadas, nunca apagadas) e a atualizacao
REM  segue.
REM ============================================================
if defined LJ_SEM_UPDATE (
  echo ^(LJ_SEM_UPDATE=1: nao vou procurar atualizacao^)
  goto :depois_update
)
if not exist ".git" (
  echo ^(esta pasta nao veio de um clone do git: atualizacao automatica desligada^)
  goto :depois_update
)
where git >nul 2>nul
if errorlevel 1 (
  echo ^(git nao encontrado - instale em https://git-scm.com para atualizar daqui^)
  goto :depois_update
)
set "BRANCH="
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "BRANCH=%%b"
if not "%BRANCH%"=="main" (
  echo ^(branch "%BRANCH%": atualizacao automatica so vale no main^)
  goto :depois_update
)
echo Procurando atualizacao...
git fetch --quiet origin
if errorlevel 1 (
  echo ^(sem conexao com o GitHub - seguindo com a versao instalada^)
  goto :depois_update
)
set "ATRAS=0"
for /f %%n in ('git rev-list --count HEAD..origin/main 2^>nul') do set "ATRAS=%%n"
if "%ATRAS%"=="0" (
  echo Ja esta na versao mais nova.
  goto :depois_update
)
echo.
echo Existem %ATRAS% atualizacao^(oes^) nova^(s^):
git --no-pager log --oneline --no-decorate -n 5 HEAD..origin/main
echo.

REM --- A pasta dos mundos salvos e intocavel, e isso e CONFERIDO ---
REM "mundos\" esta no .gitignore e nenhum arquivo dela e rastreado, entao a
REM atualizacao nao a alcanca - os mundos que viajam no repo sao os MODELOS de
REM aula, em "cenarios\". A conferencia existe porque o dia em que alguem
REM versionar um .ljw de turma por engano, o professor tem de ser avisado ANTES
REM de a turma perder o que construiu. Padrao = NAO sobrescrever.
git diff --name-only HEAD...origin/main -- mundos/ > "%TEMP%\lj-mundos.txt" 2>nul
set "MUNDOSZ=0"
for %%s in ("%TEMP%\lj-mundos.txt") do set "MUNDOSZ=%%~zs"
if "%MUNDOSZ%"=="0" goto :mundos_intactos
echo ATENCAO: esta atualizacao MEXE na pasta dos mundos salvos ^(mundos\^):
setlocal enabledelayedexpansion
set /a LJM=0
for /f "usebackq delims=" %%l in ("%TEMP%\lj-mundos.txt") do (
  set /a LJM+=1
  if !LJM! leq 10 echo     %%l
)
if !LJM! gtr 10 echo     ... e mais arquivos ^(sao !LJM! no total^)
endlocal
del "%TEMP%\lj-mundos.txt" >nul 2>nul
echo   Os mundos que a sua turma construiu podem ser SOBRESCRITOS.
set "SOBR="
set /p "SOBR=  Sobrescrever os mundos salvos? [s/N] (Enter = nao): "
if /i "%SOBR%"=="s" goto :mundos_sobrescrever
if /i "%SOBR%"=="sim" goto :mundos_sobrescrever
echo   ^(mantendo os mundos salvos - atualizacao cancelada^)
goto :depois_update
:mundos_sobrescrever
echo   ^(ok - a atualizacao vai sobrescrever mundos\^)
goto :perguntar_update
:mundos_intactos
del "%TEMP%\lj-mundos.txt" >nul 2>nul
echo ^(seus mundos salvos em mundos\ nao sao tocados pela atualizacao^)
:perguntar_update
echo.
set "UPD="
set /p "UPD=Atualizar agora? [S/n] (Enter = sim): "
if /i "%UPD%"=="n" (
  echo ^(mantendo a versao atual^)
  goto :depois_update
)

REM --ff-only: nunca cria commit de merge na maquina da escola. Se nao der
REM fast-forward, avisa e segue jogando com o que ja funciona.
git merge --ff-only origin/main >nul 2>nul
if not errorlevel 1 goto :update_ok

REM O merge recusou. A causa comum NAO e divergencia: e arquivo rastreado
REM modificado aqui que a atualizacao tambem mexe (no Windows o suspeito comum
REM e fim-de-linha CRLF sujando o repo inteiro, entao a lista para em 10).
REM O "del" do arquivo temporario vem DEPOIS do uso: ele ja foi apagado antes
REM de dar pra ler uma vez (bug-567).
git status --porcelain --untracked-files=no > "%TEMP%\lj-git-status.txt" 2>nul
set "SUJO=0"
for %%s in ("%TEMP%\lj-git-status.txt") do set "SUJO=%%~zs"
if "%SUJO%"=="0" goto :update_divergiu
echo.
echo NAO foi possivel atualizar: ha arquivo^(s^) alterado^(s^) nesta maquina
echo que a atualizacao tambem mexe:
setlocal enabledelayedexpansion
set /a LJN=0
for /f "usebackq delims=" %%l in ("%TEMP%\lj-git-status.txt") do (
  set /a LJN+=1
  if !LJN! leq 10 echo     %%l
)
if !LJN! gtr 10 echo     ... e mais arquivos ^(sao !LJN! no total^)
endlocal
del "%TEMP%\lj-git-status.txt" >nul 2>nul
echo.
set "GUARDAR="
set /p "GUARDAR=  Guardar essas mudancas e atualizar mesmo assim? [S/n] (Enter = sim): "
if /i "%GUARDAR%"=="n" (
  echo   ^(mantendo a versao atual - nada foi mexido^)
  goto :depois_update
)
REM "git stash push" GUARDA, nao apaga. Sem --include-untracked de proposito:
REM arquivo solto na pasta (um .ljw exportado, por exemplo) fica onde esta.
git stash push --quiet -m "lj-auto"
if errorlevel 1 (
  echo   ^(nao deu para guardar as mudancas - seguindo com a versao instalada^)
  goto :depois_update
)
echo   Guardado no git ^(stash "lj-auto"^).
REM 2^>nul: no fracasso o git manda rodar "git rebase"/"git merge --no-ff", e
REM essa nao e conversa pra ter com o professor no comeco da aula.
git merge --ff-only origin/main 2>nul
if errorlevel 1 goto :update_stash_falhou
echo Atualizado.
REM Sem "stash pop" automatico: se o pop conflitar, a pasta fica em conflito no
REM meio da aula. Guardado e reversivel; conflito na hora da aula, nao.
echo   As suas mudancas NAO foram perdidas: ficaram guardadas no git.
echo   Para trazer de volta:            git stash pop
echo   Para so ver o que foi guardado:  git stash list
goto :update_deps

:update_stash_falhou
echo.
echo Mesmo assim NAO deu para atualizar ^(a copia local divergiu^).
echo Devolvendo as suas mudancas...
git stash pop
if errorlevel 1 echo   ^(as mudancas seguem guardadas - recupere com: git stash pop^)
echo Seguindo com a versao instalada.
goto :depois_update

:update_divergiu
del "%TEMP%\lj-git-status.txt" >nul 2>nul
echo.
echo NAO foi possivel atualizar automaticamente ^(a copia local divergiu^).
echo Seguindo com a versao instalada.
goto :depois_update

:update_ok
echo Atualizado.
:update_deps
echo Conferindo as dependencias...
call npm install
if errorlevel 1 echo ^(aviso: npm install falhou - se o servidor nao subir, rode "npm install" a mao^)
:depois_update
echo.

REM --- Dependencias instaladas? (so na primeira vez) ---
if not exist "node_modules" (
  echo Primeira vez: instalando dependencias. Isso demora alguns minutos...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo ERRO ao instalar as dependencias.
    echo Confira se o Node.js esta instalado ^(https://nodejs.org^).
    echo.
    pause
    exit /b 1
  )
)

REM --- Pasta dos mundos salvos + migracao de saves antigos ---
REM Cada mundo virou uma PASTA: mundos\<nome>\<nome>.ljw + chat.log.
if not exist "mundos" mkdir "mundos"
REM 1) world.ljw na raiz (layout mais antigo) -> mundos\mundo-livre\
if exist "world.ljw" if not exist "mundos\mundo-livre\mundo-livre.ljw" (
  if not exist "mundos\mundo-livre" mkdir "mundos\mundo-livre"
  move /y "world.ljw" "mundos\mundo-livre\mundo-livre.ljw" >nul
  echo ^(world.ljw antigo movido para mundos\mundo-livre\^)
)
REM 2) mundos\*.ljw achatados (layout anterior) -> mundos\<nome>\<nome>.ljw
for %%f in ("mundos\*.ljw") do (
  if not exist "mundos\%%~nf\%%~nf.ljw" (
    if not exist "mundos\%%~nf" mkdir "mundos\%%~nf"
    move /y "%%f" "mundos\%%~nf\%%~nf.ljw" >nul
    echo ^(mundo "%%~nf" movido para a propria pasta^)
  )
)

REM --- Qual mundo abrir ---
echo Escolha o mundo:
echo    [1] Mundo livre ^(construcao livre^)   ^<-- padrao
echo    [2] Aula 1 - Continue a regra
echo    [3] Aula 2 - Escreva 45 em binario
echo    [4] Aula 3 - Ache os 2 erros
echo    [5] Aula 4 - Decifre a mensagem
echo    [6] Aula 5 - Conserte o desenho
echo    [7] Aula 6 - Siga o manual
echo    [8] Carregar mundo salvo ^(da pasta mundos^)
echo    [9] Criar mundo PROCEDURAL ^(gigante, gera conforme voce explora^)
echo.
set "ESCOLHA="
set /p "ESCOLHA=Digite o numero e tecle Enter (Enter direto = 1): "

if "%ESCOLHA%"=="2" set "LJ_SAVE=cenarios/aula1-sequencia.ljw"
if "%ESCOLHA%"=="3" set "LJ_SAVE=cenarios/aula2-binario.ljw"
if "%ESCOLHA%"=="4" set "LJ_SAVE=cenarios/aula3-depurar.ljw"
if "%ESCOLHA%"=="5" set "LJ_SAVE=cenarios/aula4-decifrar.ljw"
if "%ESCOLHA%"=="6" set "LJ_SAVE=cenarios/aula5-simetria.ljw"
if "%ESCOLHA%"=="7" set "LJ_SAVE=cenarios/aula6-manual.ljw"
if "%ESCOLHA%"=="8" call :carregar_salvo
if "%ESCOLHA%"=="9" call :criar_procedural
if not defined LJ_SAVE set "LJ_SAVE=mundos/mundo-livre/mundo-livre.ljw"

REM --- Codigo do professor (opcional) ---
echo.
set "CODIGO="
set /p "CODIGO=Codigo do professor (Enter = manter o atual / gerar um): "
if defined CODIGO set "LJ_CODIGO=%CODIGO%"

REM --- Tamanho do mundo (so vale se o mundo for NOVO) ---
REM O procedural [9] ja fixou LJ_TAMANHO=E; nesse caso, pula o menu de tamanho.
REM Carregar mundo salvo [8]: o save ja tem as dimensoes -> pula o menu de tamanho.
if defined PULAR_TAMANHO goto :depois_tamanho
if /i "%LJ_TAMANHO%"=="E" goto :depois_tamanho
echo.
echo Tamanho do mundo novo:
echo    [P] pequeno 128x128        ^(padrao^)
echo    [M] medio 192x192
echo    [G] grande 256x256         ^(exige PC melhor^)
echo    [E] procedural - gigante, gera conforme voce explora
set "TAMANHO="
set /p "TAMANHO=Escolha P/M/G/E (Enter = P pequeno): "
set "LJ_TAMANHO=P"
if /i "%TAMANHO%"=="M" set "LJ_TAMANHO=M"
if /i "%TAMANHO%"=="G" set "LJ_TAMANHO=G"
if /i "%TAMANHO%"=="E" set "LJ_TAMANHO=E"
if /i "%TAMANHO%"=="procedural" set "LJ_TAMANHO=E"
:depois_tamanho

REM --- Desempenho da agua (opcional, so se o FPS cair) ---
REM Teto de celulas de agua que FLUEM por tick. Menor = FPS mais estavel numa
REM cascata grande (a agua escorre um pouco mais devagar). Enter = padrao (256).
echo.
set "AGUA="
set /p "AGUA=Agua por tick - so se o FPS cair em cascata grande (Enter = padrao 256): "
if defined AGUA set "LJ_AGUA_TICK=%AGUA%"

REM Cria o mundo caso ainda nao exista (vale para o "mundo livre" na 1a vez).
set "LJ_NOVO=1"

echo.
echo --------------------------------------------
echo  Mundo:  %LJ_SAVE%
echo  Os ALUNOS abrem no navegador o endereco
echo  http://...:8080 que aparece logo abaixo.
echo  Para PARAR: feche esta janela ou Ctrl+C.
echo --------------------------------------------
echo.

call npm run start -w server

echo.
echo O servidor parou.
pause
exit /b 0

REM --- Sub-rotina: listar e escolher um mundo salvo em mundos/ ---
:carregar_salvo
setlocal enabledelayedexpansion
echo.
echo Mundos salvos em mundos/:
set "i=0"
for /d %%d in ("mundos\*") do (
  if exist "%%d\%%~nxd.ljw" (
    set /a i+=1
    set "SAVE[!i!]=mundos/%%~nxd/%%~nxd.ljw"
    echo    [!i!] %%~nxd
  )
)
if !i!==0 goto :cs_livre
echo.
set "N="
set /p "N=Numero do mundo salvo (Enter = 1): "
if not defined N set "N=1"
set "PICK=!SAVE[%N%]!"
if not defined PICK goto :cs_invalido
endlocal & set "LJ_SAVE=%PICK%" & set "PULAR_TAMANHO=1"
goto :eof
:cs_invalido
echo ^(numero invalido - abrindo o mundo livre^)
:cs_livre
endlocal & set "LJ_SAVE=mundos/mundo-livre/mundo-livre.ljw"
goto :eof

REM --- Sub-rotina: criar/abrir um mundo PROCEDURAL (enorme) com nome proprio ---
:criar_procedural
echo.
echo Mundo PROCEDURAL: gigante ^(3840x3840^), so gera onde voce anda.
echo O terreno regenera do zero; so o que voce CONSTRUIR e salvo.
set "PNOME="
set /p "PNOME=Nome do mundo (Enter = 'procedural'): "
if not defined PNOME set "PNOME=procedural"
REM sem espacos no nome (vira o nome da pasta em mundos\)
set "PNOME=%PNOME: =-%"
set "LJ_SAVE=mundos/%PNOME%/%PNOME%.ljw"
set "LJ_TAMANHO=E"
echo ^(mundo procedural: mundos\%PNOME%\^)
goto :eof
