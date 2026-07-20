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

REM --- Pasta dos mundos salvos + migracao do save antigo ---
if not exist "mundos" mkdir "mundos"
if not exist "mundos\mundo-livre.ljw" if exist "world.ljw" (
  move /y "world.ljw" "mundos\mundo-livre.ljw" >nul
  echo ^(mundo livre antigo movido para mundos\mundo-livre.ljw^)
  echo.
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
if not defined LJ_SAVE set "LJ_SAVE=mundos/mundo-livre.ljw"

REM --- Codigo do professor (opcional) ---
echo.
set "CODIGO="
set /p "CODIGO=Codigo do professor (Enter = manter o atual / gerar um): "
if defined CODIGO set "LJ_CODIGO=%CODIGO%"

REM --- Tamanho do mundo (so vale se o mundo for NOVO) ---
echo.
set "TAMANHO="
set /p "TAMANHO=Tamanho do mundo novo P/M/G (Enter = P pequeno): "
set "LJ_TAMANHO=P"
if /i "%TAMANHO%"=="M" set "LJ_TAMANHO=M"
if /i "%TAMANHO%"=="G" set "LJ_TAMANHO=G"

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
for %%f in ("mundos\*.ljw") do (
  set /a i+=1
  set "SAVE[!i!]=mundos/%%~nxf"
  echo    [!i!] %%~nf
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
endlocal & set "LJ_SAVE=mundos/mundo-livre.ljw"
goto :eof
