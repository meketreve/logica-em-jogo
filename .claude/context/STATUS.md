---
updated: 2026-10-20
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. Ambiente é só LINUX.

**O §🔌 engoliu 16/10 e 19/10; 20/10 virou o §💰** — `/vender`, a primeira FONTE de Dimas. Até
aqui o dinheiro era estoque FIXO (50 na 1ª entrada, só circulando pelo baú-loja): quem gastasse
ficava sem jeito de ganhar. **Nada do §🔌 nem do §💰 foi visto em aula** — sete lotes. É o maior
acúmulo de não-testado do projeto, e a próxima aula vale mais que o próximo lote.

⚠️ **bug-675 (heartbeat) NÃO está fechado**, e 20/10 trouxe pista dele: desconfia que parte das
quedas é **aluno tocando em "salvar e voltar ao menu" sem querer**. Conferi: **o log de hoje não
responde isso** — o `-eventos.log` não registra saída nenhuma. Lote proposto no `todo.md`.

**Aprovado em aula:** comandos no chat com PAPEL + painel do dedo ("ficaram bons, muito bons").

## Próxima fase

**Levar à aula antes de codar mais.** Depois disso, a **fase 1 do §🔌** (seção própria no
`todo.md`): o **botão** (pulso — precisa de prazo por célula, que o motor não tem) e a **porta
automática** (1ª saída que não é luz; mexe no gate de claim).
→ **verify:** `shots:circuito` com seção nova vendo a peça, como a C3 da placa.

Atrás: a **porta NÃO**, que ⚠️ **quebra o ponto fixo** do motor (o passo só LIGA; um NÃO ligado
em si mesmo oscila pra sempre) e exige estado por tick — cabeçalho de `circuitos.ts`. Da
iluminação, **luz colorida** e **curva de brilho** esperam decisão dele. Atrás: `bench:headless`.

**Barato e com retorno de diagnóstico:** o lote das quedas (motivo da saída no `-eventos.log`
+ confirmação no botão de sair quando em rede). Ele responde a desconfiança dele em UMA aula.

## Pendências e bloqueios

- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **20/10 — §💰 `/vender`, o balcão.** 4º tipo do `ContainerPanel` e o 1º que **não é bloco**:
  o balcão é do JOGADOR (sem posição, fora do save, devolve ao fechar). Preço unitário sob cada
  slot + total no rodapé, e só então vender — o Dimas é **criado** ali. Dele: escala baixa, sem
  teto, ferramenta não vende. Preço é **lista de permissão do que se COLHE** (233 ids cabem numa
  mochila; precificar todos abriria o cano de lavagem). ⚠️ **Quem sustenta a tabela é o PORTÃO**:
  varre `RECEITAS` + `COZIMENTO` e reprova saída que vale mais que a entrada — pegou 3 canos, um
  (`1 tronco → 4 FOLHAS`) que eu não tinha visto. Sonda `shots:venda`, 25 asserções.
- **19/10 — o §🔌 em seis lotes:** objetivo `acender` (fotografa a área, cobra circuito INTACTO)
  · porta **OU** (portas viraram TABELA `PORTAS`+`LIGA`, ids 270-277) · modelos melhores do doc
  dele · luz suave por vértice (atributo virou Uint16) · placa de pressão (278-279, pelo TICK).
- **16/10:** o 1º CIRCUITO — alavanca, fio, lâmpada, porta E (**os primeiros ids ≥ 256**).
  **15/10:** amigos virou aba do `#painel`; comandos com o PAPEL. **13/10:** posse do nome
  (bug-672). **10/10:** launchers (bug-666), ▣ (bug-676), ids16.

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
