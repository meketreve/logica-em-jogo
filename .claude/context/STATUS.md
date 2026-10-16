---
updated: 2026-10-16
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc com o `origin`
(`90b9295`), árvore limpa. Ambiente é só LINUX.

16/10 entrou o **§🔌 1º circuito lógico** (alavanca, fio, lâmpada, porta E) — os primeiros ids
≥ 256, que é pra isso que os 16 bits foram feitos. Antes, em 15/10, a UI do aluno: amigos virou
ABA do painel e a árvore de comandos passou a filtrar por PAPEL (10 em vez de 26) com lista no
lugar de digitação. **Nada dos dois lotes foi visto em aula ainda** — nem o resto da lista de
10/10 (machado/pá, logs, loja, ids16) — `TODO.md`.

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
- **13/10:** posse do nome (bug-672) e silêncio cobrado por PERGUNTAS (sobra do bug-675).
- **10/10:** launchers com `node --import tsx` (bug-666), ▣ com `data-acao` (bug-676), botão
  "restaurar", A/B dos ids16 no codec (.ljw +0,02%), sondas matando o Chrome pelo GRUPO —
  **bateria 17/17 verde**. Na aula: quebra v2, cama/porta e voo aprovados.

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-16

```
90b9295 feat(circuito): §🔌 o 1º BLOCO DE LÓGICA — alavanca, fio, lâmpada e porta E
937f357 docs(contexto): STATUS de volta ao teto de 60 linhas
76d7d26 docs(contexto): STATUS com o lote de 15/10 inteiro e o sha certo
d3af433 feat(tp): o servidor avisa QUEM pediu teleporte, e o /tpa lista só esses
96d94b8 feat(comandos): o /tpa também lista a turma (e some a última exceção)
39de19f feat(comandos): no painel do dedo, LISTA ganha de digitação (/tpp mostra a turma)
8078681 fix(painel): o 📋 e a tecla P FECHAVAM o painel em vez de trocar de aba
22ba7b5 test(painel): a sonda passa a ver a BARRA DE ABAS do aluno, e some código morto
--- status ---
 M .claude/context/LEARNINGS.md
 M .claude/context/MAP.md
 M .claude/context/STATUS.md
 M .claude/context/TODO.md
```
<!-- auto:end -->
