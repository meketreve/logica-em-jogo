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

**§🔌 porta NÃO e OU** — as duas peças que faltam pra lógica fechar. ⚠️ **A NÃO quebra o ponto
fixo do motor** (hoje o passo só LIGA o que estava desligado; um NÃO ligado em si mesmo oscila
pra sempre) — ver o cabeçalho de `circuitos.ts`: vai precisar de estado por tick de verdade.
Atrás: `bench:headless` dos ids16, ovelha+lã (§🍖 F8), cadeira.

## Pendências e bloqueios

- 3ª pessoa é v1 não polida.
- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **19/10 (§🔌 o OBJETIVO que CHECA o circuito):** fecha o pedido de 16/10. Tipo `acender`
  (`scenario.ts` + `session/cenario.ts`): o add FOTOGRAFA a área (uma por grupo) e o servidor
  conclui quando toda lâmpada acende **com o circuito intacto** — só ALAVANCA pode mudar, decisão
  do usuário. `extras` = peças fora do lugar, e o HUD explica. Opção no painel do professor; 12
  testes; seção E da `shots:circuito`. No print saiu o "objetivo concluído:" duplicado (bug velho,
  `toContain` deixava passar).

- **19/10 (teto de BYTES no chat):** o chat media CARACTERES e emoji custa 4 bytes — agora o teto
  é PAR (`MAX_CHAT_BYTES` 512, corte em fronteira de code point, `shared/src/texto.ts`) e o frame
  cru tem teto antes do `JSON.parse`, na `session` **e** no `maxPayload` do `ws`. Smoke novo
  `chat-tamanho`; o `shots:tablet` vê o campo parar em 510.

- **16/10 (§🔌 o 1º CIRCUITO LÓGICO):** alavanca, fio, lâmpada e porta E — **os primeiros ids
  ≥ 256**. Motor PURO (`circuitos.ts`, ponto fixo que só roda quando uma peça muda), receitas,
  "só no SEU terreno", aba na mochila, e a `shots:circuito` mede a tabela-verdade **em pixel**.
- **15/10 (UI do aluno):** amigos virou **aba** do `#painel`; árvore de comandos no shared
  (`comandos.ts`) com o PAPEL de cada um — o aluno vê 10, não 26. "Botões atrás do teclado" NÃO
  era geometria. **13/10:** posse do nome (bug-672) e silêncio cobrado por PERGUNTAS (bug-675).
- **10/10:** launchers com `node --import tsx` (bug-666), ▣ com `data-acao` (bug-676), "restaurar", A/B dos ids16. Na aula: quebra v2 e voo OK.

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
