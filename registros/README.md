# registros/

Registro da **evolução do projeto** e das **aplicações em sala** — o que fica no
repositório como memória de longo prazo (fora do log técnico do OpenWolf em `.wolf/`).

## O que mora aqui

- **`perfilador-*.md`** — resumo AGREGADO dos testes de desempenho por versão do
  jogo. Os JSONs crus do perfilador (`profiles/`, `profiles-escola/`) são
  **gitignored** (não versionados) e podem conter dados de aparelho; aqui fica só
  a tabela agregada e ANÔNIMA (dispositivo/GPU/FPS por versão — sem nome de aluno).
  A partir da v0.9.0 a saída do perfilador já carrega o campo `versao` e não coleta
  mais nome de jogador (ver `.wolf/cerebrum.md`).
- **`prints/`** — capturas de tela dos testes/marcos (quando houver). As capturas
  headless de desenvolvimento saem em pasta temporária; as que valem como registro
  são copiadas pra cá manualmente.

## Como registrar um teste novo de perfilador

1. Rode o piloto, colete os JSONs (HUD F3 → "enviar pro servidor" → `profiles/`).
2. Agregue num `perfilador-vX.Y.Z-<contexto>.md` (dispositivo, GPU, FPS, frametime,
   tick do servidor). **Não** copie nome de aluno.
3. Apague os JSONs crus (ficam gitignored de qualquer forma).
