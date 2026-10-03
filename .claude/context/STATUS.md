---
updated: 2026-10-02
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. Árvore limpa, `main` **em sinc com o
`origin`** (`86df1d3`). Único arquivo solto: `relatorio/…docx:Zone.Identifier`, do usuário —
**não commitar**. Ambiente é só LINUX.

**O build com §🔨 quebra por tempo, §🪓 machado e pá, heartbeat de presença e preço de item
acabou de ser PUSHADO (02/10)** — então o launcher da escola já baixa isso na próxima vez que
rodar. Nada disso foi visto em tela pelo usuário ainda: a lista do que testar em aula está no
`TODO.md`, e ela deixou de ser hipotética.

## Próxima fase

**O 1º bloco de circuito lógico** — é a razão de os ids de 16 bits terem sido feitos, e está
**bloqueado numa pergunta ao usuário**: QUAL bloco, e como ele funciona na aula. Perguntar antes
de codar (feature grande = entrevista de escopo, ver `LEARNINGS.md`).

Atrás dela: `bench:headless` antes/depois dos ids de 16 bits, ovelha+lã (§🍖 F8), sentar na cadeira.

## Pendências e bloqueios

- **Save no Ctrl+C disputa corrida com o `npx`/`tsx` que embrulha o host** — hoje ganha por ~6 ms,
  mas é frágil (bug-666). Conserto de verdade: o launcher chamar `node` direto.
- `scripts/f10-shot.mjs` quebrado ("botão ▣ não encontrado") — o rótulo do botão muda com o item
  na mão. Não investigado.
- Singleplayer não oferece restaurar o backup `dataAntesIds16`; 3ª pessoa é v1 não polida.
- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe ao entrar; se o aviso de Dimas nova
  deve calar em turma cheia.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **02/10:** push dos dois commits represados — o conserto do **bug-673** chegou ao repositório
  (era um conserto que não tinha saído daqui, e a escola roda o que está no repo).
- **28/09–02/10:** skill `/contexto` migrada pro modelo de TIERS (3 aqui) e estes arquivos
  passaram a ter frontmatter + blocos `auto` do script.
- **25/09:** contexto migrado de `.wolf/` pra `.claude/context/`; **bug-673** — o rótulo de build
  carregava o sha do HEAD, o `client/dist` versionado mudava sozinho a cada commit e o portão do
  dist ficava desarmado justo no pre-push. Rótulo virou só a data.
- **23/09 (sessão 102):** §🪓 machado e pá — EXIGIR e ACELERAR viraram tabelas separadas.
- **22-23/09 (101):** heartbeat de presença (bug-672) e preço de ITEM na loja (bug-671).
- **17/09 (100):** §🔨 ferramentas v2 — segurar pra quebrar, rachadura, durabilidade.

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-02

```
86df1d3 docs(contexto): registra o bug-673 (rótulo auto-referente) no BUGS.md
d60f2cd fix(build): tira o sha do commit do rótulo — o dist parava de ser função da fonte
cfda969 docs(contexto): migra .wolf para .claude/context com imports no CLAUDE.md
a089663 feat(ferramentas): machado e pá — aceleram sem exigir (§🪓)
c5aca06 docs(status): handoff da sessão 101 — heartbeat, preço de item e OpenWolf desmontado
8cef404 chore: desmonta o OpenWolf — ficam STATUS, cerebrum e buglog
887c24a docs: remove planos/specs de skill e a folha de perguntas da loja
3a1e9d0 fix(rede): heartbeat libera o nome de quem fechou o tablet sem sair (bug-672)
1ccda8c fix(loja): preço de ITEM (pão, trigo, picareta) volta a salvar (bug-671)
8d9b206 chore(dist): rebuild com o rótulo da atualização nova
5754687 docs(wolf): marca o handoff da sessão 100 como pushado
a4b79af docs(wolf): handoff da sessão 100 — §🔨 Ferramentas v2 (segurar, rachar, gastar)
485d035 feat(ferramentas): quebrar leva tempo, a ferramenta gasta e a rachadura aparece (§🔨 v2)
a7757ae feat(ferramentas): durabilidade e tempo de quebra, no módulo puro (§🔨 v2, etapa 1)
bbbc793 docs(wolf): handoff da sessão 98 — loja, cama, porta, ids 16 bits, levantar e torre
--- status ---
 M .claude/context/BUGS.md
 M .claude/context/LEARNINGS-completo.md
 M .claude/context/LEARNINGS.md
 M .claude/context/MAP.md
 M .claude/context/STATUS.md
 M .claude/context/TODO.md
 M .claude/context/WORKFLOW.md
?? "relatorio/C\303\263pia de C\303\263pia de Modelo sequ\303\252ncia did\303\241tica 2026.docx\357\200\272Zone.Identifier"
```
<!-- auto:end -->
