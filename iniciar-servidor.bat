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
endlocal & set "LJ_SAVE=%PICK%"
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
