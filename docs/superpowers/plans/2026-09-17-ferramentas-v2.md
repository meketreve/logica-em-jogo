# §🔨 Ferramentas v2 — durabilidade, ferramenta na mão e tempo de quebra

> Plano da sessão 100 (2026-09-17). As 3 peças do `todo.md` § Ferramentas v2 andam JUNTAS: hoje a
> quebra é 1 clique instantâneo, e foi essa instantaneidade que barrou machado e pá no F10d.

## As 4 decisões (do usuário, 2026-09-17)

1. **Durabilidade = campo na pilha**, `{ id, qtd, dano? }`, com **barra de vida por ferramenta**.
   Ferramenta nova não carrega o campo → save antigo e protocolo não mudam de forma.
   O medo do `todo.md` (empilhar junta pilhas por id) **não se realiza**: `tamanhoStack` já dá
   1 por slot pra ferramenta desde o F10d, então `adicionar` nunca junta duas.
2. **A ferramenta tem de estar na MÃO** (slot selecionado). Reabre a decisão do F10d de propósito.
3. **Progresso = RACHADURA no bloco** (não anel na mira). Precisa segurar o botão.
4. **Ao zerar, a ferramenta SOME**, com aviso no chat e som.

Machado e pá ficam pra quest seguinte.

## Etapas

### Etapa 1 — shared PURO (sem rede, sem render)
- `inventario.ts`: `Stack.dano?`, `SlotSalvo.dano?`, parse defensivo (inteiro, ≥ 0, < durabilidade
  do id, e só em ferramenta). É o mesmo funil pro save E pro fio — `SlotSalvo` serve aos dois.
- `ferramentas.ts`: `DURABILIDADE` por ferramenta (régua do Minecraft: madeira 59, pedra 131,
  ferro 250, diamante 1561), `gastar(stack) → Stack | null` (null = quebrou) e `vidaDe(stack)`.
- `ferramentas.ts`: **dureza por bloco** e `ticksDeQuebra(blockId, ferramentaNaMao)` — a tabela já
  é (tipo × família), então o número entra sem redesenho. Mão nua nunca é 0 ticks.
- Testes puros de cada uma.

### Etapa 2 — sessão + protocolo (autoritativo)
- `break_block` ganha `slot?` (o `balde` já faz isso — mesmo precedente).
- O gate passa a olhar a MÃO: `faltaFerramenta` recebe a pilha do slot, não o inventário.
- **Tempo de quebra autoritativo:** `break_start { x, y, z, slot }` marca o começo no servidor;
  o `break_block` só é aceito se passaram os ticks exigidos na MESMA célula com a MESMA mão.
  Trocar de célula ou de slot reinicia. Sem isso o tempo seria só enfeite de cliente.
- Gasto de 1 de dano por quebra que exigia a ferramenta; ao zerar, some da mão + aviso + evento.

### Etapa 3 — cliente
- Segurar o botão (mouse e toque) em vez de 1 clique; progresso local previsto pelo mesmo módulo puro.
- **Rachadura**: overlay procedural (assets próprios, como o atlas) no bloco mirado, em estágios.
- **Barra de vida** no slot da hotbar e da mochila.
- Som da ferramenta quebrando (WebAudio sintetizado, como o resto).

## Portão
`npm run verify` em cada etapa; sonda real no cliente antes de fechar (o cerebrum manda: UI não
é "feita" sem sonda que a ENXERGUE).
