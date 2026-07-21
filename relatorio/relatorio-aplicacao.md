# Relatório de Aplicação — *Lógica em Jogo*

### Jogo voxel educacional para desenvolvimento do pensamento lógico / raciocínio computacional

> **ESQUELETO** — estrutura pronta, dados técnicos já preenchidos. Os campos marcados
> `✏️ PREENCHER` dependem de observação de sala / registros do professor (só o usuário
> tem). Ordem sugerida de escrita: 5 → 6 → 2 (resumo por último).

---

## Ficha de identificação

| Campo | Conteúdo |
|---|---|
| Título do projeto | Lógica em Jogo |
| Autor / responsável | ✏️ PREENCHER (nome, função) |
| Instituição | ✏️ PREENCHER (escola, rede estadual — SC) |
| Período de aplicação | ✏️ PREENCHER (datas — piloto aplicado até 2026-07-21) |
| Público | 2º ao 9º ano do Ensino Fundamental (turmas homogêneas, incl. AEE) |
| Nº de alunos | ✏️ PREENCHER (total; por turma na seção 5) |
| Área / componente | Pensamento computacional / raciocínio lógico (BNCC) |

---

## 1. Resumo

> ✏️ Escrever por ÚLTIMO (1 parágrafo, ~150 palavras): o quê, com quem, resultado
> principal. Rascunho de apoio: *"Este relatório apresenta a aplicação de Lógica em
> Jogo, um jogo sandbox voxel 3D próprio (engine e assets próprios, sem software
> licenciado), como ferramenta para desenvolver pensamento lógico e raciocínio
> computacional na rede estadual de SC. O jogo foi aplicado com alunos do 2º ao 9º ano,
> incluindo alunos do AEE, em atividades de sequência, depuração, representação e
> construção livre. Os resultados indicam [ENGAJAMENTO / DESEMPENHO], e a plataforma
> demonstrou escalabilidade técnica em rede local (até 12 participantes simultâneos, 60–90
> FPS em tablets, sem perda de sincronismo)."*

---

## 2. Introdução e justificativa

### 2.1 O problema pedagógico
- Pensamento computacional / raciocínio lógico na BNCC (Ensino Fundamental).
- Referenciais: **BNCC**, **ISTE/CSTA** (padrões de computação), **Jeannette Wing**
  (*computational thinking*: decomposição, reconhecimento de padrões, abstração,
  algoritmos).
- ✏️ PREENCHER: contexto da escola/rede — lacuna que motivou o projeto.

### 2.2 Por que um jogo próprio (e não Minecraft Education)
- Custo de licença / dependência de software não licenciado → barreira na rede pública.
- **Lógica em Jogo** = alternativa **gratuita e própria**: engine e assets autorais
  (nenhum código/asset de Minecraft/Eaglercraft), roda no navegador, servidor em rede
  local (LAN) — não exige internet nem conta paga.
- ✏️ PREENCHER: qualquer restrição institucional que reforce a escolha (rede, verba).

---

## 3. O jogo *Lógica em Jogo* — visão geral

- Sandbox **voxel 3D**, roda no **navegador**, multiplayer em **rede local**.
- **A pedagogia mora nos cenários, não no motor.** É uma *plataforma de autoria*:
  professor cria mundos + objetivos dentro do próprio jogo e distribui.
- Aluno entra por `http://IP-do-professor` → nome + PIN; cai automaticamente num grupo;
  vê enunciado e **contador ao vivo** (ex. `4/12`) que confere o estado da construção.
- Modo professor (código próprio): painel de autoria, comandos de chat, anti-griefing
  (claims/confinamento por grupo), trocar de aula sem derrubar a turma.
- ✏️ PREENCHER: 2–4 **screenshots** do jogo (mundo, atividade, contador, painel).

---

## 4. As atividades (cenários pedagógicos)

Seis aulas prontas + construção livre. Cada aula amarra um **pilar do pensamento
computacional** a uma tarefa concreta com correção automática (o contador).

| Aula | Título | Pilar do pensamento computacional | Tarefa |
|---|---|---|---|
| 1 | Continue a regra (3 fases) | Reconhecimento de padrão + generalização | Continuar sequência de cores de período crescente |
| 2 | Escreva 45 em binário | Abstração + representação | Acender bits (branco=0 / preto=1) |
| 3 | Ache os 2 erros | Depuração (testar hipótese) | Achar blocos que quebram a regra |
| 4 | Decifre a mensagem | Representação + decodificação | Cifra de César (`MPHJDB` → `LOGICA`) |
| 5 | Conserte o desenho | Decomposição + invariante (simetria) | Corrigir 4 células de um coração simétrico |
| 6 | Siga o manual | Seguir algoritmo (ordem e precisão) | Montar sala 3×3 seguindo 3 quadros-manual |
| — | Construção livre | Autonomia, criatividade, exploração | Construir livremente no mundo procedural |

> Detalhe completo de cada aula (regra, gabarito, condução) em `cenarios/README.md` →
> reproduzir no **Anexo C**.

---

## 5. Metodologia da aplicação

> ✏️ Núcleo do relatório — só o usuário tem estes dados.

### 5.1 Participantes
- Turmas atendidas: ✏️ PREENCHER (quais anos; nº de alunos por turma).
- **AEE (Atendimento Educacional Especializado):** ✏️ PREENCHER (nº de alunos, perfil
  geral sem identificar aluno, atividades aplicadas).
- Cobertura: piloto aplicado de forma **incremental, turma a turma** — todas as turmas.

### 5.2 Ambiente e infraestrutura
- Local: ✏️ PREENCHER (laboratório / sala).
- Rede: **LAN**, servidor no notebook do professor (host), alunos em **tablets e
  notebooks** da escola pelo navegador.
- Mundo usado: procedural (streaming), tamanho gigante (3840² × 128).

### 5.3 Procedimento
- ✏️ PREENCHER: duração de cada aula, quantas sessões, sequência das atividades.
- ✏️ PREENCHER: papel do professor (condução, mediação, fechamento).
- Indicadores observados (do projeto, seção 14):
  1. O grupo **enuncia a regra antes** de construir, ou vai por tentativa e erro?
  2. Quando o contador não sobe, o grupo **revisa a hipótese** ou continua chutando?
  3. **Divisão de trabalho** dentro do grupo (quem constrói, quem confere).
  4. Aula 3: busca **sistemática** (varrendo) ou aleatória?

---

## 6. Resultados

### 6.1 Desempenho por atividade
> ✏️ PREENCHER por aula (o que funcionou, dificuldades, tempo médio, % que fechou o
> contador). Tabela sugerida:

| Aula | Turma(s) | Fechou o objetivo? | Observações |
|---|---|---|---|
| 1 Sequência | ✏️ | ✏️ | ✏️ |
| 2 Binário | ✏️ | ✏️ | ✏️ |
| 3 Depurar | ✏️ | ✏️ | ✏️ |
| 4 Decifrar | ✏️ | ✏️ | ✏️ |
| 5 Simetria | ✏️ | ✏️ | ✏️ |
| 6 Manual | ✏️ | ✏️ | ✏️ |
| Construção livre | ✏️ | — | ✏️ |

### 6.2 Inclusão — alunos do AEE
- **Resultado observado:** alunos do AEE tiveram **bom desempenho** nas atividades de
  **sequência de cores** e **construção livre**.
- ✏️ PREENCHER: detalhar — nível de autonomia, mediação necessária, engajamento,
  comparação com outras ferramentas se houver.
- Ponto forte do projeto: **acessibilidade e inclusão** (interface simples, tarefa
  visual, correção imediata pelo contador).

### 6.3 Engajamento e observações qualitativas
- ✏️ PREENCHER: reação dos alunos, falas, disputa saudável entre grupos, pedidos de
  "mais uma aula", etc. (Citações diretas fortalecem o relatório.)

---

## 7. Resultados técnicos — desempenho e escalabilidade

Dados coletados **em campo**, na própria escola, pelo profiler embutido no jogo
(botão no HUD → envia ao servidor). 25 relatórios de dispositivos reais em
`profiles-escola/` (dados brutos no Anexo B).

**Teste multiplayer real:** mundo procedural 3840² × 128, **10 alunos + 2 professores
simultâneos** (12 clientes), **zero problema de sincronismo**.

| Dispositivo | FPS | Frametime médio | Tick do servidor (máx) |
|---|---|---|---|
| Tablet Android (Chrome) — aluno | 89–90 | ~11 ms | < 0,8 ms |
| Kindle Fire (Silk) — aluno | 60 | ~17 ms | 0,37 ms |
| Notebook host (Windows, servidor+cliente) | 37 | ~27 ms | 1,66 ms |

- **Servidor folgado em todos os clientes** (tick médio < 1 ms) → o desempenho **não**
  é limitado pela rede nem pelo servidor; escala bem para uma turma.
- Rede por cliente: 22–101 mensagens/s, 3–16 KB/s (leve — roda em LAN modesta).
- Tablets da escola rodam o **mundo gigante** a 60–90 FPS sem perda de sincronismo.
- O host é sempre o mais pesado (roda servidor **e** cliente); com máquina dedicada a
  servidor, todos os clientes ficam acima de 60 FPS.

---

## 8. Discussão e limitações

- ✏️ PREENCHER: o que mudaria numa próxima aplicação (tempo, agrupamento, ordem das
  aulas).
- Limitação técnica conhecida: ajustar o **raio de render** ao vivo pode fazer chunks
  não carregarem **no dispositivo que ajustou** — não afeta os demais nem o sincronismo.
- ✏️ PREENCHER: limitações de infra (nº de dispositivos, Wi-Fi, etc.).

---

## 9. Conclusão

- ✏️ PREENCHER: o projeto atingiu o objetivo de [desenvolver pensamento lógico via jogo
  próprio, gratuito, inclusivo]. Síntese do pedagógico + técnico. Próximos passos
  (expandir para mais escolas, novas aulas, etc.).

---

## Anexo A — Arquitetura técnica

- **Stack:** monorepo TypeScript (workspaces `shared` / `server` / `client`);
  render em **three.js**; rede em **WebSocket (ws)**; sem dependências pagas.
- **Servidor autoritativo:** toda mudança de mundo passa pelo servidor (anti-cheat,
  validação de física e alcance). Mesmo núcleo (`GameSession`) roda em Web Worker
  (singleplayer) e em Node (multiplayer).
- **Mundo por chunks + streaming:** mundo finito gigante (3840²) gerado em runtime por
  raio de interesse; save **esparso** (só chunks editados). Geração procedural com
  biomas brasileiros (caatinga, cerrado, mata, araucárias) e serras.
- **Ferramentas do professor:** autoria de cenários no jogo, grupos, objetivos com
  correção automática, anti-griefing (claims / confinamento por grupo), trocar de aula
  ao vivo, log de chat por mundo.
- **Qualidade:** ~278 testes automatizados, typecheck estrito, build verificado.
- ✏️ PREENCHER: diagrama de arquitetura (opcional).

## Anexo B — Dados de performance (brutos)

- 25 arquivos JSON em `profiles-escola/` (um por sessão de dispositivo).
- Campos: `fps`, `frametimeAvgMs`, `frametimeP95Ms`, `drawCalls`, `triangles`,
  `net.{msgsPerSec,bytesPerSec,tickAvgMs,tickMaxMs}`, `meta.worldChunks`, `userAgent`.
- ✏️ Opcional: gerar tabela/gráfico consolidado a partir desses JSON.

## Anexo C — Roteiros das aulas

- Reproduzir `cenarios/README.md` (regra, gabarito e condução das 6 aulas).

## Referências

- BNCC — Base Nacional Comum Curricular. ✏️ completar citação.
- ISTE / CSTA — padrões de pensamento computacional. ✏️ completar.
- WING, J. M. *Computational Thinking*. ✏️ completar (Comm. ACM, 2006).
- ✏️ Demais referências usadas.
