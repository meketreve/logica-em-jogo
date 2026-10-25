---
updated: 2026-10-25
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->
## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc, árvore limpa. Só LINUX.

**DOZE lotes empurrados sem aula nenhuma** — os seis do §🔌 (16–19/10), três de 20/10
(`/vender`, barra de navegação, ciclo da aula), dois de 23/10 (chat do PC, circuito em parede e
teto) e a alavanca nova (25/10). Maior acúmulo de não-testado daqui.

⚠️ **Ele disse em 20/10 que testaria em 21/10 e traria os logs. Hoje é 25/10 e nenhum retorno
chegou até aqui** — cinco dias. Pode ter acontecido sem relato, ou a aula ter mudado de data —
**perguntar antes de supor**. Nada abaixo foi confirmado em sala.

⚠️ **bug-675: a causa APARECEU, mas não foi confirmada.** Pela pista dele ("não acontece nas
turmas dos mais velhos"), é a palma da mão na BARRA DE NAVEGAÇÃO do Android — não rede, não o
botão de sair. Atacado em 20/10; **quem confirma é o `-eventos.log`**. E o **`.bat` do launcher
não foi executado** (não roda no Linux): passa no portão de paridade, mas quem confirma é a
máquina do laboratório. **Aprovado em aula:** comandos no chat com PAPEL + painel do dedo.

## Próxima fase

**Ler os logs quando ele trouxer** — `mundos/<turma>/logs/<data>-eventos.log`, contando
`fechou a página` × `ficou sem responder`. Fecha (ou reabre) o bug-675.

Depois, o resto da **fase 1 do §🔌** (`todo.md`): **botão** (pulso — precisa de prazo por
célula, que o motor não tem) e **porta automática** (1ª saída que não é luz; mexe no gate de
claim). → **verify:** `shots:circuito` com seção nova vendo a peça, como a C3 e a C4.
Atrás: a **porta NÃO**, que ⚠️ **quebra o ponto fixo** do motor (um NÃO ligado em si mesmo
oscila pra sempre) — cabeçalho de `circuitos.ts`. E **luz colorida** + **curva de brilho**.

## Pendências e bloqueios

- **Dele:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala. **Externas:**
  distribuição pelo Drive; certificado de assinatura só se sair da piloto.

## Concluído (recente)

- **25/10 — a ALAVANCA estilo Minecraft.** Pedregulho + cabo que TOMBA (10° ligada, 75°
  desligada): a inclinação recusada em 19/10 voltou **com a altura preservada** (12/16 × 6,3/16),
  que é o que sobrevive ao projetor. Nasceu o `emitCaixaInclinada` (o `emitBox` só sabe caixa
  alinhada aos eixos).
- **23/10 — §🔌 o circuito SAIU DO CHÃO.** Fio e alavanca em parede e teto: a FACE virou id
  (280-299), tabela `RASTEIRAS` + faixa gêmea no `blocks.ts`, e **um giro só** (`giroDaFace`) pra
  forma E mira. O motor **não olha a face**. Dele: placa só no piso, portas horizontais,
  **agachar inverte a frente**. Seção C4. **E o chat do PC:** Enter/Esc sem foco (bug em
  `BUGS.md`) · lista de comandos no PC · **porta lógica E/OU**.
- **20/10 — launcher: o ciclo da AULA.** `[10]` plano · `[11]` publicar (prefixo `aula`) · `[8]` varre as duas pastas.
- **20/10 — §📱 bug-675:** tela cheia que se **segura** · "voltar" vira menu de pausa · host
  escreve o MOTIVO da saída. **§💰 `/vender`:** o balcão do JOGADOR (fora do save), 1ª FONTE de
  Dimas, com o PORTÃO de preço (saída ≤ entrada) que pegou 3 canos.

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-23

```
983aa0b feat(launcher): [11] publicar como AULA, e a [8] enxergando a pasta cenarios/
a52fb53 feat(launcher): [10] criar mundo PLANO — a base pra montar aula
d327530 fix(mobile): §📱 bug-675 — a barra de navegação do tablet, e o log que dizia nada
75c2ea5 feat(venda): §💰 /vender — o balcão, e a primeira FONTE de Dimas do jogo
a99255c docs(contexto): handoff — o §🔌 inteiro em seis lotes, e a aula que falta
295999c feat(circuito): §🔌 a placa de pressão — a primeira entrada que não é a mão
a934dbc docs(workflow): quando abrir bloco NOVO no changelog, e quando só acrescentar
b9bb0c0 feat(luz): §💡 luz SUAVIZADA por vértice, e a lâmpada ilumina igual à tocha
--- status ---
 M .claude/context/LEARNINGS.md
 M .claude/context/MAP.md
 M .claude/context/STATUS.md
 M .claude/context/TODO.md
```
<!-- auto:end -->
