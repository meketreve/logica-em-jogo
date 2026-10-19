---
updated: 2026-10-19
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc com o `origin`
(`90b9295`), árvore limpa. Ambiente é só LINUX.

16/10 entrou o **§🔌 1º circuito lógico** (alavanca, fio, lâmpada, porta E — os primeiros ids
≥ 256) e 19/10 fechou com o **objetivo que CHECA** o circuito. Antes, em 15/10, a UI do aluno.
**Nada desses lotes foi visto em aula ainda** — nem o resto da lista de 10/10 — `TODO.md`.

⚠️ **bug-675 (heartbeat) NÃO está fechado:** na aula de 10/10 as quedas **diminuíram mas não
zeraram**. Os consertos de 13/10 atacam causas reais (host travado + nome preso); o que restar
aponta pro **15 s** derrubando tablet que engasgou de verdade. A próxima aula decide: quantos
caíram, se viram o motivo na tela, se é sempre o mesmo tablet.

## Próxima fase

**§🔌 modelos melhores das peças** (doc do usuário, 19/10): lâmpada que ILUMINA, fio conectado
no molde da cerca, porta como CHIP com pinos e alavanca em pé/deitada — antes da NÃO, pra não
pagar o redesenho duas vezes. Seção §🔌 no `todo.md`. Depois: a **porta NÃO**, que ⚠️ **quebra o
ponto fixo** do motor e exige estado por tick. Atrás: `bench:headless`, ovelha+lã, cadeira.

## Pendências e bloqueios

- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **19/10 (§🔌 porta OU):** 2ª regra do jogo. As portas viraram TABELA no `circuitos.ts` (`PORTAS`
  + `LIGA`): a OU entrou sem um `if` novo no motor — `every` → `some` — e `isPortaE`/`frenteDaPortaE`
  viraram `tipoDaPorta`/`frenteDaPorta`. Ids 270-277, topo com anel (a E tem barras), receita no
  fim. Seção C2 da sonda: 1 OU 0 = 136,7 onde a E ficou em 91,3.

- **19/10 (§🔌 o OBJETIVO que CHECA o circuito):** tipo `acender` (`scenario.ts` +
  `session/cenario.ts`): o add FOTOGRAFA a área (uma por grupo) e conclui quando toda lâmpada
  acende **com o circuito intacto** — só ALAVANCA pode mudar, decisão do usuário. `extras` = peças
  fora do lugar. 12 testes; seção E da sonda. Saiu junto o "objetivo concluído:" duplicado.

- **19/10 (teto de BYTES no chat):** teto PAR (caractere + byte, `MAX_CHAT_BYTES` 512,
  `shared/src/texto.ts`) e teto do FRAME cru antes do `JSON.parse`, na `session` e no `maxPayload`
  do `ws`. Smoke `chat-tamanho`.

- **16/10 (§🔌 o 1º CIRCUITO LÓGICO):** alavanca, fio, lâmpada e porta E — **os primeiros ids
  ≥ 256**. Motor PURO (`circuitos.ts`, ponto fixo que só roda quando uma peça muda), receitas,
  "só no SEU terreno", aba na mochila, e a `shots:circuito` mede a tabela-verdade **em pixel**.
- **15/10 (UI do aluno):** amigos virou **aba** do `#painel`; comandos no shared com o PAPEL de
  cada um (o aluno vê 10, não 26). **13/10:** posse do nome (bug-672) e silêncio por PERGUNTAS.
  **10/10:** launchers com `node --import tsx` (bug-666), ▣ com `data-acao` (bug-676), ids16.

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
