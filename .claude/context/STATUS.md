# Status — tier 3

## Estado atual

Jogo voxel educacional rodando, testado com turma real. Só LINUX. O SSD foi formatado em 25/10 e o
repo voltou por clone (`npm ci` refeito; Chrome das sondas = `CHROME=/usr/bin/google-chrome`, o
cache do puppeteer se foi).

**Chegaram os logs (26/10, zip dos `mundos/`):** aulas de 23/10 e 26/10 rodaram com os lotes até
o chat do PC. Leitura do bug-675 em `BUGS.md` (entrada de 26/10): **zero "sem responder", 39 quedas
1006** — no Android, Home/tela bloqueada matam o socket na hora (o recreio provou), então o log do
host não separava tela escondida de rede. A criança caía no menu e redigitava nome e PIN.

**26/10 — dois lotes empurrados:** (1) a alavanca de circuito comprido parou de travar o cliente
(remontagem 1× por chunk por quadro — `BUGS.md`). (2) a página conta COMO caiu (tela escondida × à vista) no join da volta,
e o jogo **reconecta sozinho** (5 tentativas, espera a tela voltar; esgotou → menu como antes).
Provado em `shots:queda` (host morto e ressuscitado, aba escondida de verdade, heartbeat mudo) e no
smoke `logs`. **Não testado em aula.**

## Próxima fase

**A próxima aula fecha o bug-675:** no `-eventos.log`, contar `voltou sozinho` × `voltou pelo
menu`, e `tela ESCONDIDA` × `à vista`. Muito "ESCONDIDA" nas turmas pequenas = a palma na barra
confirmada. E perguntar se a criança notou o "a conexão caiu — voltando ao jogo".

Depois, o resto da **fase 1 do §🔌** (`todo.md`): **botão de parede** (pulso — prazo por célula,
que o motor não tem). A porta automática saiu em 27/10.
Atrás: a **porta NÃO** (⚠️ quebra o ponto fixo — cabeçalho de `circuitos.ts`), **luz colorida** e
**curva de brilho** (decisões dele).

## Pendências e bloqueios

- **Dele:** quanto de Dimas cada aluno recebe; o aviso de Dimas nova cala? **Externas:** Drive; certificado de assinatura só se sair da piloto.

## Concluído (recente)

- **27/10 — §📊 o jogo mais leve no notebook:** antialias DESLIGADO por padrão (chave em
  Configurações) e o recorte das folhas em material próprio — o terreno parou de descartar
  pixel. Prova: `recorte.test.ts` + `__recorte` no `bench:headless`. **Falta a 2ª bateria no
  notebook** pra confirmar o ganho (e o custo das ~170 draw calls a mais).

- **27/10 — §📊 bateria de GPU pro lab** (`npm run bench:lab`): três suspeitas lidas no código —
  `alphaTest` no material de TODO o terreno, MSAA fixo, água reenviando o atlas — viraram chaves
  do `?bench`. Número só vale da máquina do lab (aqui é SwiftShader).

- **27/10 — §🔌 o circuito ABRE A PORTA** (pedido dele, escopo fechado em 26/10): a porta é
  saída como a lâmpada (`propagarSinal` devolve as portas alcançadas) e SEGUE o sinal só nas
  bordas — o clique vale até o sinal mudar; vão ocupado cancela o fechamento. Sonda C6 (um
  robô põe a porta pelo `place_block`, a porta não sai por `/bloco`).

- **26/10 — §🔌 a alavanca não trava mais:** cada `block_changed` remontava o chunk na hora
  (30 fios = 338 ms por clique). Agora cada chunk sai 1× por quadro (`descarregarSujos`). Sonda C5.
  E o motor do servidor deixou de ser ponto fixo quadrático: o sinal anda por FILA das fontes.

- **26/10 — §📱 bug-675: o jogo volta sozinho** depois da queda, e o log diz se a tela estava
  escondida. A tela de carga ganhou portão próprio (marcava "100% pronto!" com o mundo velho).
- **25/10 — a ALAVANCA estilo Minecraft.** Pedregulho + cabo que TOMBA (10° ligada, 75°
  desligada), com a altura preservada (12/16 × 6,3/16). Nasceu o `emitCaixaInclinada`.
- **23/10 — §🔌 o circuito SAIU DO CHÃO** (fio e alavanca em parede e teto; `giroDaFace`) e o
  **chat do PC** (Enter/Esc sem foco, lista de comandos, porta lógica E/OU).
- **20/10 — launcher: o ciclo da AULA** (`[10]` plano · `[11]` publicar · `[8]` as duas pastas) ·
  **§💰 `/vender`** (o balcão, 1ª FONTE de Dimas, portão de preço).

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-25

```
d837350 feat(circuito): §🔌 a alavanca estilo Minecraft — pedregulho e um cabo que TOMBA
e16a849 docs(todo): §🔌 o botão de PAREDE — a ideia dele, e o que ela testa
30992f3 feat(circuito): §🔌 o circuito SAI DO CHÃO — fio e alavanca em parede e teto
68cba8e fix(chat): o chat do PC — Enter/Esc sem foco, a lista de comandos e a porta LÓGICA
25fe60e docs(contexto): handoff — nove lotes esperando aula, e o MAP que mentia
983aa0b feat(launcher): [11] publicar como AULA, e a [8] enxergando a pasta cenarios/
a52fb53 feat(launcher): [10] criar mundo PLANO — a base pra montar aula
d327530 fix(mobile): §📱 bug-675 — a barra de navegação do tablet, e o log que dizia nada
--- status ---
 M .claude/context/LEARNINGS.md
 M .claude/context/MAP.md
 M .claude/context/TODO.md
```
<!-- auto:end -->
