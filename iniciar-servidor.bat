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
REM  Atualizacao (SEM git) - so a maquina do PROFESSOR atualiza:
REM  o aluno abre o navegador e recebe o cliente deste servidor.
REM  client\dist e VERSIONADO, entao vem pronto no ZIP e nao se compila nada.
REM
REM  COMO: baixa o ZIP do branch no GitHub com "curl.exe", abre com "tar.exe" e
REM  copia por cima com "robocopy". Os tres ja vem no Windows 10 (1803+) e no
REM  11 - nao precisa instalar git, nem winget, nem nada. NAO usa PowerShell,
REM  que e justamente o que a escola bloqueia.
REM
REM  A versao instalada fica gravada em ".lj-versao" (o commit do GitHub). Na
REM  primeira vez esse arquivo nao existe: o launcher avisa e baixa uma vez.
REM
REM  Pula sozinho, SEM travar a aula, quando: LJ_SEM_UPDATE=1, a pasta e um
REM  clone do git (nesse caso quem atualiza e o "git pull" - copiar por cima
REM  pisaria no trabalho de quem desenvolve), falta curl/tar, ou a rede nao
REM  responde.
REM ============================================================
set "LJ_DONO=meketreve"
set "LJ_NOME=logica-em-jogo"
set "LJ_RAMO=main"
set "LJ_TMP=%TEMP%\lj-update"
set "LJ_ZIP=%TEMP%\lj-update.zip"
set "LJ_SRC=%LJ_TMP%\%LJ_NOME%-%LJ_RAMO%"

if defined LJ_SEM_UPDATE (
  echo ^(LJ_SEM_UPDATE=1: nao vou procurar atualizacao^)
  goto :depois_update
)
if exist ".git" (
  echo ^(esta pasta e um clone do git: atualize com "git pull" - update automatico desligado^)
  goto :depois_update
)
where curl >nul 2>nul
if errorlevel 1 (
  echo ^(curl.exe nao encontrado - precisa do Windows 10 1803 ou mais novo^)
  goto :depois_update
)
where tar >nul 2>nul
if errorlevel 1 (
  echo ^(tar.exe nao encontrado - precisa do Windows 10 1803 ou mais novo^)
  goto :depois_update
)

echo Procurando atualizacao...
REM O cabecalho "Accept: ...github.sha" faz a API responder o commit em texto
REM puro, so os 40 caracteres - batch nao tem como ler JSON.
del "%TEMP%\lj-versao-remota.txt" >nul 2>nul
curl -sL --max-time 15 -H "Accept: application/vnd.github.sha" -o "%TEMP%\lj-versao-remota.txt" "https://api.github.com/repos/%LJ_DONO%/%LJ_NOME%/commits/%LJ_RAMO%"
if errorlevel 1 (
  echo ^(sem conexao com o GitHub - seguindo com a versao instalada^)
  del "%TEMP%\lj-versao-remota.txt" >nul 2>nul
  goto :depois_update
)
set "LJ_NOVA="
for /f "usebackq delims=" %%v in ("%TEMP%\lj-versao-remota.txt") do set "LJ_NOVA=%%v"
del "%TEMP%\lj-versao-remota.txt" >nul 2>nul
REM Resposta boa = exatamente 40 caracteres. Erro da API volta como JSON, que
REM nunca tem esse tamanho - e essa a conferencia.
if not defined LJ_NOVA goto :update_resposta_ruim
if "%LJ_NOVA:~39,1%"=="" goto :update_resposta_ruim
if not "%LJ_NOVA:~40,1%"=="" goto :update_resposta_ruim
goto :update_versao_ok
:update_resposta_ruim
echo ^(o GitHub nao respondeu direito - seguindo com a versao instalada^)
goto :depois_update
:update_versao_ok

set "LJ_ATUAL="
if exist ".lj-versao" for /f "usebackq delims=" %%v in (".lj-versao") do set "LJ_ATUAL=%%v"
if "%LJ_ATUAL%"=="%LJ_NOVA%" (
  echo Ja esta na versao mais nova.
  goto :depois_update
)
REM A versao que a PESSOA le ("0.9.0") vem do campo "version" do package.json da
REM raiz - a mesma que o jogo mostra. O sha continua sendo a identidade do
REM update; o numero e o que o professor consegue ler na tela e repetir no
REM telefone. O numero do lado de LA so se sabe depois de baixar.
call :ler_versao "package.json" LJ_VER_ATUAL
echo.
if not defined LJ_ATUAL (
  echo Nao da para saber que versao esta instalada aqui ^(falta o arquivo .lj-versao^).
  echo A mais nova no GitHub e a %LJ_NOVA:~0,7% - baixar agora resolve isso de vez.
) else if defined LJ_VER_ATUAL (
  echo Existe versao nova: voce esta na %LJ_VER_ATUAL% ^(commit %LJ_ATUAL:~0,7%^) e o GitHub esta na %LJ_NOVA:~0,7%
) else (
  echo Existe versao nova: %LJ_ATUAL:~0,7% -^> %LJ_NOVA:~0,7%
)
echo.
set "UPD="
set /p "UPD=Atualizar agora? [S/n] (Enter = sim): "
if /i "%UPD%"=="n" (
  echo ^(mantendo a versao atual^)
  goto :depois_update
)

echo Baixando ^(uns 4 MB^)...
del "%LJ_ZIP%" >nul 2>nul
rd /s /q "%LJ_TMP%" >nul 2>nul
curl -L --max-time 300 --fail -o "%LJ_ZIP%" "https://github.com/%LJ_DONO%/%LJ_NOME%/archive/refs/heads/%LJ_RAMO%.zip"
if errorlevel 1 (
  echo ^(o download falhou - seguindo com a versao instalada^)
  goto :limpar_update
)
mkdir "%LJ_TMP%" >nul 2>nul
tar -xf "%LJ_ZIP%" -C "%LJ_TMP%"
if errorlevel 1 (
  echo ^(nao deu para abrir o ZIP - seguindo com a versao instalada^)
  goto :limpar_update
)
if not exist "%LJ_SRC%\package.json" (
  echo ^(o ZIP veio num formato inesperado - seguindo com a versao instalada^)
  goto :limpar_update
)

REM --- A pasta dos mundos salvos e intocavel, e isso e CONFERIDO ---
REM "mundos\" esta no .gitignore e nenhum arquivo dela e rastreado, entao ela
REM nao viaja no ZIP - os mundos que viajam sao os MODELOS de aula, em
REM "cenarios\". A conferencia existe porque o dia em que alguem versionar um
REM .ljw de turma por engano, o professor tem de ser avisado ANTES de a turma
REM perder o que construiu. Padrao = NAO sobrescrever.
set "LJ_XD="
if not exist "%LJ_SRC%\mundos" goto :mundos_intactos
echo.
echo ATENCAO: esta atualizacao TRAZ arquivos para a pasta dos mundos salvos ^(mundos\^):
dir /b "%LJ_SRC%\mundos"
echo   Os mundos que a sua turma construiu podem ser SOBRESCRITOS.
set "SOBR="
set /p "SOBR=  Sobrescrever os mundos salvos? [s/N] (Enter = nao): "
if /i "%SOBR%"=="s" goto :mundos_decidido
if /i "%SOBR%"=="sim" goto :mundos_decidido
set "LJ_XD=/XD mundos"
echo   ^(ok - os mundos salvos ficam como estao^)
goto :mundos_decidido
:mundos_intactos
echo ^(seus mundos salvos em mundos\ nao sao tocados pela atualizacao^)
:mundos_decidido

echo Aplicando a atualizacao...
REM robocopy SEM /PURGE: so escreve por cima e acrescenta, nunca apaga o que e
REM so seu (mundos\, node_modules\, .env, .ljw exportado solto na pasta).
REM /XF do proprio .bat: o cmd.exe le este arquivo enquanto executa, entao
REM troca-lo no meio da execucao corrompe a rodada. A troca dele vem depois,
REM em :trocar_launcher, com o launcher ja fora do ar.
REM O numero do pacote TEM de ser lido antes da copia: depois dela o
REM package.json daqui ja e o novo, e a frase viraria "da 1.0.0 para a 1.0.0".
call :ler_versao "%LJ_SRC%\package.json" LJ_VER_NOVA
robocopy "%LJ_SRC%" "%CD%" /E /NFL /NDL /NJH /NJS /NP /R:1 /W:1 /XF "iniciar-servidor.bat" %LJ_XD% >nul
if errorlevel 8 (
  echo ^(a copia falhou - seguindo com a versao instalada^)
  goto :limpar_update
)
> ".lj-versao" echo %LJ_NOVA%
REM Duas frases porque os dois casos sao diferentes na cabeca do professor:
REM subir de 0.9.0 pra 1.0.0 e versao nova; receber correcao dentro da MESMA
REM 0.9.0 e o caso comum, e "atualizado para a 0.9.0" faria parecer que nada
REM aconteceu.
if not defined LJ_VER_NOVA (
  echo Atualizado para a %LJ_NOVA:~0,7%.
) else if "%LJ_VER_ATUAL%"=="%LJ_VER_NOVA%" (
  echo Atualizado - continua na versao %LJ_VER_NOVA%, com as correcoes mais novas ^(commit %LJ_NOVA:~0,7%^).
) else if not defined LJ_VER_ATUAL (
  echo Atualizado para a versao %LJ_VER_NOVA% ^(commit %LJ_NOVA:~0,7%^).
) else (
  echo Atualizado da versao %LJ_VER_ATUAL% para a %LJ_VER_NOVA% ^(commit %LJ_NOVA:~0,7%^).
)
echo Conferindo as dependencias...
call npm install
if errorlevel 1 echo ^(aviso: npm install falhou - se o servidor nao subir, rode "npm install" a mao^)

REM --- O proprio launcher mudou nesta atualizacao? ---
REM fc devolve 0 quando os dois arquivos sao iguais.
fc /b "%LJ_SRC%\iniciar-servidor.bat" "%~f0" >nul 2>nul
if not errorlevel 1 goto :limpar_update
:trocar_launcher
REM Um .cmd de fora faz a troca: este aqui precisa SAIR antes de ser
REM sobrescrito, senao o cmd.exe continua lendo o arquivo velho por offset e
REM executa lixo. Ele espera, copia, limpa o temporario e reabre o launcher.
echo.
echo O proprio launcher mudou. Trocando e reabrindo a janela...
> "%TEMP%\lj-troca.cmd" echo @echo off
>>"%TEMP%\lj-troca.cmd" echo ping -n 3 127.0.0.1 ^>nul
>>"%TEMP%\lj-troca.cmd" echo copy /y "%LJ_SRC%\iniciar-servidor.bat" "%~f0" ^>nul
>>"%TEMP%\lj-troca.cmd" echo rd /s /q "%LJ_TMP%" ^>nul 2^>nul
>>"%TEMP%\lj-troca.cmd" echo del "%LJ_ZIP%" ^>nul 2^>nul
>>"%TEMP%\lj-troca.cmd" echo start "" "%~f0"
start "" "%TEMP%\lj-troca.cmd"
exit

:limpar_update
del "%LJ_ZIP%" >nul 2>nul
rd /s /q "%LJ_TMP%" >nul 2>nul
:depois_update
set "LJ_DONO=" & set "LJ_NOME=" & set "LJ_RAMO=" & set "LJ_TMP=" & set "LJ_ZIP="
set "LJ_SRC=" & set "LJ_NOVA=" & set "LJ_ATUAL=" & set "LJ_XD="
set "LJ_VER_ATUAL=" & set "LJ_VER_NOVA="
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

REM --- Sub-rotina: ler o campo "version" de um package.json ---
REM %1 = caminho do package.json, %2 = nome da variavel que recebe o numero.
REM Batch nao le JSON, e nao precisa: o package.json da RAIZ e curto e o campo
REM "version" vem no topo, entao o primeiro casamento e o certo. Arquivo que nao
REM existe (ou sem o campo) deixa a variavel VAZIA, e quem chama cai na frase
REM antiga com o commit - a mensagem piora, nada quebra.
REM O padrao NAO tem aspas dentro: aspa escapada dentro de um for /f com crase e
REM a receita de erro silencioso em batch. Cada "." do regex e a aspa do JSON -
REM ^ *.version.: *.[0-9] casa exatamente '  "version": "0.9.0",'.
:ler_versao
set "%~2="
if not exist "%~1" goto :eof
set "LJ_V="
for /f "usebackq tokens=2 delims=:," %%a in (`findstr /r /c:"^ *.version.: *.[0-9]" "%~1"`) do (
  if not defined LJ_V set "LJ_V=%%a"
)
if not defined LJ_V goto :eof
REM sem aspas no set: o valor e so digito e ponto, e "%VAR:"=%" dentro de um set
REM entre aspas confunde a contagem de aspas do cmd.
set LJ_V=%LJ_V:"=%
set LJ_V=%LJ_V: =%
set "%~2=%LJ_V%"
set "LJ_V="
goto :eof
