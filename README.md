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
| **Git — *não* precisa** | o launcher se atualiza sozinho sem ele (veja [Atualizar](#atualizar)) |

### Baixar

Na página do projeto no GitHub: **Code → Download ZIP**, e descompacte onde quiser (o
Desktop serve). Não precisa de git, nem de conta, nem de linha de comando — e a partir daí o
próprio launcher se mantém atualizado (veja [Atualizar](#atualizar)).

Quem desenvolve pode clonar (`git clone`) em vez disso: o launcher reconhece a pasta e usa o
git para atualizar.

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

O launcher **procura atualização antes de subir** e pergunta se quer aplicar (Enter = sim).
**Isso funciona mesmo sem git** — que é o caso da escola, onde a pasta veio de um ZIP baixado
do GitHub. Ele escolhe o caminho **pela própria pasta**:

**Se a pasta NÃO tem `.git`** (baixou o ZIP/tar.gz) — o caminho normal na escola:

- baixa o pacote do GitHub e copia por cima, sem instalar nada: no Windows usa o `curl.exe` e
  o `tar.exe` que já vêm no Windows 10 (1803+) e no 11, **sem PowerShell**, que é justamente o
  que a rede da escola costuma bloquear; no Linux/macOS usa `curl` e `tar`;
- a versão instalada fica gravada no arquivo `.lj-versao`. Na primeira vez ele não existe: o
  launcher avisa e baixa uma vez para acertar o marco;
- copia **por cima, sem apagar** o que é só seu (`mundos/`, `node_modules/`, `.env`, um `.ljw`
  exportado solto na pasta);
- se o pacote trouxer arquivos para `mundos/`, ele **pergunta antes**, e o padrão é **não
  sobrescrever** os mundos da turma;
- ao terminar, diz o que mudou em número de versão: *"Atualizado da versão 0.9.0 para a
  1.0.0"* — ou *"continua na versão 0.9.0, com as correções mais novas"* quando o conserto veio
  dentro da mesma versão;
- o `client/dist` é versionado, então o cliente vem **pronto no pacote**: não se compila nada.

> ⚠️ Um `.git` **sobrando** na pasta (clone antigo, ou um ZIP extraído por cima de um) **não
> desliga mais nada**: se o git não estiver instalado, ou o `.git` estiver quebrado, ou não
> houver o remoto `origin`, o launcher segue pelo pacote **e diz por quê**. Para forçar um
> caminho: `LJ_UPDATE=pacote` ou `LJ_UPDATE=git` (no Windows, `set LJ_UPDATE=pacote` antes de
> abrir o launcher).

**Se a pasta veio de um `git clone` que funciona** (quem desenvolve) — o launcher usa o git:

- só atualiza no branch `main`, e só por *fast-forward* (nunca cria merge na máquina da escola);
- se houver mudança local nos arquivos que a atualização mexe, ele **pergunta** e guarda no
  `git stash` (nada é apagado; volta com `git stash pop`);
- copiar por cima aqui seria pisar no trabalho de quem desenvolve — por isso o caminho é outro.

**Nos dois casos:**

- sem rede, ou sem as ferramentas necessárias, ele avisa e segue com a versão instalada — a
  aula **não trava**;
- `LJ_SEM_UPDATE=1` desliga a checagem (útil no dia da aula);
- os mundos da turma ficam em `mundos/`, que o git ignora: atualizar **não** mexe nos saves.

> ⚠️ Só a máquina que **hospeda** precisa atualizar. O aluno abre o navegador e recebe o
> cliente desse servidor — não há nada instalado no tablet dele.

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

## Autoria e licença

Desenvolvido por **Leonardo De Jesus Silvano** — E.E.B. Prof. Otília da Silva Berti, rede
estadual de ensino de Santa Catarina.

**Uso livre em escola; modificação do código passa pelo autor.** Em resumo
([licença completa](LICENSE)):

| Pode, sem pedir | Precisa de autorização escrita |
|-|-|
| Usar e rodar em **qualquer instituição de ensino**, quantos alunos quiser | **Distribuir versão modificada** do código ou obra derivada |
| **Redistribuir o projeto inalterado**, de graça, para outras escolas e redes | Republicar **sob outro nome** ou sem a autoria |
| Estudar, pesquisar, apresentar em oficina/formação (citando a autoria) | **Uso comercial** (vender, licenciar, serviço pago) |
| **Criar e distribuir seus cenários e mundos** — o cenário é seu | |
| **Modificar a sua própria cópia** para testar ou adaptar na sua escola | |

Escola privada usando como ferramenta de ensino **não** é uso comercial — está liberado.
Melhoria é bem-vinda por *issue* ou *pull request*; a licença existe para manter uma versão
de referência confiável para as escolas que dependem dela, não para travar contribuição.

> ℹ️ Esta é uma licença **source-available**, não open source aprovada pela OSI — o GitHub
> vai mostrar "licença não reconhecida". É consequência esperada da regra de modificação.
