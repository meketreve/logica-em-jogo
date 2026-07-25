# Relatório de Aplicação — *Lógica em Jogo*

### Jogo voxel educacional para desenvolvimento do pensamento lógico / raciocínio computacional

> **RASCUNHO COMPLETO** — todas as seções redigidas (dados técnicos + observações de
> sala). Restam só refinos **opcionais**, marcados `✏️`: obs específicas das aulas 3 e 6,
> embutir os screenshots (§3) e o diagrama (Anexo A). Pronto para revisão.

\---

## Ficha de identificação

|Campo|Conteúdo|
|-|-|
|Título do projeto|Lógica em Jogo|
|Autor / responsável|Leonardo De Jesus Silvano|
|Instituição|E.E.B. Prof. Otília da Silva Berti (rede estadual — SC)|
|Período de aplicação|13/07/2026 - 20/07/2026|
|Público|2º ao 9º ano do Ensino Fundamental (turmas multisseriadas — 2 anos por turma, incl. AEE)|
|Nº de alunos|61; 15 alunos por turma|
|Área / componente|Pensamento computacional / raciocínio lógico (BNCC)|
|Versão do jogo|**v0.8.0** (2026-07-21)|

\---

## 1\. Resumo

Este relatório apresenta a aplicação de **Lógica em Jogo** — um jogo sandbox voxel 3D
**próprio** (engine e assets autorais, sem software licenciado) — como ferramenta para
desenvolver o **pensamento lógico e o raciocínio computacional**, na **E.E.B. Prof.
Otília da Silva Berti** (rede estadual de SC). O jogo foi aplicado com **61 alunos do 2º
ao 9º ano**, incluindo alunos do **AEE**, ao longo de **várias sessões** no laboratório
de informática, em atividades de **sequência, depuração, simetria e construção livre**
(as atividades de representação binária e de cifra de César não foram aplicadas por
exigirem conhecimento prévio ainda não desenvolvido). A **maioria dos grupos** alcançou os objetivos com
mediação pontual; o **engajamento foi alto** e a **inclusão dos alunos do AEE** foi
bem-sucedida. A atividade de sequência **revelou fragilidades no raciocínio lógico** de
parte da turma, evidenciando o **valor diagnóstico** do jogo. No plano técnico, a
plataforma demonstrou **escalabilidade** em rede local (**12 participantes simultâneos,
60–90 FPS em tablets, sem perda de sincronismo**), rodando **offline e sem licença
paga** — dentro da realidade da escola pública.

\---

## 2\. Introdução e justificativa

### 2.1 O problema pedagógico

* Pensamento computacional / raciocínio lógico na BNCC (Ensino Fundamental).
* Referenciais: **BNCC**, **ISTE/CSTA** (padrões de computação), **Jeannette Wing**
(*computational thinking*: decomposição, reconhecimento de padrões, abstração,
algoritmos).
* **Lacuna observada na escola** que motivou o projeto:
  * alunos **sem contato prévio** com lógica / pensamento algorítmico;
  * **engajamento baixo** com métodos tradicionais — o jogo prende mais a atenção;
  * **demanda de inclusão (AEE)** por uma ferramenta acessível e visual.
* **Objetivo transversal:** criar algo **interativo** que **qualquer professor**, de
  **qualquer componente curricular**, possa usar (a pedagogia mora nos cenários, não no
  motor — ver seção 3), e não só a área de computação.

### 2.2 Por que um jogo próprio (e não Minecraft Education)

* Custo de licença / dependência de software não licenciado → barreira na rede pública.
* **Lógica em Jogo** = alternativa **gratuita e própria**: engine e assets autorais
(nenhum código/asset de Minecraft/Eaglercraft), roda no navegador, servidor em rede
local (LAN) — não exige internet nem conta paga.
* **Restrições institucionais** que reforçam a escolha por um jogo próprio:
  * **sem verba** para licença de software pago (Minecraft Education inviável na rede pública);
  * **política da rede** contra instalar software de terceiro **não licenciado**.
* **Feito para a nossa realidade:** desenvolvido sob medida para o contexto da escola —
  dispositivos e infraestrutura locais, sem depender de internet nem de conta paga.

\---

## 3\. O jogo *Lógica em Jogo* — visão geral

* Sandbox **voxel 3D**, roda no **navegador**, multiplayer em **rede local**.
* **A pedagogia mora nos cenários, não no motor.** É uma *plataforma de autoria*:
professor cria mundos + objetivos dentro do próprio jogo e distribui.
* Aluno entra por `http://IP-do-professor` → nome + PIN; cai automaticamente num grupo;
vê enunciado e **contador ao vivo** (ex. `4/12`) que confere o estado da construção.
* Modo professor (código próprio): painel de autoria, comandos de chat, anti-griefing
(claims/confinamento por grupo), trocar de aula sem derrubar a turma.
* **Screenshots** prontos em `registros/prints/` (embutir 2–4 aqui): `01-menu.png`
(título + versão), `02-biomas.png` (mundo procedural — mata, ipê dourado, serra),
`03-agua.png` (cascata de água), `04-aula.png` (aula 1 — painel de objetivos `4/12` +
padrão no chão), `05-construcao.png` (sala mobiliada), `06-hud-f3.png` (perfilador).

### 3.1 Recursos de operação em sala e acessibilidade (v0.8.0)

Melhorias da versão 0.8.0 voltadas à **gestão da turma** e à **acessibilidade** — os
dois pontos que mais pesam numa aplicação real com muitos alunos e dispositivos variados:

* **Moderação da turma:** painel de jogadores do professor (tecla P) lista quem está
conectado, com **expulsar** e **banir por apelido** (o banido não reentra; há aba de
banidos com **desbanir**). Dá ao professor controle imediato sobre comportamento sem
precisar reiniciar o servidor.
* **Organização do espaço:** o **professor** passa a **reservar terreno** com `/claim`
(antes só o aluno) — pode delimitar áreas de trabalho da coluna à base do mundo.
* **Construção livre ampliada:** novo bloco de **água** com **mecânica de natação**
(o jogador entra na água, nada, sobe/desce) — mais possibilidades no mundo procedural.
* **Acessibilidade em tablet** (a escola usa tablets, incl. AEE): controles de toque
ganharam botão de **varinha** (marcar áreas sem teclado), botão de **agachar** e um
ajuste de **escala da interface** — botões maiores/menores conforme o tamanho da tela e
a coordenação motora do aluno. Reforça o ponto de inclusão da seção 6.2.

\---

## 4\. As atividades (cenários pedagógicos)

Seis aulas prontas + construção livre. Cada aula amarra um **pilar do pensamento
computacional** a uma tarefa concreta com correção automática (o contador).

|Aula|Título|Pilar do pensamento computacional|Tarefa|
|-|-|-|-|
|1|Continue a regra (3 fases)|Reconhecimento de padrão + generalização|Continuar sequência de cores de período crescente|
|2|Escreva 45 em binário|Abstração + representação|Acender bits (branco=0 / preto=1)|
|3|Ache os 2 erros|Depuração (testar hipótese)|Achar blocos que quebram a regra|
|4|Decifre a mensagem|Representação + decodificação|Cifra de César (`MPHJDB` → `LOGICA`)|
|5|Conserte o desenho|Decomposição + invariante (simetria)|Corrigir 4 células de um coração simétrico|
|6|Siga o manual|Seguir algoritmo (ordem e precisão)|Montar sala 3×3 seguindo 3 quadros-manual|
|—|Construção livre|Autonomia, criatividade, exploração|Construir livremente no mundo procedural|

> Detalhe completo de cada aula (regra, gabarito, condução) em `cenarios/README.md` →
> reproduzir no \*\*Anexo C\*\*.

> **Neste piloto** foram aplicadas as aulas **1, 3, 5 e 6** (mais a construção livre). As
> aulas **2 (binário)** e **4 (César)** ficaram de fora por exigirem conhecimento prévio —
> ver seções 6.1 e 8.

\---

## 5\. Metodologia da aplicação

> Núcleo do relatório — baseado na observação de sala do professor.

### 5.1 Participantes

* Turmas atendidas: **61 alunos** em **~4 turmas multisseriadas** de ~15, **cada uma
  juntando dois anos** (ex.: 2º/3º, 4º/5º, 6º/7º, 8º/9º), cobrindo do **2º ao 9º ano** do
  Ensino Fundamental.
* **AEE (Atendimento Educacional Especializado):** **3 a 5 alunos**, integrados às
  turmas regulares, participaram principalmente da **sequência de cores** (aula 1) e da
  **construção livre** (detalhe de resultado na seção 6.2).
* Cobertura: piloto aplicado de forma **incremental, turma a turma** — todas as turmas.

### 5.2 Ambiente e infraestrutura

* Local: **laboratório de informática** da escola.
* Rede: **LAN**, servidor no notebook do professor (host), alunos em **tablets e
notebooks** da escola pelo navegador.
* Mundo usado: procedural (streaming), tamanho gigante (3840² × 128).

### 5.3 Procedimento

* **Formato:** **várias sessões** por turma (não uma aula única) — o piloto foi aplicado
  de forma incremental, avançando pelas atividades ao longo de mais de um encontro,
  no ritmo de cada turma. ✏️ *ajustar se souber a duração/nº exato de sessões por turma.*
* **Papel do professor** (combinou as quatro formas de condução conforme a atividade):
  * **demonstra no projetor** a atividade antes da prática (enunciado + como o contador confere);
  * **explica a regra** e deixa os **grupos resolverem**;
  * **circula mediando grupo a grupo** quando algum empaca;
  * abre espaço pra **exploração livre** (construção livre no mundo procedural), intervindo só quando trava.
* Indicadores observados (critérios definidos no projeto pedagógico):

  1. O grupo **enuncia a regra antes** de construir, ou vai por tentativa e erro?
  2. Quando o contador não sobe, o grupo **revisa a hipótese** ou continua chutando?
  3. **Divisão de trabalho** dentro do grupo (quem constrói, quem confere).
  4. Aula 3: busca **sistemática** (varrendo) ou aleatória?

\---

## 6\. Resultados

### 6.1 Desempenho por atividade

No piloto foram aplicadas as **aulas 1, 3, 5 e 6** (mais a construção livre) em **todas
as turmas**. As aulas **2 (binário)** e **4 (cifra de César)** **não foram aplicadas**:
exigem **conhecimento prévio** (representação binária e cifragem) que os alunos ainda não
tinham — ficam para uma etapa mais avançada ou turmas mais adiantadas (ver seção 8).

Panorama geral: **a maioria dos grupos fechou o objetivo** (o contador ao vivo), em geral
**com mediação pontual** do professor. Um achado importante veio logo na **aula 1**: a
sequência de cores em **3 fases (período crescente)** custou bastante tempo a **vários
alunos** — o que evidenciou uma **fragilidade no raciocínio lógico** de parte da turma.
Longe de ser um problema da atividade, isso mostra o **valor diagnóstico** do jogo: ele
**expõe a lacuna** que o projeto se propõe a trabalhar.

|Aula|Aplicada?|Fechou o objetivo?|Observações|
|-|-|-|-|
|1 Sequência|Sim (todas)|Maioria, com tempo|3ª fase (período crescente) travou vários alunos → revelou fragilidade lógica (valor **diagnóstico** do jogo). Alegria visível ao completar.|
|2 Binário|**Não**|—|Não aplicada — exige pré-requisito (representação binária) que os alunos não tinham.|
|3 Depurar|Sim (todas)|Maioria, com mediação|Achar os 2 erros que quebram a regra. ✏️ *obs específicas da turma, se quiser.*|
|4 Decifrar|**Não**|—|Não aplicada — exige pré-requisito (cifra de César) que os alunos não tinham.|
|5 Simetria|Sim (todas)|Sim|**Uma das que mais fluíram** e que os alunos mais gostaram.|
|6 Manual|Sim (todas)|Maioria, com mediação|Montar a sala 3×3 seguindo os quadros. ✏️ *obs específicas da turma, se quiser.*|
|Construção livre|Sim (todas)|— (livre)|**Favorita unânime:** engajamento alto, cooperação e disputa saudável; alunos do AEE com bom desempenho.|

### 6.2 Inclusão — alunos do AEE

* **Participação:** **3 a 5 alunos** do AEE, integrados às turmas regulares.
* **Resultado observado:** tiveram **bom desempenho** nas atividades de **sequência de
  cores** (aula 1) e de **construção livre**.
* **Autonomia:** trabalharam com **autonomia na maior parte**, precisando de **mediação
  pontual** em momentos específicos — não de acompanhamento constante.
* **Fatores que favoreceram a inclusão:** **interface simples**, **tarefa visual** e
  **correção imediata pelo contador** (o aluno vê sozinho se acertou), além dos
  controles de toque ajustáveis (seção 3.1) — pontos que fazem da **acessibilidade** um
  dos diferenciais do projeto.

### 6.3 Engajamento e observações qualitativas

Engajamento **alto** em todas as turmas. Sinais observados:

* alunos **pediram "mais uma aula"** — quiseram continuar/repetir;
* **disputa saudável** entre grupos pra fechar o contador primeiro;
* **concentração alta** — silêncio produtivo, imersão na tarefa;
* **cooperação** — alunos **ajudaram uns aos outros**, ensinando os colegas.

**Reações observadas:** vários alunos expressaram **contentamento e satisfação** ao
completar a **sequência de cores** (aula 1) — a conquista era comemorada. E foi
**unânime a felicidade ao jogar de forma livre** (construção livre), quase sempre
seguida de um **grito de alegria**, sobretudo entre os menores.

O formato de jogo, com objetivo claro e retorno imediato, sustentou a atenção mesmo
nas atividades mais difíceis — contraste direto com o baixo engajamento dos métodos
tradicionais apontado na justificativa (seção 2.1).

\---

## 7\. Resultados técnicos — desempenho e escalabilidade

Dados coletados **em campo**, na própria escola, pelo profiler embutido no jogo
(botão no HUD → envia ao servidor). **52 relatórios** de dispositivos reais (22
tablets Android + 30 notebooks Windows); resumo agregado e **anônimo** em
`registros/perfilador-v0.8.0-escola.md` (Anexo B). Os JSON brutos foram **apagados
por privacidade** (continham apelidos de aluno) — o relatório usa só o agregado.

**Teste multiplayer real:** mundo procedural 3840² × 128, **10 alunos + 2 professores
simultâneos** (12 clientes), **zero problema de sincronismo**.

|Dispositivo|FPS|Frametime médio|Tick do servidor (máx)|
|-|-|-|-|
|Tablet Android (Chrome) — aluno|89–90|\~11 ms|< 0,8 ms|
|Kindle Fire (Silk) — aluno|60|\~17 ms|0,37 ms|
|Notebook host (Windows, servidor+cliente)|37|\~27 ms|1,66 ms|

* **Servidor folgado em todos os clientes** (tick médio < 1 ms) → o desempenho **não**
é limitado pela rede nem pelo servidor; escala bem para uma turma.
* Rede por cliente: 22–101 mensagens/s, 3–16 KB/s (leve — roda em LAN modesta).
* Tablets da escola rodam o **mundo gigante** a 60–90 FPS sem perda de sincronismo.
* O host é sempre o mais pesado (roda servidor **e** cliente); com máquina dedicada a
servidor, todos os clientes ficam acima de 60 FPS.

> \*\*Profiler ampliado (v0.8.0):\*\* os 52 relatórios acima foram coletados como \*retrato
> instantâneo\*. Na v0.8.0 o profiler passou a \*\*gravar 10 s\*\* e resumir a \*\*distribuição\*\*
> do frametime (mediana, p95, p99 e \*\*pior quadro\*\* = maior travada), além de contar
> \*frames\* lentos (> 50 ms) e medir \*\*memória, jitter de rede, colunas carregadas/fila de
> renderização, GPU e bateria\*\* do aparelho. Medições futuras ficam mais fiéis à
> experiência real (uma travada some numa média, mas aparece no p99/pior-quadro).

\---

## 8\. Discussão e limitações

* **Pré-requisitos e escalonamento:** as aulas **2 (binário)** e **4 (cifra de César)**
  **não puderam ser aplicadas** porque dependem de **conhecimento prévio** que os alunos
  ainda não tinham. Numa próxima aplicação, convém **preparar esse pré-requisito** antes
  (uma introdução a base binária / cifragem) ou **reservar essas atividades para turmas
  mais adiantadas**, montando uma **trilha do mais simples ao mais complexo**.
* **O que melhoraria numa próxima aplicação:**
  * **mais atividades / mais mundos** — ampliar o repertório de aulas prontas, dando
    mais opções por faixa etária e mais margem pra escalonar a dificuldade;
  * **reforçar o trabalho em grupo** entre os alunos — estruturar melhor a cooperação
    (papéis dentro do grupo, quem constrói / quem confere), aproveitando que a disputa
    saudável e a ajuda mútua já apareceram espontaneamente (seção 6.3).
* **Infraestrutura:** **nenhuma limitação relevante** — a rede local e os dispositivos
  da escola deram conta do mundo procedural com 12 participantes simultâneos, sem perda
  de sincronismo (dados na seção 7). Isso confirma que a plataforma cabe na realidade da
  escola pública sem exigir equipamento novo.
* **Limitação técnica conhecida** (menor): ajustar o **raio de render** ao vivo pode fazer
  chunks não carregarem **no próprio dispositivo que ajustou** — não afeta os demais nem
  o sincronismo da turma.

\---

## 9\. Conclusão

O projeto **atingiu seu objetivo**: usar um **jogo próprio, gratuito e inclusivo** para
desenvolver o **pensamento lógico / raciocínio computacional**, aplicado com **61 alunos**
do **2º ao 9º ano**, incluindo alunos do **AEE**.

* **No pedagógico:** a maioria dos grupos fechou os objetivos das atividades, com mediação
  pontual. Mais que corrigir, o jogo **diagnosticou** — a aula de sequência expôs a
  fragilidade lógica de parte da turma, exatamente a lacuna que o projeto se propõe a
  trabalhar. O **engajamento foi alto** (pedidos de "mais uma aula", disputa saudável,
  cooperação), e a **inclusão do AEE** funcionou (bom desempenho com mediação pontual,
  favorecida pela interface visual e correção imediata).
* **No técnico:** a plataforma **escalou** para 12 participantes simultâneos no mundo
  procedural, a 60–90 FPS nos tablets, **sem perda de sincronismo** e **sem exigir
  infraestrutura nova** — cabe na realidade da escola pública, rodando em LAN, offline e
  sem licença paga.
* **Próximos passos:** ampliar o repertório de **atividades e mundos**, **estruturar
  melhor o trabalho em grupo**, e **expandir a aplicação** para mais turmas e outras
  escolas da rede. Por ser uma **plataforma de autoria**, qualquer professor — de
  qualquer componente — pode criar novos cenários e reaproveitar o motor.

\---

## Anexo A — Arquitetura técnica

* **Stack:** monorepo TypeScript (workspaces `shared` / `server` / `client`);
render em **three.js**; rede em **WebSocket (ws)**; sem dependências pagas.
* **Servidor autoritativo:** toda mudança de mundo passa pelo servidor (anti-cheat,
validação de física e alcance). Mesmo núcleo (`GameSession`) roda em Web Worker
(singleplayer) e em Node (multiplayer).
* **Mundo por chunks + streaming:** mundo finito gigante (3840²) gerado em runtime por
raio de interesse; save **esparso** (só chunks editados). Geração procedural com
biomas brasileiros (caatinga, cerrado, mata, araucárias) e serras. Blocos autorais
(grama, pedra, lãs, letras/números, móveis, flores, minérios e **água** com natação).
* **Ferramentas do professor:** autoria de cenários no jogo, grupos, objetivos com
correção automática, anti-griefing (claims / confinamento por grupo — professor também
reserva terreno), **painel de jogadores** (expulsar / banir / desbanir por apelido),
trocar de aula ao vivo, log de chat por mundo.
* **Acessibilidade:** roda em navegador em notebooks e **tablets**; controles de toque com
joystick, botões de ação (incl. varinha e agachar) e **escala de UI ajustável**.
* **Instrumentação:** profiler embutido (HUD) grava 10 s e envia relatório agregado ao
servidor — frametime (mediana/p95/p99/pior), memória, jitter de rede, GPU e dispositivo.
* **Qualidade:** 304 testes automatizados, typecheck estrito, build verificado.
* ✏️ PREENCHER: diagrama de arquitetura (opcional).

## Anexo B — Dados de performance (agregado anônimo)

* **52 perfis** coletados no piloto (22 Android da escola + 30 notebooks Windows),
resumidos e **anonimizados** em `registros/perfilador-v0.8.0-escola.md` — tabela por
dispositivo (GPU, núcleos, FPS, frametime médio/p95, draw calls, tick do servidor).
* Panorama: **FPS 25–90** (mediana 60; tablets Android no topo, 90 FPS); **tick do
servidor 0,034–5,324 ms** (folgado em todos → sem gargalo de sincronia com a turma).
O caso de 25 FPS é o notebook-host (servidor + cliente + ajuste de raio de chunks ao vivo).
* Os JSON crus (formato *retrato instantâneo*: `fps`, `frametimeAvgMs`, `frametimeP95Ms`,
`drawCalls`, `net.{msgsPerSec,bytesPerSec,tickAvgMs,tickMaxMs}`, `userAgent`) foram
**apagados por privacidade** (traziam apelido de aluno) — só o agregado anônimo sobrevive.
* Formato v0.8.0 (gravação de 10 s) para próximas medições: `gravacao.frametimeMs.{p50,p95, p99,max}`, `gravacao.framesLentos50ms`, `gravacao.longTasks`, `gravacao.memoriaMB`,
`net.jitterMs`, `stream.{colunas,fila}`, `dispositivo.{nucleos,ramGB,gpu,bateria}`.

## Anexo C — Roteiros das aulas

* Reproduzir `cenarios/README.md` (regra, gabarito e condução das 6 aulas).

## Referências

* BRASIL. Ministério da Educação. **Base Nacional Comum Curricular (BNCC)**. Brasília:
  MEC, 2018. Disponível em: <http://basenacionalcomum.mec.gov.br>.
* WING, Jeannette M. **Computational Thinking**. *Communications of the ACM*, v. 49,
  n. 3, p. 33–35, mar. 2006.
* ISTE — International Society for Technology in Education; CSTA — Computer Science
  Teachers Association. **Operational Definition of Computational Thinking for K–12
  Education**. 2011.
* BRASIL. Ministério da Educação. **Diretrizes Nacionais para a Educação Especial na
  Educação Básica** (referência do AEE). ✏️ *confirmar/ajustar conforme o material usado.*
* ✏️ *Demais referências que você citar (formatar em ABNT conforme a norma da escola).*

