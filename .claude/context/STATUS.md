---
updated: 2026-10-15
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc com o `origin`
(`d3af433`), árvore limpa. Ambiente é só LINUX.

O lote de 15/10 mexeu na UI do aluno: o **painel de amigos virou ABA do painel** (um root, uma
tecla, um ✕), a **árvore de comandos filtra por PAPEL** (o aluno vê 10 em vez de 26, todos à
vista com o teclado aberto) e no painel do dedo **LISTA ganha de digitação** — `/tpp` mostra a
turma, `/tpa` mostra só QUEM PEDIU (mensagem nova `tp_pedidos`). Marco: "Um painel só, e o chat
sem bagunça".
**O resto da lista de teste de 10/10 segue sem ter sido visto em tela** (machado/pá, logs, loja,
ids de 16 bits) — `TODO.md`.

⚠️ **bug-675 (heartbeat) NÃO está fechado:** na aula de 10/10 as quedas **diminuíram mas não
zeraram**. Os consertos de 13/10 atacam causas reais (host travado + nome preso); o que restar
aponta pro **15 s** derrubando tablet que engasgou de verdade (Wi-Fi de pé, página parada). A
próxima aula decide: quantos caíram, se viram o motivo na tela, se é sempre o mesmo tablet.

## Próxima fase

**O 1º bloco de circuito lógico** — a razão de os ids de 16 bits terem sido feitos; **BLOQUEADO
numa pergunta ao usuário**: QUAL bloco e como funciona na aula (entrevista de escopo antes de
codar). Não começar sem a resposta.

Com a resposta: `shared/src/blocks.ts` (id novo abaixo de 900, nunca renumerar) + módulo PURO no
molde de `ferramentas.ts` → **verify:** `npm run verify` verde + sonda `shots:*` que ENXERGUE o
bloco. Atrás: `bench:headless` dos ids de 16 bits, ovelha+lã (§🍖 F8), cadeira.

## Pendências e bloqueios

- 3ª pessoa é v1 não polida.
- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **15/10 (UI do aluno — 2 mudanças):** amigos virou **aba** do `#painel` (`friends.ts` deixou de
  ser painel: vira `renderAmigos` + a fábrica de controles do `panels.ts`; `#amigos` sumiu do
  index e do `painelHost`), e a árvore de comandos foi pro **shared** (`comandos.ts`) com o papel
  de cada comando — 38 testes, incluindo paridade com a lista do "Comando desconhecido" e os
  gates checados contra uma sessão de VERDADE. Sondas: `toque` mede a caixa de comandos contra a
  linha do teclado (280/460/600px, deitado e em pé) e `amigos` ganhou a visão da ALUNA (10 de 10
  à vista, zero comando de professor). **A queixa "botões atrás do teclado" NÃO era geometria.**
  Depois: regra "lista ganha de digitação" no painel do dedo e `tp_pedidos` (o servidor avisa
  quem pediu teleporte, e o `/tpa` só lista esses; a lista só abre com 2+ pedidos). Achados na
  varredura do próprio lote: o 📋/tecla P FECHAVAM o painel em vez de trocar de aba (`8078681`),
  e a barra de abas do aluno não tinha sonda (`22ba7b5`).
- **13/10 (presença — 2 consertos + marco):** **posse do nome** (bug-672, `c237b88`) e
  **silêncio por perguntas** (bug-675 sobra, `dcd599e`) — controle negativo + smoke em host real;
  marco "Seu nome volta com você". O portão do ids16 parou de depender de `server/world.ljw`.
- **10/10:** launchers com `node --import tsx` (bug-666), ▣ com `data-acao` (bug-676), botão
  "restaurar", A/B dos ids16 no codec (.ljw +0,02%), sondas matando o Chrome pelo GRUPO —
  **bateria 17/17 verde**. Na aula: quebra v2, cama/porta e voo aprovados.
- **05/10 e 17-28/09:** bug-675 (host parado derrubava a turma), bug-674, logs separados;
  `/contexto` nos TIERS, bug-673, §🔨 ferramentas v2, §🪓 machado e pá, bug-672 e bug-671.

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-15

```
9abedf0 fix(hooks): o pre-push ganha bit de execução — sem ele o git IGNORAVA o gate
a9e0564 chore(lote): marco "Seu nome volta com você" e o portão do ids16 sem fixture local
c237b88 fix(presenca): quem volta com o mesmo nome TOMA POSSE na hora (bug-672, sobra)
9f27bc2 docs(contexto): STATUS aponta a sobra do host corrigida (dcd599e) e os 15 s como suspeito n. 1
dcd599e fix(presenca): o silêncio passou a ser cobrado por PERGUNTAS, não por relógio (bug-675, sobra)
99f32bd fix(sondas): matar o Chrome pelo GRUPO, senão um filho regrava o perfil
0cf03ad fix(sondas): perfil do Chrome some no fim, e Ctrl+C não deixa navegador órfão
fad2f1a docs(contexto): sonda morta por PID deixa Chrome órfão
--- status ---
 M .claude/context/LEARNINGS.md
 M .claude/context/MAP.md
 M .claude/context/STATUS.md
 M .claude/context/TODO.md
```
<!-- auto:end -->
