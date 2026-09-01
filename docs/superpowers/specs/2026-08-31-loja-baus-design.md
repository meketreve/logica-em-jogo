# Loja em bloco — design

> Sessão 94 (2026-08-31). Motivado por comércio espontâneo já observado no
> piloto (3 das 4 turmas jogam só sobrevivência). Ver também
> `docs/loja-perguntas-alunos.md` — a moeda ainda vai a voto com a turma; este
> documento cobre a arquitetura, que funciona pra qualquer resultado da
> votação sem mudar de forma.

## O que é

Bloco novo, "Baú-Loja": craftável, terreno próprio (mesmo gate de qualquer
bloco em claim alheio — zero código novo pra isso). Quem coloca é o
**criador**; só ele gerencia (define preço, mexe no estoque livremente).
Qualquer outro jogador que alcance o bloco pode COMPRAR, mesmo fora do grupo
de amigos do terreno. `use_block` decide o painel pelo `clientId` de quem
clicou — sem comando de chat novo, sem raycast novo no servidor.

## Dado — `Container` ganha o tipo `"loja"`

```ts
interface ContainerLoja {
  criador: string; // nome de quem COLOCOU — não muda, nem se o dono do terreno mudar
  precos: Map<BlockId, Preco>; // 1 preço por TIPO de item presente no estoque
}

type Preco =
  | { tipo: "item"; item: BlockId; qtd: number } // troca direta OU recurso-como-moeda
  | { tipo: "dimas"; qtd: number }; // saldo numérico (se a turma votar Dimas)
```

O estoque em si é o MESMO array de slots que um baú comum já usa — nada novo
aí. Um tipo de item só fica comprável quando `precos` tem uma entrada pra ele;
sem preço definido, o item existe no baú mas ninguém compra (dono ainda não
decidiu quanto cobra). Preço é feito de um item só — as duas opções restantes
da votação (item-por-item, recurso existente) cabem nessa forma sem mudança;
só a Dimas precisa do segundo braço do union, porque ela não é um item.

## Dimas (se a turma votar nela)

Não é item — não ocupa slot, não craft, não é minerável. É um saldo numérico
por jogador, mostrado no inventário como vida/fome já são. Vive num mapa
NOVO, `readonly dimas = new Map<string, number>()` em `GameSession`, no mesmo
padrão de `identity`/`roster` (por NOME, sobrevive a desconexão, persiste no
save) — não em `SessionPlayer`, que é só o estado de quem está online agora.
Todo aluno recebe uma quantidade FIXA na primeira vez que entra (quanto,
ainda em votação — `docs/loja-perguntas-alunos.md`), constante com override
por env (`LJ_DIMAS_INICIAL`, mesmo padrão de `LJ_AGUA_TICK`/`LJ_CRESCIMENTO`
em `SessionOptions`).

Pagar em Dimas debita do comprador e credita DIRETO no `criador` — mesmo se
ele estiver offline (é por isso que mora num Map por nome, não num campo do
`SessionPlayer` conectado). Nunca entra no baú: não há "espaço" pra Dimas.

Pagamento em ITEM (as outras 2 opções da votação) segue diferente: entra no
MESMO baú, junto do estoque (decisão já tomada) — se o baú não tiver espaço
depois de sair o estoque vendido, a compra é recusada.

## Protocolo

- `sendContainer` (painel que já existe) ganha `loja?: { criador, precos,
  souOCriador }` quando o tipo é `"loja"`.
- `definir_preco { x, y, z, item, preco }` — servidor só aceita se
  `clientId` corresponde ao nome do `criador`. `preco: null` remove (item
  some da lista de comprável, continua no baú como estoque comum).
- `comprar { x, y, z, item, qtd }` — qualquer um. Servidor confere, NA ORDEM:
  reach (`withinReach`, igual todo `use_block`), item tem preço, estoque ≥
  `qtd`, comprador tem `qtd × preco.qtd` do pagamento (item OU Dimas
  conforme o tipo), e — só na trilha item — o baú tem espaço pro pagamento
  depois de sair o estoque. Qualquer falha: chat explicando o motivo pro
  comprador, mesmo padrão de recusa silenciosa+aviso que `claimBloqueia` já
  usa — nunca erro de protocolo solto.

## O gate — a exceção que essa feature É

Hoje `use_block` num container roda `claimBloqueia` ANTES de responder
qualquer conteúdo — "ler baú alheio é pior que mexer nele" (comentário já
existe em `session.ts`). Loja inverte isso de propósito: ler (comprar) é o
PONTO da feature. Pra `containerTipoDe(id) === "loja"`, `use_block` pula
`claimBloqueia` (mas mantém `confinaBloqueia` — confinamento físico de aula é
uma regra diferente, não é sobre dono do terreno) e decide o modo do painel
comparando o NOME de quem clicou (`this.players.get(clientId)?.name`) com o
`criador` guardado no container — não o claim, não o `clientId` (que muda a
cada reconexão).

Colocação (`place_block`) continua gated normal — só dono/membro do terreno
COLOCA um Baú-Loja ali. Isso não muda: reusa o gate que já existe pra
qualquer bloco.

## Cliente

Painel de container existente ganha um modo:

- **Criador:** o MESMO painel de transferência de sempre (mochila↔baú) +
  campo de preço editável ao lado de cada tipo de item presente — envia
  `definir_preco` ao editar.
- **Comprador:** vê estoque + preço por tipo, um campo de QUANTIDADE (input
  numérico — componente novo, não existe padrão parecido no jogo hoje) e um
  botão comprar, que manda `comprar`.

Saldo de Dimas (se a votação escolher) aparece na UI da mochila, ao lado de
vida/fome — mostrado, não editável pelo jogador.

## Testes

Mesmo molde de `containers.test.ts`/`claims.test.ts`/`invisivel.test.ts`:

- Preço só o `criador` define; outro membro do MESMO grupo tenta e é
  recusado (o ponto central da pergunta "quem gerencia" já respondida).
- Colocação do bloco continua barrada em terreno alheio (reusa teste de
  `place_block` existente, só troca o `blockId`).
- Compra: sucesso (estoque cai, pagamento entra — item ou Dimas conforme o
  tipo), falta de estoque, falta de pagamento, baú sem espaço pro pagamento
  (trilha item), item sem preço definido.
- Dimas sobrevive a desconexão/reconexão do CRIADOR (crédito enquanto
  offline) — mesmo padrão dos testes de `identity`/roster existentes.
- `use_block` numa loja NÃO roda `claimBloqueia` pra quem não é do terreno,
  mas `confinaBloqueia` continua valendo pra quem está confinado.

## Fora de escopo (YAGNI, por ora)

- Comando admin pra professor injetar Dimas depois do saldo inicial (o
  usuário escolheu "todo aluno nasce com valor fixo" como única fonte por
  ora — extensão natural, não pedida agora).
- Múltiplas lojas por jogador — sem limite desenhado, porque ninguém pediu
  limite; um limite viraria escopo novo se aparecer problema real de jogo.
- Fechar/pausar a loja sem desmontar — não pedido; o bloco existe ou não
  existe (quebrar o bloco quebra a loja, junto com o estoque dentro, igual
  qualquer container hoje).
