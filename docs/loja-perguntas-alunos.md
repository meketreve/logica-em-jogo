# Loja nos baús — perguntas de design

Ideia: comando olhando pra um baú (baú e terreno do dono do comando) vira a
interface do baú numa interface de troca. Dono configura o que está à venda e
por quanto; o inventário do baú continua sendo o estoque.

Este arquivo junta as perguntas de design que ainda não foram fechadas — as
que o professor quer levar pra votação com a turma ficam marcadas.

## ✅ Decidido (2026-09-02) — não é mais votação

**Comprador paga com o quê? "Dimas", sempre.** NÃO é um item (não craftável,
não ocupa slot do inventário/baú) — "Dimas" não é apelido de "Diamante"
(minério do jogo), é uma moeda de troca digital própria. É um saldo
numérico — aparece só como um número mostrado no inventário do aluno, como
vida/fome já aparecem. Todo aluno NASCE com uma quantidade fixa. Pagar em
Dimas debita do comprador e credita direto no vendedor (mesmo se ele estiver
offline). As opções de item-por-item e recurso-existente-como-moeda que
estavam em votação foram descartadas — a arquitetura foi construída pra
suportar as três, mas só uma entrou no jogo.

## 🗳️ Pra votação com a turma

### 1. Quanto cada aluno recebe de Dimas ao entrar pela primeira vez?

Número pra votar/decidir. Hoje o padrão no código é 50 (constante
`DIMAS_INICIAL_PADRAO`, ajustável pelo host sem mexer em código via
`LJ_DIMAS_INICIAL`).

## ❓ Ainda em aberto (não é de votação — decisão de design)

