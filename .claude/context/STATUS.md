---
updated: 2026-10-23
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->
## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc, árvore limpa. Só LINUX.

**NOVE lotes empurrados sem aula nenhuma** — os seis do §🔌 (16–19/10) e três de 20/10
(`/vender`, barra de navegação, ciclo da aula no launcher). Maior acúmulo de não-testado daqui.

⚠️ **Ele disse em 20/10 que testaria em 21/10 e traria os logs. Hoje é 23/10 e nenhum retorno
chegou até aqui.** Pode ter acontecido sem relato, ou a aula ter mudado de data — **perguntar
antes de supor**. Nada abaixo foi confirmado em sala.

⚠️ **bug-675: a causa APARECEU, mas não foi confirmada.** Pela pista dele ("não acontece nas
turmas dos mais velhos"), é a palma da mão na BARRA DE NAVEGAÇÃO do Android — não rede, não o
botão de sair. Atacado em 20/10; **quem confirma é o `-eventos.log`**. E o **`.bat` do launcher
não foi executado** (não roda no Linux): passa no portão de paridade, mas quem confirma é a
máquina do laboratório. **Aprovado em aula:** comandos no chat com PAPEL + painel do dedo.

## Próxima fase

**Ler os logs quando ele trouxer** — `mundos/<turma>/logs/<data>-eventos.log`, contando
`fechou a página` × `ficou sem responder`. Fecha (ou reabre) o bug-675.

Depois, a **fase 1 do §🔌** (`todo.md`): **botão** (pulso — precisa de prazo por célula, que o
motor não tem) e **porta automática** (1ª saída que não é luz; mexe no gate de claim).
→ **verify:** `shots:circuito` com seção nova vendo a peça, como a C3 da placa.
Atrás: a **porta NÃO**, que ⚠️ **quebra o ponto fixo** do motor (o passo só LIGA; um NÃO ligado
em si mesmo oscila pra sempre) — cabeçalho de `circuitos.ts`. E **luz colorida** + **curva de
brilho**, que esperam decisão dele.

## Pendências e bloqueios

- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **20/10 — launcher: o ciclo da AULA.** `[10]` mundo PLANO (nome + P/M/G: o E é lazy e
  **ignora o preset**) · `[11]` publicar como AULA (copia pra `cenarios/` FORÇANDO o prefixo
  `aula`, que é o que torna reutilizável) · `[8]` varre as DUAS pastas — `aula7-corrida.ljw`
  vinha no pacote **invisível no menu inteiro**.
- **20/10 — §📱 barra de navegação do tablet (bug-675).** Tela cheia que se **segura** (cai →
  arma → volta no próximo toque; `requestFullscreen` exige gesto) · **"voltar" vira menu de
  pausa** (re-armado a cada `popstate`) · host escreve `<nome> saiu: <motivo>`.
- **20/10 — §💰 `/vender`, o balcão.** 4º tipo do `ContainerPanel` e o 1º que **não é bloco**: é
  do JOGADOR (sem posição, fora do save, devolve ao fechar). O Dimas é **criado** ali — 1ª fonte
  da economia. ⚠️ Quem sustenta a tabela de preço é o **PORTÃO** (saída ≤ entrada em toda receita
  e cozimento): pegou 3 canos, um (`1 tronco → 4 FOLHAS`) que eu não tinha visto.
- **19/10 — o §🔌 em seis lotes:** objetivo `acender` · porta **OU** (TABELA `PORTAS`+`LIGA`) ·
  modelos dele · luz suave (Uint16) · placa. **16/10:** o 1º circuito, ids ≥ 256.

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
