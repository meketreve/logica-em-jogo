---
updated: 2026-10-20
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. Ambiente é só LINUX.

**O §🔌 engoliu 16/10 e 19/10; 20/10 virou o §💰 + §📱.** **Nada disso foi visto em aula** —
oito lotes: os seis do circuito, o `/vender` (a 1ª FONTE de Dimas: até aqui era estoque fixo) e
o conserto da barra de navegação. **Ele testa na escola em 21/10 e traz os logs.**

⚠️ **bug-675: a CAUSA apareceu em 20/10, pela pista dele** — cai **só nas turmas pequenas**, e
é a palma da mão na BARRA DE NAVEGAÇÃO do Android (não rede, não o botão de sair do jogo). A
tela cheia já era pedida ao entrar mas **ninguém a restaurava quando caía**. Atacado hoje; quem
**confirma é a próxima aula**, agora com o log dizendo por qual porta cada um saiu.

**Aprovado em aula:** comandos no chat com PAPEL + painel do dedo ("ficaram bons, muito bons").
## Próxima fase

**Levar à aula antes de codar mais** — e, nela, **ler o `-eventos.log`**: é ele que confirma (ou
derruba) a causa do bug-675. Depois, a **fase 1 do §🔌** (seção própria no `todo.md`): o **botão**
(pulso — precisa de prazo por célula, que o motor não tem) e a **porta automática** (1ª saída que
não é luz; mexe no gate de claim).
→ **verify:** `shots:circuito` com seção nova vendo a peça, como a C3 da placa.

Atrás: a **porta NÃO**, que ⚠️ **quebra o ponto fixo** do motor (o passo só LIGA; um NÃO ligado
em si mesmo oscila pra sempre) e exige estado por tick — cabeçalho de `circuitos.ts`. Da
iluminação, **luz colorida** e **curva de brilho** esperam decisão dele. Atrás: `bench:headless`.

## Pendências e bloqueios

- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **20/10 — launcher: o ciclo da AULA, de ponta a ponta.** **[10] mundo PLANO** (base pra montar;
  nome + P/M/G, porque o E é lazy e **ignora o preset** — "plano gigante" daria morro) ·
  **[11] publicar como AULA** (copia pra `cenarios/` FORÇANDO o prefixo "aula", que é o que
  torna o mundo reutilizável; o original fica editável) · e a **[8] agora varre as DUAS pastas**
  — `cenarios/aula7-corrida.ljw` vinha no pacote e estava **invisível no menu inteiro**.
- **20/10 — §📱 a barra de navegação do tablet (bug-675).** Tela cheia que se **segura** (cai →
  arma → volta no próximo toque; `requestFullscreen` exige gesto) · **"voltar" vira menu de
  pausa**, com a entrada de histórico re-empurrada a cada `popstate` · e o host escreve
  `<nome> saiu: <motivo>` no `-eventos.log`, que **não registrava saída nenhuma**.
- **20/10 — §💰 `/vender`, o balcão.** 4º tipo do `ContainerPanel` e o 1º que **não é bloco**: é
  do JOGADOR (sem posição, fora do save, devolve ao fechar). Preço unitário sob cada slot +
  total no rodapé, e só então vender — o Dimas é **criado** ali. Dele: escala baixa, sem teto,
  ferramenta não vende. Preço é **lista de permissão do que se COLHE**. ⚠️ **Quem sustenta a
  tabela é o PORTÃO**: varre `RECEITAS` + `COZIMENTO` e reprova saída que vale mais que a
  entrada — pegou 3 canos, um (`1 tronco → 4 FOLHAS`) que eu não tinha visto.
- **19/10 — o §🔌 em seis lotes:** objetivo `acender` · porta **OU** (TABELA `PORTAS`+`LIGA`) ·
  modelos do doc dele · luz suave (Uint16) · placa. **16/10:** o 1º circuito, ids ≥ 256.

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
