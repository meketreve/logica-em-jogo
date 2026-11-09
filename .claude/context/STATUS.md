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

**09/11 — §🎣 A VARA DE PESCAR** (pedido dele: "pode aplicar tudo", decisões de 09/11): item 944
(3 gravetos + 2 algodão, durabilidade 64), pesca ABSTRATA em qualquer água, espera 5–20 s, a boia
afunda e há **2 s** pra puxar (relógio do SERVIDOR), 85% peixe com a espécie do bioma, o resto lixo
SEM preço (portão de venda). Criativo dá peixe (o cliente guarda). E, antes dela, **o item na mão**:
1ª pessoa, 3ª e nos colegas (`mao_de`), a linha sai da ponta da vara. 4 sons novos. Sonda
`shots:pesca` + smoke `pesca` (controles negativos). **Não testado em aula.**

**03/11 — bug-678: o `/voo` FINALMENTE fica salvo** (relato dele: "ainda continua"). O conserto do
bug-674 (05/10) nunca funcionou: o leitor do `.ljw` (`readSaveMeta`) não lia `vooLiberado`, e o
teste restaurava do objeto em memória. Portão novo de round-trip pelo ARQUIVO em `session.test.ts`.
**Testar:** `/voo ligar`, fechar o host, reabrir — a turma continua voando.

**02/11 — A GRANDE ATUALIZAÇÃO na `main`** (pedido dele: "pode unir as branchs, sai como grande
atualização"): as branches dos §🐄 bichos (`kqj92e`) e do §🔊 som (`nba77z`) fundidas num bloco só
do changelog. Bichos: 8 espécies com variantes por bioma, A*, máquina de estados, tesoura/balde/
ovo/domar/cria, lã em 12 blocos, leite e bolo, `/bicho`, `/bichos ligar|desligar|limpar|parar|
soltar|fila`, aba **comida** no criativo, `?bench&bichosparados`, custo POR SISTEMA no F3. **Mundo
que já existia NÃO ganha bicho sozinho** (só mundo novo procedural; decisão dele na fusão). Prints
em `docs/img/` (README) e seções novas no `docs/manual.html`. Launcher: só o texto da `[9]`.
Spec: `todo.md` §🐄 e §🔊. **Não testado em aula.**

**03/11 — §🖥️ O LAUNCHER VIROU PAINEL NO NAVEGADOR** (pedido dele: "mais gráfico e menos texto"):
o `.bat`/`.sh` confere o Node, atualiza SOZINHO (perguntas caem no Enter; no `.sh` o stash é
recusado) e sobe `server/src/painel.ts` (localhost:8070), que abre o navegador e sobe o jogo como
FILHO (`fork` + IPC: jogadores 1×/s, "pare e grave"). Cartões das 8 aulas com foto
(`npm run miniaturas`), IP + QR, conectados, código escondido, recado, projetor, trocar/parar,
criar/publicar, faixa de versão, botão **🎮 Entrar no jogo** (abre `http://localhost:8080/` numa
aba nova — o professor joga no mesmo PC), "Dúvidas? Clique aqui!" → `docs/manual.html#painel`. Menu de
texto = reserva (`--texto`, ou cai sozinho se o painel morrer). Smoke `painel` + sonda
`shots:painel` (controle negativo nos dois). **`.bat` não testado no Windows do lab.**

**03/11 — §🔊 SONS V2** (pedido dele: "a versão 2 dos sons", plano híbrido escolhido por ele):
amostras GRAVADAS CC0 em blocos, passos, porta, baú, Dimas, grilo e vaca/ovelha/galinha/cão/gato;
a síntese da v1 fica no resto e como RESERVA (arquivo que não chega → toca sintetizado). 58 OGG,
352 KB, ~4 MB de PCM. Tabela `shared/src/sonsAmostras.ts`, arquivos e créditos do
`scripts/preparar-sons.mjs` → `client/public/sons/CREDITOS.md`. Sonda `shots:som` 7–8 (controle
negativo com 404). **Ganhos na conta, não no ouvido. Não testado em aula.**

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

- **02/11 — §🐄 bichos (na main desde a fusão)** — ver acima. 300 bichos + 25 alunos = 2,7 ms/tick no Node.
  Smoke `bichos` com controle negativo (lã forçada branca → falha).
- **02/11 — §🔊 o mundo tem som** (pedido dele, item 12; na main desde a fusão): bloco por material, ferramenta rachando, passos, água, portas, alavanca, baú,
  comer, moeda, dano, ambiente (vento/pássaro/grilo/riacho) e o gancho `somDeBicho` pros mobs.
  Volumes novos (mundo, ambiente) e `som` no perfil do F3. Sonda `shots:som` (com controle
  negativo). **Não testado em aula.**

- **27/10 — `/perfil` (pedido dele):** o professor manda a turma gravar o perfil do F3 sem
  ninguém apertar botão (`/perfil [nome|todos] [segundos]`, 5–60 s, padrão 10). Mora no HOST
  (`interceptarPedirPerfil`, `server/src/index.ts`); o cliente grava com o F3 FECHADO e devolve
  pelo `profile_report` com `pedido.lote` → `profiles/perf-turma-<lote>-*.json`. Smoke
  `perfil-turma` + sonda `shots:perfil` (com controle negativo nos dois). **Não testado em aula.**

- **27/10 — §🔌 PEÇAS TRAVADAS**, regra nova do cenário (`/objetivo pecas travadas|livres`,
  `scenario.pecasTravadas`, salva no mundo): nas áreas dos objetivos o aluno só aciona ALAVANCA —
  colocar, quebrar, balde, quadro e clicar o resto são recusados com aviso (`pecaTravada`, em
  `session/equipes.ts`). Professor passa. A aula 8 nasce com ela.

- **27/10 — §🔌 AULA 8, os circuitos** (`aula8-circuitos.ljw`, `server/src/cenarios/circuitos.ts`):
  4 fases (fio, E, OU, E+OU), circuito pronto e alavancas desligadas; lâmpada com marca VERDE
  acende, VERMELHA fica apagada. Objetivo `construir` contra gabarito montado pelo MOTOR; o
  gerador exige resposta ÚNICA por força bruta. Padrão novo (molde → cópia por grupo; o
  verificador roda `/aula grupos` e confere a cópia). **Não testada em aula.**

- **27/10 — §📊 o jogo mais leve no notebook:** antialias DESLIGADO por padrão (chave em
  Configurações): 31 → ~51 fps no notebook dos alunos. O recorte das folhas em material
  próprio foi tentado e DESFEITO — a 3ª bateria mediu o jeito antigo 11,6% mais rápido.

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
data: 2026-11-03

```
c0da7cf feat(som): §🔊 sons v2 — amostras GRAVADAS (CC0), síntese da v1 como reserva
6150e34 feat(painel): §🖥️ botão "Entrar no jogo" pro professor
f998658 feat(launcher): §🖥️ o painel do professor no navegador
1a81a0f docs(todo): §🖥️ o launcher gráfico no navegador — escopo fechado com ele
1d3c037 docs: a aula 8 (circuitos) no README e no manual — eram 8, diziam 7
0ce9330 merge: a grande atualização — bichos e sons na main
2b43b30 feat(bichos): §🐄 mundo que já existe não cria bicho sozinho
5f6a532 feat(bichos): §🐄 vitrine parada pro bench e aba comida no inventário
--- status ---
```
<!-- auto:end -->
