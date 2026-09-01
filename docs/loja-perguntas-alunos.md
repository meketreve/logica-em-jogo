# Loja nos baús — perguntas de design

Ideia: comando olhando pra um baú (baú e terreno do dono do comando) vira a
interface do baú numa interface de troca. Dono configura o que está à venda e
por quanto; o inventário do baú continua sendo o estoque.

Este arquivo junta as perguntas de design que ainda não foram fechadas — as
que o professor quer levar pra votação com a turma ficam marcadas.

## 🗳️ Pra votação com a turma

### 1. Comprador paga com o quê?

- **Item-por-item (troca direta)** — sem moeda nova. Dono escolhe "X do item A
  custam Y do item B". Comprador precisa ter o item B no inventário.
- **Moeda nova: "Dimas"** — NÃO é um item (não craftável, não ocupa slot do
  inventário/baú). É um saldo numérico — aparece só como um número mostrado no
  inventário do aluno, como vida/fome já aparecem. Todo aluno NASCE com uma
  quantidade fixa (decidido: sim, todo mundo entra com o mesmo valor inicial —
  falta só a turma decidir QUANTO). Pagar em Dimas debita do comprador e
  credita direto no vendedor (mesmo se ele estiver offline).
- **Recurso existente vira moeda de fato** — sem item novo; a turma combina
  que um recurso já existente (ferro, por exemplo) vale como dinheiro. Preço =
  quantidade daquele recurso, e o pagamento cai fisicamente dentro do baú
  junto do estoque (item de verdade, ocupa espaço).

Se a turma escolher Dimas: **quanto cada aluno recebe ao entrar pela primeira
vez?** (número pra votar/decidir.)

## ❓ Ainda em aberto (não é de votação — decisão de design)

