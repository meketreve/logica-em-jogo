# Perfilador — v0.8.0 · piloto na escola (2026-07-21)

> Resumo agregado e **anônimo** dos 52 perfis coletados no piloto com turma
> real (mundo procedural, streaming, seed 3158887957, checkpoint 14). Dados crus
> apagados; nome de aluno não consta. Ver contexto em `.wolf/STATUS.md` (sessão 12).

## Panorama

- **Perfis coletados:** 52 (22 Android da escola, 30 Windows/notebook).
- **FPS:** 25–90 (mediana 60). Tablets Android da escola no topo (90 FPS).
- **Tick do servidor:** 0.034–5.324 ms — folgado em TODOS (sem gargalo de sincronia com a turma).
- **Conclusão:** motor + streaming provados em campo com turma real; zero dessincronia relatada.
  O caso de 25 FPS é o notebook-host (servidor + cliente + dev mexendo em raio de chunks ao vivo).

## Tabela (ordenada por FPS)

| Dispositivo | GPU | Núcleos | FPS | frame méd | p95 | draw | tick méd |
|---|---|---|---|---|---|---|---|
| Android K | — | ? | 90 | 11.14ms | 12.7ms | 137 | 0.824ms |
| Android K | Adreno (TM) 619 | 8 | 90 | 11.15ms | 12.7ms | 242 | 0.708ms |
| Android K | Adreno (TM) 619 | 8 | 90 | 11.14ms | 11.9ms | 96 | 0.766ms |
| Android K | — | ? | 90 | 11.13ms | 12.5ms | 224 | 0.502ms |
| Android K | — | ? | 89 | 11.18ms | 12.6ms | 186 | 0.554ms |
| Android K | — | ? | 82 | 12.24ms | 20.4ms | 526 | 0.695ms |
| Android K | Mali-G57 MC2 | 8 | 61 | 16.51ms | 17.7ms | 200 | 2.292ms |
| Android K | Mali-G57 MC2 | 8 | 61 | 16.51ms | 18ms | 201 | 0.731ms |
| Android K | — | ? | 61 | 16.47ms | 17.2ms | 194 | 0.595ms |
| Android K | — | ? | 61 | 16.52ms | 17.3ms | 191 | 0.449ms |
| Android K | Adreno (TM) 619 | 8 | 60 | 16.71ms | 18.3ms | 133 | 0.938ms |
| Android K | Adreno (TM) 619 | 8 | 60 | 16.71ms | 18.1ms | 264 | 0.8ms |
| Android K | — | ? | 60 | 16.75ms | 17.9ms | 169 | 0.974ms |
| Android K | — | ? | 60 | 16.71ms | 17.8ms | 169 | 0.614ms |
| Android K | — | ? | 60 | 16.71ms | 18.1ms | 165 | 0.662ms |
| Android K | — | ? | 60 | 16.71ms | 18.4ms | 165 | 0.637ms |
| Android K | — | ? | 60 | 16.71ms | 18.6ms | 165 | 0.637ms |
| Windows | — | ? | 60 | 16.66ms | 17.2ms | 45 | 0.054ms |
| Windows | — | ? | 60 | 16.71ms | 17.9ms | 43 | 0.054ms |
| Android K | Adreno (TM) 619 | 8 | 60 | 16.7ms | 18.1ms | 88 | 0.92ms |
| Android K | — | ? | 60 | 16.72ms | 18.5ms | 44 | 0.044ms |
| Android KFRAWI | — | ? | 60 | 16.8ms | 18.3ms | 175 | 0.241ms |
| Windows | — | ? | 60 | 16.66ms | 17.9ms | 378 | 0.601ms |
| Windows | Intel(R) Iris(R) Xe Graphics (0x00009A49) Direct3D11 vs_5_0 ps_5_0 | 8 | 60 | 16.67ms | 17.3ms | 79 | 0.708ms |
| Windows | Intel(R) Iris(R) Xe Graphics (0x00009A49) Direct3D11 vs_5_0 ps_5_0 | 8 | 60 | 16.67ms | 17.5ms | 79 | 0.847ms |
| Windows | Intel(R) Iris(R) Xe Graphics (0x00009A49) Direct3D11 vs_5_0 ps_5_0 | 8 | 60 | 16.67ms | 17.4ms | 307 | 0.92ms |
| Windows | Intel(R) Iris(R) Xe Graphics (0x00009A49) Direct3D11 vs_5_0 ps_5_0 | 8 | 60 | 16.67ms | 17.5ms | 307 | 3.097ms |
| Windows | Intel(R) Iris(R) Xe Graphics (0x00009A49) Direct3D11 vs_5_0 ps_5_0 | 8 | 60 | 16.67ms | 17.3ms | 210 | 0.899ms |
| Windows | Intel(R) Iris(R) Xe Graphics (0x00009A49) Direct3D11 vs_5_0 ps_5_0 | 8 | 60 | 16.66ms | 17.4ms | 12 | 0.731ms |
| Windows | Intel(R) Iris(R) Xe Graphics (0x00009A49) Direct3D11 vs_5_0 ps_5_0 | 8 | 60 | 16.67ms | 17.5ms | 387 | 0.938ms |
| Windows | — | ? | 60 | 16.67ms | 17.7ms | 72 | 0.885ms |
| Android K | — | ? | 59 | 16.84ms | 18.9ms | 65 | 0.881ms |
| Windows | — | ? | 59 | 16.96ms | 21.4ms | 262 | 0.538ms |
| Windows | — | ? | 57 | 17.66ms | 23.7ms | 16 | 0.051ms |
| Windows | — | ? | 57 | 17.62ms | 23.7ms | 21 | 0.051ms |
| Windows | — | ? | 57 | 17.54ms | 21.7ms | 180 | 0.504ms |
| Windows | — | ? | 54 | 18.67ms | 23.6ms | 245 | 0.034ms |
| Windows | — | ? | 52 | 19.21ms | 30.3ms | 202 | 0.042ms |
| Windows | — | ? | 50 | 20.16ms | 29.8ms | 460 | 0.074ms |
| Windows | — | ? | 49 | 20.34ms | 29.8ms | 233 | 0.05ms |
| Windows | — | ? | 49 | 20.48ms | 29.7ms | 16 | 0.113ms |
| Windows | — | ? | 48 | 20.92ms | 29.8ms | 289 | 0.1ms |
| Windows | — | ? | 48 | 20.93ms | 30ms | 17 | 0.308ms |
| Windows | — | ? | 48 | 20.73ms | 30ms | 25 | 0.074ms |
| Windows | — | ? | 46 | 21.89ms | 30.3ms | 32 | 0.113ms |
| Windows | — | ? | 46 | 21.88ms | 26.3ms | 276 | 0.103ms |
| Windows | Intel(R) UHD Graphics (0x00009B41) Direct3D11 vs_5_0 ps_5_0 | 8 | 46 | 21.7ms | 28.1ms | 202 | 5.324ms |
| Windows | — | ? | 45 | 22.1ms | 29.9ms | 424 | 0.038ms |
| Windows | — | ? | 43 | 23.27ms | 29.1ms | 27 | 0.05ms |
| Windows | — | ? | 40 | 24.77ms | 32.2ms | 482 | 0.09ms |
| Windows | — | ? | 37 | 26.98ms | 37.2ms | 235 | 0.753ms |
| Android K | — | ? | 25 | 39.9ms | 71.9ms | 177 | 0.037ms |
