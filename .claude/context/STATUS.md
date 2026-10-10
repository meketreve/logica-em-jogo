---
updated: 2026-10-10
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. Árvore limpa, `main` em sinc com o
`origin` (`7e8ce9b`). Ambiente é só LINUX.

O build "Cada ferramenta serve pra uma coisa · 05/10" **rodou em aula de verdade em 10/10** e o
usuário aprovou quebra v2, cama/porta e o voo persistindo. **O resto da lista de teste continua
sem ter sido visto em tela** (machado/pá, logs, presença, loja, ids de 16 bits) — está no `TODO.md`.

⚠️ **bug-675 (heartbeat) NÃO está fechado:** na aula de 10/10 as quedas **diminuíram mas não
zeraram**. O conserto do host pegou a causa que a queixa original descrevia, mas sobrou queda
sem explicação. Falta o detalhe da próxima aula (quantos, se viram o motivo na tela, se é sempre
tablet no Wi-Fi) antes de caçar — os 15 s da presença em `constants.ts` são o primeiro suspeito.

## Próxima fase

**O 1º bloco de circuito lógico** — é a razão de os ids de 16 bits terem sido feitos, e está
**BLOQUEADO numa pergunta ao usuário**: QUAL bloco, e como ele funciona na aula. Feature grande =
entrevista de escopo antes de codar (`LEARNINGS.md`). Não começar sem a resposta.

Com a resposta na mão, o ponto de entrada é `shared/src/blocks.ts` (id novo abaixo de 900, nunca
renumerar id que já existe) + um módulo PURO novo em `shared/src/`, no molde de `ferramentas.ts`
→ **verify:** `npm run verify` verde e uma sonda `shots:*` que ENXERGUE o bloco na tela.

Atrás dela: `bench:headless` antes/depois dos ids de 16 bits, ovelha+lã (§🍖 F8), sentar na cadeira.

## Pendências e bloqueios

- 3ª pessoa é v1 não polida.
- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **10/10 (lote de 4 da fila):** **bug-666 fechado** — os launchers sobem o host com
  `node --import tsx` (um processo só, sem `npm`/`tsx` no meio), com portão novo no
  `checar-launchers` e o `_smoke-sighup` provando a via real (margem 52–61 ms, 3 de 3).
  **bug-676** — o ▣ ganhou `data-acao` e as sondas pararam de procurar botão por TEXTO
  (`f10-shot` voltou a rodar). **Botão "restaurar"** no menu do singleplayer, com sonda nova
  `shots:restaurar` (13 asserções). E o A/B dos ids de 16 bits: no `bench:headless` o ruído do
  SwiftShader come o sinal, mas no codec o retrato é limpo — .ljw +0,02%, RAM do mundo P
  2 MB → 4 MB, decode 5,1 → 6,9 ms.
- **10/10 (aula real):** quebra v2 aprovada ("ficou boa"), cama e porta aprovados, e o voo
  liberado sobreviveu ao reinício do servidor (bug-674 confirmado EM AULA). Quedas do heartbeat
  diminuíram — ver o ⚠️ acima. Nada de código nesta sessão.
- **05/10:** **bug-675** — o heartbeat derrubava a turma inteira quando o HOST parava (ninguém
  era perguntado durante a parada) e o cliente ficava preso num mundo congelado; sonda nova
  `shots:queda`. **bug-674** (voo liberado voltava desligado: era runtime, fora do `SaveMeta`) +
  portão de que aula nasce sem voo salvo modelo criado assim; changelog com os 3 itens que
  faltavam e título novo (a data do build andou sozinha). E **logs de sessão** — `mundos/<nome>/logs/`, um par por sessão (`-chat.log` de
  gente, `-eventos.log` de servidor); o arquivo único chegou a 344 KB, 2434/2434 de sistema.
- **28/09–03/10:** skill `/contexto` migrada pro modelo de TIERS; estes arquivos ganharam
  frontmatter, blocos `auto` e as convenções novas.
- **25/09:** contexto migrado de `.wolf/`; **bug-673** — o rótulo de build carregava o sha do
  HEAD, o `dist` versionado mudava sozinho e o portão ficava desarmado no pre-push.
- **17-23/09 (100-102):** §🔨 ferramentas v2 (segurar, rachar, gastar), §🪓 machado e pá,
  heartbeat de presença (bug-672) e preço de ITEM na loja (bug-671).

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-05

```
dab46ce fix(presenca): o heartbeat parou de punir a turma pela parada do HOST (bug-675)
4fc8db4 docs(contexto): handoff de fim de sessão
1c7cbd5 docs(changelog): o lote vira marco próprio — 'Cada ferramenta serve pra uma coisa'
1d90d17 docs(changelog): voo por aula e os logs de sessão, que foram sem entrada
6d561c2 test(voo): portão — aula nasce sem voo, e abre voando se o MODELO foi salvo assim
c87591c fix(voo): o voo liberado pelo professor persiste no mundo (bug-674)
b855994 docs(contexto): logs de sessão no STATUS/MAP e dois aprendizados novos
2b8d2f9 feat(logs): log de sessão por arquivo, e fala de gente separada de evento
--- status ---
 M .claude/context/STATUS.md
 M .claude/context/TODO.md
```
<!-- auto:end -->
