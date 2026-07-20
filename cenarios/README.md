# Cenários pedagógicos — 6º ao 9º ano

Seis aulas prontas, uma por arquivo `.ljw`. Cada aula é o **mesmo mundo de cabines**:
uma cabine para o professor (no centro, onde todo mundo nasce) e uma cabine por grupo,
na fileira logo à frente.

Os `.ljw` **são versionados no git** (decisão 2026-07-16: o git é o canal de sync
casa↔escola). A fonte da verdade continua sendo o gerador: `server/src/cenarios/gerar.ts`
— mudou algo nele, rode `npm run cenarios` e commite os arquivos novos.

```bash
npm run cenarios                      # gera os 6 .ljw em cenarios/ (5 grupos)
npm run cenarios -- --grupos 6        # outra quantidade de grupos (1 a 8)
npm run cenarios -- --codigo suaSenha # código de professor gravado no mundo
npm run cenarios -- --revelar         # deixa o gabarito À VISTA (vira cópia — turma mais nova)
```

O gerador **digita os mesmos comandos que o professor digitaria no jogo** (`/grupo criar`,
`/regiao criar`, `/bloco`, `/objetivo add construir`) contra o servidor de verdade, e depois
abre o arquivo gerado num servidor novo, entra como aluno e completa a área do grupo 1 para
conferir. Cenário que não fecha não vira arquivo.

## Como levar pro lab

No PC do professor, dois terminais:

```bash
LJ_SAVE=cenarios/aula1-sequencia.ljw LJ_CODIGO=prof2026 npm run start -w server   # servidor (porta 8080)
npm run dev                                                                        # cliente (porta 5173)
```

O servidor **imprime o código de professor no boot** e salva sozinho a cada 30 s (e no Ctrl+C).
Os alunos abrem `http://IP-DO-PROFESSOR:5173` no navegador → menu → **multiplayer** →
endereço `ws://IP-DO-PROFESSOR:8080`, nome e um PIN de 4 dígitos (o PIN é escolhido pelo aluno
na primeira entrada e é o que impede outro aluno de entrar com o nome dele).

O professor entra pelo mesmo caminho, mas preenche também o campo **código** — é o código que
dá o papel de professor (painel de autoria na tecla `P`, comandos de chat, `/resetpin`).

Cada aula é um arquivo separado: para trocar de aula, pare o servidor e suba com outro `LJ_SAVE`.
Os grupos e o progresso ficam gravados **dentro** do `.ljw`, então dá para parar no meio e
continuar na aula seguinte.

## O que o aluno vê

Ao entrar, o aluno já cai num grupo (distribuição automática, um em cada grupo). No canto
superior direito aparece o enunciado e um contador ao vivo (ex.: `4/12`). A **caixa verde** é a
área do grupo dele: uma faixa de blocos no chão, alguns passos à frente da porta da cabine do
grupo. O primeiro bloco da sequência é o mais perto da cabine.

Na cabine do professor há uma **caixa verde vazia**: é o gabarito, fotografado pelo jogo e
apagado de propósito. No fechamento da aula, o professor pode montar a resposta ali para a turma
conferir — ou gerar os mundos com `--revelar` se a turma precisar do modelo à vista.

Blocos: tecla `E` abre o inventário; as lãs coloridas estão lá. Clique esquerdo quebra, direito
coloca, botão do meio copia o bloco mirado.

---

## Aula 1 — `aula1-sequencia.ljw` · "Continue a regra"

**Pilar:** reconhecimento de padrão + generalização.

A faixa do grupo tem 12 blocos e os **4 primeiros já estão montados**: vermelho, azul, azul,
vermelho. O grupo precisa continuar a regra até o 12º.

**Resposta:** vermelho–azul–azul, repetido 4 vezes.

Os 4 blocos dados não são enfeite: quem lê "vai alternando uma cor de cada vez" erra já no
terceiro bloco, e o contador denuncia na hora. A discussão que interessa é *"qual é a regra?"* —
peça ao grupo que diga a regra em voz alta **antes** de colocar o quinto bloco.

## Aula 2 — `aula2-binario.ljw` · "Escreva 45 em binário"

**Pilar:** abstração + representação.

A faixa tem 8 blocos e começa **vazia**. Branco = 0, preto = 1, do bit de maior valor (128) para
o de menor (1).

**Resposta:** branco, branco, preto, branco, preto, preto, branco, preto (`00101101` = 32+8+4+1).

Vale mostrar a tabela 128–64–32–16–8–4–2–1 no quadro e deixar o grupo decidir sozinho quais
"lâmpadas" acender. Se um grupo terminar cedo, dê outro número (troque só o enunciado com
`/objetivo texto 1 …` — não precisa gerar mundo novo, mas aí o gabarito não confere mais; para
outro número, gere um mundo novo mudando o `bits(45, 8)` no gerador).

## Aula 3 — `aula3-depurar.ljw` · "Ache os 2 erros"

**Pilar:** depuração — testar uma hipótese contra a regra.

A faixa nasce com os 12 blocos **já montados**, mas 2 estão errados. A regra se repete a cada 4
blocos: vermelho, amarelo, azul, azul.

**Resposta:** os erros estão no **6º** bloco (está azul, devia ser amarelo) e no **10º** (está
vermelho, devia ser amarelo). O contador começa em `10/12` — ele diz *quantos* estão certos, mas
não *quais*: achar é trabalho do grupo.

É a aula mais próxima do que programar realmente é. Peça que o grupo aponte o erro **antes** de
quebrar o bloco.

## Aula 4 — `aula4-decifrar.ljw` · "Decifre a mensagem"

**Pilar:** representação + decodificação (cifra de César).

Ao lado da área vazia de cada grupo há uma **mensagem cifrada em blocos-letra**: `MPHJDB`.
A regra está no enunciado: cada letra cifrada vale a letra **anterior** do alfabeto.

**Resposta:** `LOGICA` (M→L, P→O, H→G, J→I, D→C, B→A). Os blocos-letra estão no inventário
(tecla `E`).

Ponte natural com criptografia e com "código = representação combinada". Fechamento bom:
grupos inventam mensagens cifradas uns para os outros no mundo livre.

## Aula 5 — `aula5-simetria.ljw` · "Conserte o desenho"

**Pilar:** decomposição + depuração com invariante (simetria).

Uma **parede** de 7×6 lãs (vermelho sobre fundo branco) devia mostrar um coração simétrico —
mas nasce com **4 células erradas**, nenhuma com a espelhada errada junto: toda troca quebra
a simetria, então a regra do enunciado basta para achar todas.

**Resposta:** o contador começa em `38/42`. Os 4 erros (coluna 1–7 da esquerda, linha 1–6 de
baixo pra cima): **col 1, linha 4** e **col 2, linha 5** estão brancos e deviam ser vermelhos;
**col 6, linha 1** e **col 7, linha 2** estão vermelhos e deviam ser brancos. Atenção: consertar
"pelo espelho errado" (deixar simétrico, mas diferente do coração) não fecha o contador — e essa
é a discussão boa: *simetria era necessária, mas não suficiente*.

## Aula 6 — `aula6-manual.ljw` · "Siga o manual"

**Pilar:** seguir algoritmo — instruções em passos, ordem e precisão.

Área 3×3 vazia; na parede atrás dela, **3 quadros** com o manual: tapetes azuis nos 4 cantos,
mesa no centro, 4 cadeiras viradas **para** a mesa. O objetivo compara célula a célula — cadeira
virada pro lado errado conta como erro (a direção do móvel importa: coloque olhando para onde a
frente deve apontar).

**Resposta:** 9 células — 4 tapetes azuis (cantos), mesa (centro), 4 cadeiras (lados, todas de
frente pro centro). Contador em `0/9`.

Fechamento: "o que faltou no manual?" — depois cada grupo escreve o próprio manual (nos quadros!)
para outro grupo executar. Instrução ambígua = bug de especificação.

---

## O que observar (indicadores da seção 14 do projeto)

- O grupo enuncia a regra antes de construir, ou vai por tentativa e erro?
- Quando o contador não sobe, o grupo revisa a hipótese ou continua chutando?
- Divisão de trabalho dentro do grupo (quem constrói, quem confere).
- Aula 3: procuram sistematicamente (varrendo a faixa) ou aleatoriamente?
