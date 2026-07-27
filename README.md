# Lógica em Jogo

Jogo sandbox **voxel 3D** feito para desenvolver **pensamento lógico e raciocínio
computacional** no Ensino Fundamental. Roda **no navegador**, em **rede local**, com a turma
inteira junta — **sem internet, sem instalação no dispositivo do aluno e sem licença paga**.

Engine, texturas e cenários são **autorais**: não há código nem asset de Minecraft,
Eaglercraft ou qualquer software não licenciado. O projeto nasceu numa escola da rede
estadual de Santa Catarina como alternativa gratuita e própria ao Minecraft Education, que é
inviável na rede pública por custo de licença e por política de software.

**A pedagogia mora nos cenários, não no motor.** O jogo é uma plataforma de autoria: o
professor cria o mundo e os objetivos **dentro do próprio jogo**, sem programar, e distribui
o resultado como um arquivo `.ljw`. Um motor, muitas aulas — de qualquer componente
curricular.

---

## Para o professor: usar em aula

### O que precisa

| | |
|-|-|
| **Um notebook** | é ele que hospeda a aula (pode ser o do professor) |
| **[Node.js](https://nodejs.org) 20 ou mais novo** | só na máquina que hospeda |
| **Rede local** | o roteador do laboratório basta — **internet não é necessária** |
| **Navegador nos dispositivos dos alunos** | tablets e notebooks entram por um endereço |
| **[Git](https://git-scm.com) (opcional)** | só para o launcher se atualizar sozinho |

### Rodar

Duplo clique no launcher, na pasta do projeto:

- **Windows:** `iniciar-servidor.bat`
- **Linux / macOS / WSL:** `./iniciar-servidor.sh` (na primeira vez: `chmod +x iniciar-servidor.sh`)

O launcher pergunta o que precisa (qual mundo, código de professor, tamanho) e sobe o
servidor. Na primeira execução ele instala as dependências — isso demora alguns minutos.
Para parar: feche a janela ou `Ctrl+C`.

### Como o aluno entra

O endereço aparece no console quando o servidor sobe, mais ou menos assim:

```
http://192.168.0.10:8080
```

O aluno abre esse endereço no navegador, digita **apelido + PIN de 4 dígitos** (criados na
hora, na primeira entrada) e já está no mundo, dentro de um grupo. Não há cadastro, conta ou
senha de serviço nenhum.

O **professor** entra com o **código de professor** (o launcher pergunta; se você não
definir, o servidor gera um e imprime no console em todo boot). O código libera o painel de
autoria, os comandos de chat, os grupos e a moderação da turma.

### Atualizar

Se a pasta veio de um `git clone` e o git está instalado, o launcher **procura atualização
antes de subir** e pergunta se quer aplicar (Enter = sim). Ele se cuida sozinho:

- só atualiza no branch `main`, e só por *fast-forward* (nunca cria merge na máquina da escola);
- **não** atualiza se houver mudança local no código — seu trabalho não se perde;
- sem rede, sem git ou fora de um clone, ele avisa e segue com a versão instalada;
- `LJ_SEM_UPDATE=1` desliga a checagem (útil no dia da aula).

Os mundos da turma ficam em `mundos/`, que o git ignora: atualizar **não** mexe nos saves.

---

## As aulas

Seis aulas prontas em `cenarios/`, mais construção livre. Cada uma amarra um pilar do
pensamento computacional a uma tarefa concreta com **correção automática** — o aluno vê um
contador ao vivo (`4/12`) e descobre sozinho se acertou.

| # | Aula | Pilar | Tarefa |
|-|-|-|-|
| 1 | Continue a regra | Padrão + generalização | Continuar a sequência de cores |
| 2 | Escreva 45 em binário | Abstração + representação | Acender bits (branco 0 / preto 1) |
| 3 | Ache os 2 erros | Depuração | Achar os blocos que quebram a regra |
| 4 | Decifre a mensagem | Representação + decodificação | Cifra de César |
| 5 | Conserte o desenho | Decomposição + invariante | Corrigir um desenho simétrico |
| 6 | Siga o manual | Executar algoritmo | Montar a sala seguindo os quadros |
| — | Construção livre | Autonomia e criatividade | Construir no mundo aberto |

Roteiro de condução de cada aula (regra, gabarito, o que observar) em
[`cenarios/README.md`](cenarios/README.md). Os `.ljw` são gerados por script — mexeu no
gerador, rode `npm run cenarios` e commite os arquivos novos.

O professor também cria cenários próprios no jogo: marcar região com a varinha, fotografar
um gabarito, criar objetivos, montar grupos e carimbar uma área de trabalho por grupo.

---

## Para quem quer mexer no código

Monorepo TypeScript com três workspaces e uma regra dura: **quem decide o estado do mundo é
o servidor**.

```
shared/   lógica autoritativa (mundo, blocos, física, tick, regras, save, protocolo).
          TS puro, zero dependência de navegador ou de Node — roda igual nos 3 hospedeiros.
server/   embrulha o shared: Web Worker (singleplayer) ou Node + ws (rede local).
client/   three.js. Só desenha e manda input. Nunca decide estado.
cenarios/ as 6 aulas (.ljw) + o roteiro de condução.
scripts/  smoke de rede real e benchmark headless.
```

O mesmo núcleo (`GameSession`) roda no Web Worker do singleplayer e no servidor Node da
rede local — o cliente não sabe qual hospedeiro está do outro lado.

```bash
npm install
npm run dev          # cliente em modo dev (Vite, http://localhost:5173)
npm run dev:server   # servidor Node + ws (serve o cliente COMPILADO na porta 8080)
npm test             # testes do shared (vitest)
npm run typecheck    # tsc --noEmit nos 3 workspaces
npm run build        # build de produção do cliente
npm run verify       # typecheck + testes + build — o portão antes de commitar
npm run smoke        # cenários de rede reais (`-- --lista` diz o que cada um prova)
```

`client/dist` é **versionado** de propósito: a escola atualiza e joga sem precisar compilar.
Mudou o cliente? Rode `npm run build` e commite o `dist` junto.

Ferramentas de medição embutidas: **F3** abre o HUD com FPS, frametime (p50/p95/p99), draw
calls, rede e tick do servidor, e exporta o perfil em JSON. `?bench` roda um trajeto fixo de
30 s e exporta sozinho — é assim que dois computadores diferentes ficam comparáveis.

---

## Privacidade

Os mundos, os saves e o log de conversa **ficam na máquina da escola**. Não há nuvem, conta
ou telemetria: o servidor só fala com os navegadores da rede local. O aluno usa apelido e um
PIN de 4 dígitos, criados por ele na primeira entrada — o PIN existe para um aluno não entrar
com o apelido do outro, não para identificar ninguém.

Os dados de desempenho coletados durante o piloto foram **anonimizados**; os arquivos crus
(que traziam apelidos) foram apagados, e só o resumo agregado ficou no repositório.

---

## Autoria

Desenvolvido por **Leonardo De Jesus Silvano** — E.E.B. Prof. Otília da Silva Berti, rede
estadual de ensino de Santa Catarina.

⚖️ **Licença ainda não definida.** Sem um arquivo `LICENSE`, valem os direitos autorais
padrão (todos os direitos reservados): outra escola pode ler o código, mas ainda não há
permissão formal de uso ou redistribuição. Quer liberar para a rede? Abra uma issue ou fale
com o autor.
