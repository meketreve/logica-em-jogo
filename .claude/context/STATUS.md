---
updated: 2026-10-15
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc com o `origin`
(`937f357`), árvore limpa. Ambiente é só LINUX.

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

**§🔌 o OBJETIVO que checa o circuito** — a 2ª metade da resposta do usuário em 16/10 ("acender a
lâmpada com a combinação certa" + "objetivo novo que CHECA"): hoje o professor monta o desafio e
olha; falta o servidor conferir sozinho, com progresso por grupo como os de construir/chegar
(`shared/src/session/cenario.ts`). Atrás: porta NÃO e OU (⚠️ a NÃO quebra o ponto fixo do motor —
ver o cabeçalho de `circuitos.ts`), `bench:headless` dos ids16, ovelha+lã (§🍖 F8), cadeira.

## Pendências e bloqueios

- 3ª pessoa é v1 não polida.
- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **16/10 (§🔌 o 1º CIRCUITO LÓGICO):** alavanca, fio, lâmpada e porta E — **os primeiros ids
  ≥ 256**, que é pra isso que os 16 bits foram feitos. Motor PURO (`circuitos.ts`, ponto fixo que
  só roda quando uma peça muda) + índice e tick na `session.ts`, receitas, regra de "só no SEU
  terreno", aba própria na mochila e a sonda `shots:circuito`, que mede a tabela-verdade **em
  pixel** (1E1 = 136,7 contra 91,3 nas outras três linhas). 18 testes novos.

- **15/10 (UI do aluno):** amigos virou **aba** do `#painel` (`#amigos` sumiu); árvore de
  comandos foi pro shared (`comandos.ts`) com o PAPEL de cada um — o aluno vê 10, não 26; e
  "lista ganha de digitação" no painel do dedo (`/tpp` mostra a turma; `/tpa`, só quem pediu, via
  `tp_pedidos`). A queixa "botões atrás do teclado" NÃO era geometria. Achados na varredura do
  próprio lote: 📋/tecla P FECHAVAM o painel em vez de trocar de aba.
- **13/10 (presença):** posse do nome (bug-672) e silêncio cobrado por PERGUNTAS (sobra do
  bug-675); marco "Seu nome volta com você".
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
