---
updated: 2026-10-20
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc com o `origin`
(`295999c`), árvore limpa. Ambiente é só LINUX.

**O §🔌 engoliu 16/10 e 19/10** — seis lotes: as 4 peças, a porta OU, o objetivo que CHECA o
circuito, o redesenho das peças (doc do usuário), a luz suave e a placa de pressão. O jogo saiu
de "acende uma luz" pra "monta uma regra e o servidor confere". **Nada disso foi visto em aula
ainda** — nem o resto da lista de 10/10 (`TODO.md`). É o maior acúmulo de não-testado do projeto
até aqui, e a próxima aula vale mais que o próximo lote.

⚠️ **bug-675 (heartbeat) NÃO está fechado:** na aula de 10/10 as quedas **diminuíram mas não
zeraram**. Os consertos de 13/10 atacam causas reais (host travado + nome preso); o que restar
aponta pro **15 s** derrubando tablet que engasgou de verdade. A próxima aula decide: quantos
caíram, se viram o motivo na tela, se é sempre o mesmo tablet.

## Próxima fase

**Levar à aula antes de codar mais.** Depois disso, a **fase 1 do §🔌** (seção própria no
`todo.md`): o **botão** (pulso — precisa de prazo por célula, que o motor não tem) e a **porta
automática** (a 1ª saída que não é luz; mexe no gate de claim: quem abre a porta de quem?).
→ **verify:** `shots:circuito` com seção nova vendo a peça, como a C3 da placa.

Atrás: a **porta NÃO**, que ⚠️ **quebra o ponto fixo** do motor (hoje o passo só LIGA; um NÃO
ligado em si mesmo oscila pra sempre) e exige estado por tick — cabeçalho de `circuitos.ts`.
Da iluminação, a suavização entrou; **luz colorida** e a **curva de brilho** esperam decisão
dele. Mais atrás: `bench:headless`, ovelha+lã.

## Pendências e bloqueios

- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **19/10 — o §🔌 inteiro, em seis lotes.** Ordem: objetivo `acender` (fotografa a área e cobra
  circuito INTACTO) · porta **OU** (as portas viraram TABELA `PORTAS`+`LIGA`, ids 270-277) ·
  **modelos melhores** do doc dele (lâmpada ILUMINA 14 como a tocha, fio no molde da cerca, porta
  virou CHIP com pinos que acendem sozinhos, alavanca em pé × deitada) · **luz suave** por
  vértice (atributo virou Uint16, 1/16 de nível) · **placa de pressão** (ids 278-279, estado pelo
  TICK via `overlapsAnyPlayer`). Antes disso, no mesmo dia, o teto de BYTES do chat.
- **Bugs que saíram no caminho, todos no `BUGS.md`:** 2 do motor de LUZ (emissor OPACO não
  semeado no incremental, e emissor apagado dentro da região varrida não voltava — os dois da
  FORNALHA desde o §🍖 F10b) e o "objetivo concluído:" duplicado no chat.
- **16/10 (§🔌 o 1º CIRCUITO):** alavanca, fio, lâmpada e porta E — **os primeiros ids ≥ 256**.
- **15/10:** amigos virou aba do `#painel`; comandos com o PAPEL (o aluno vê 10, não 26).
  **13/10:** posse do nome (bug-672). **10/10:** launchers (bug-666), ▣ (bug-676), ids16.

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-20

```
295999c feat(circuito): §🔌 a placa de pressão — a primeira entrada que não é a mão
a934dbc docs(workflow): quando abrir bloco NOVO no changelog, e quando só acrescentar
b9bb0c0 feat(luz): §💡 luz SUAVIZADA por vértice, e a lâmpada ilumina igual à tocha
b1805f7 feat(circuito): §🔌 modelos melhores — luz, fio conectado, chip e alavanca
9d1e097 feat(circuito): §🔌 a porta OU, e as portas viram TABELA no motor
9583b7f feat(cenario): §🔌 o OBJETIVO que CHECA o circuito
a40a4b0 feat(chat): teto de BYTES na mensagem, e no frame cru antes do parse
ec4d23e docs(contexto): handoff da sessão — circuito, UI do aluno e os 4 bugs do caminho
--- status ---
 M .claude/context/LEARNINGS.md
 M .claude/context/MAP.md
 M .claude/context/STATUS.md
 M .claude/context/TODO.md
```
<!-- auto:end -->
