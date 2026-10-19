---
updated: 2026-10-19
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc com o `origin`
(`90b9295`), árvore limpa. Ambiente é só LINUX.

O §🔌 dominou 16/10 e 19/10: as peças, a porta OU, o objetivo que CHECA o circuito e o redesenho
das peças. **Nada disso foi visto em aula ainda** — nem o resto da lista de 10/10 (`TODO.md`).

⚠️ **bug-675 (heartbeat) NÃO está fechado:** na aula de 10/10 as quedas **diminuíram mas não
zeraram**. Os consertos de 13/10 atacam causas reais (host travado + nome preso); o que restar
aponta pro **15 s** derrubando tablet que engasgou de verdade. A próxima aula decide: quantos
caíram, se viram o motivo na tela, se é sempre o mesmo tablet.

## Próxima fase

**§🔌 fase 1 do `todo.md`** — botão (pulso, precisa de prazo por célula) e porta automática (a
1ª saída que não é luz). Depois, **a porta NÃO** — ⚠️ ela **quebra o ponto fixo** do motor (hoje o passo só LIGA; um NÃO
ligado em si mesmo oscila pra sempre), então exige estado por tick de verdade: ver o cabeçalho de
`circuitos.ts` e a seção §🔌 do `todo.md`. Da iluminação (pedido dele, 19/10) a
**suavização por vértice já entrou**; falta decidir LUZ COLORIDA (lote próprio, caro) e a curva
de brilho pro projetor — que só se afina vendo. Atrás: `bench:headless`, ovelha+lã.

## Pendências e bloqueios

- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **19/10 (§🔌 placa de pressão):** a 1ª entrada que não é a mão — o estado vem do TICK
  (`overlapsAnyPlayer`), não do clique. Teve de sair do `isSolidBlock`: sólida, o portão do
  bug-605 resgatava quem pisasse e ela nunca ligava. Sonda C3, câmera parada: 112,2 → 155,5.

- **19/10 (§🔌 modelos melhores + §💡 luz suave):** o doc do usuário inteiro. Lâmpada ACESA
  **ilumina 14, igual à tocha**; fio no molde da cerca; porta virou **CHIP** com pino de saída e
  dois de entrada que **acendem sozinhos**; alavanca em pé × deitada. "Conecta?" é UMA função,
  do motor e do mesher. A **luz virou suave por vértice** (atributo Uint16, 1/16 de nível).
  Saíram 2 bugs do motor de LUZ, os dois da fornalha desde o §🍖 F10b.

- **19/10 (§🔌 porta OU):** as portas viraram TABELA (`PORTAS` + `LIGA`); a OU entrou sem um `if`
  novo no motor. Ids 270-277.

- **19/10 (§🔌 objetivo `acender`):** o add FOTOGRAFA a área e conclui quando toda lâmpada acende
  **com o circuito intacto** — só ALAVANCA pode mudar.


- **16/10 (§🔌 o 1º CIRCUITO):** alavanca, fio, lâmpada e porta E — **os primeiros ids ≥ 256**.
- **15/10:** amigos virou aba do `#painel`; comandos com o PAPEL (o aluno vê 10, não 26).
  **13/10:** posse do nome (bug-672). **10/10:** launchers (bug-666), ▣ (bug-676), ids16.

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
