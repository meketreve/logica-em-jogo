---
updated: 2026-10-15
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. `main` em sinc com o `origin`
(`9abedf0`), árvore limpa. Ambiente é só LINUX.

O lote de 13/10 fechou as duas pontas da presença: **quem reabre o navegador volta NA HORA**
(PIN certo = posse do nome) e **silêncio virou 3 perguntas de verdade** — controle negativo +
smoke em host real; marco novo: "Seu nome volta com você · 13/10". **O resto da lista de teste
de 10/10 segue sem ter sido visto em tela** (machado/pá, logs, loja, ids de 16 bits) — `TODO.md`.

⚠️ **bug-675 (heartbeat) NÃO está fechado:** na aula de 10/10 as quedas **diminuíram mas não
zeraram**. Os consertos de 13/10 atacam causas reais (host travado + nome preso); o que restar
aponta pro **15 s** derrubando tablet que engasgou de verdade (Wi-Fi de pé, página parada). A
próxima aula decide: quantos caíram, se viram o motivo na tela, se é sempre o mesmo tablet.

## Próxima fase

**O 1º bloco de circuito lógico** — a razão de os ids de 16 bits terem sido feitos; **BLOQUEADO
numa pergunta ao usuário**: QUAL bloco e como funciona na aula (entrevista de escopo antes de
codar). Não começar sem a resposta.

Com a resposta: `shared/src/blocks.ts` (id novo abaixo de 900, nunca renumerar) + módulo PURO no
molde de `ferramentas.ts` → **verify:** `npm run verify` verde + sonda `shots:*` que ENXERGUE o
bloco. Atrás: `bench:headless` dos ids de 16 bits, ovelha+lã (§🍖 F8), cadeira.

## Pendências e bloqueios

- 3ª pessoa é v1 não polida.
- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **13/10 (presença — 2 consertos + marco):** **posse do nome** (bug-672, `c237b88`) e
  **silêncio por perguntas** (bug-675 sobra, `dcd599e`) — controle negativo + smoke em host real;
  marco "Seu nome volta com você". O portão do ids16 parou de depender de `server/world.ljw`.
- **10/10 (lote de 4 + aula real):** launchers sobem o host com `node --import tsx` (bug-666;
  portão no `checar-launchers` + `_smoke-sighup`); ▣ com `data-acao` (bug-676, `f10-shot` de
  volta); botão "restaurar" (`shots:restaurar`, 13 asserções); A/B dos ids de 16 bits medido no
  codec (.ljw +0,02%, decode 5,1→6,9 ms); as 17 sondas passaram a matar o Chrome pelo GRUPO e
  apagar o perfil (nem Ctrl+C deixa órfão) — **bateria 17/17 verde, duas vezes**. Na aula:
  quebra v2, cama/porta e voo aprovados.
- **05/10:** **bug-675** — heartbeat derrubava a turma toda quando o HOST parava; sonda
  `shots:queda`. **bug-674** (voo voltava desligado: runtime fora do `SaveMeta`) + portão da aula
  sem voo; changelog do lote. E **logs de sessão** por arquivo (`-chat.log` × `-eventos.log`; o
  único chegava a 344 KB, 2434/2434 de sistema).
- **17-28/09:** `/contexto` nos TIERS e contexto fora do `.wolf/`; **bug-673** (sha do HEAD no
  rótulo desarmava o portão do dist); §🔨 ferramentas v2, §🪓 machado e pá, bug-672 e bug-671.

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
