#!/usr/bin/env node
/**
 * §🔊 Sons v2 — prepara as AMOSTRAS (2026-11-03).
 *
 * Os OGG de `client/public/sons/` NÃO são editados à mão: saem daqui, de uma
 * tabela que diz DE ONDE veio cada arquivo (pacote, arquivo original, página,
 * autor, licença) e QUE PEDAÇO dele se usa. Rodar de novo refaz tudo igual —
 * e o `CREDITOS.md` da pasta sai da MESMA tabela, então origem e arquivo não
 * descolam.
 *
 *   node scripts/preparar-sons.mjs [pasta-de-cache]
 *
 * Precisa de `ffmpeg` (com libvorbis) e `unzip` no PATH, e de rede pra
 * opengameart.org e bigsoundbank.com na 1ª vez (o cache guarda o baixado).
 * kenney.nl responde 403 a cliente que não é navegador — o RPG Audio do
 * Kenney vem da página OFICIAL dele no OpenGameArt (mesmo zip, CC0).
 *
 * Tratamento de cada amostra (o tablet é a régua):
 *  - mono, 44,1 kHz, Vorbis q0 (~48–64 kbps) — o som sai num alto-falante de
 *    tablet; estéreo e taxa alta só custam download e RAM;
 *  - corte no trecho útil (`ini`/`dur`) + fade de 4 ms na entrada e 25 ms na
 *    saída (corte seco estala);
 *  - VOLUME IGUALADO: o trecho é levado a −20 dBFS de média (volumedetect),
 *    limitado a pico −3 dBFS. Assim os takes de um conjunto soam do mesmo
 *    tamanho e o ganho de cada USO fica no código (`sonsAmostras.ts`).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = join(RAIZ, "client/public/sons");
const CACHE = process.argv[2] ?? join(tmpdir(), "lj-sons-cache");

/** Os pacotes (zip) e de onde vêm. */
const PACOTES = {
  kenney: {
    nome: "RPG Audio — Kenney (Kenney Vleugels)",
    pagina: "https://opengameart.org/content/50-rpg-sound-effects",
    zip: "https://opengameart.org/sites/default/files/RPGsounds_Kenney.zip",
    pasta: "OGG",
    licenca: "CC0 1.0",
  },
  rubberduck: {
    nome: "75 CC0 breaking / falling / hit sfx — rubberduck",
    pagina: "https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx",
    zip: "https://opengameart.org/sites/default/files/sfx_breaking_and_falling.zip",
    pasta: "",
    licenca: "CC0 1.0",
  },
  tinyworlds: {
    nome: "Different steps on wood, stone, leaves, gravel and mud — TinyWorlds",
    pagina: "https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud",
    zip: "https://opengameart.org/sites/default/files/%5Bkdd%5DDifferentSteps_0.zip",
    pasta: "",
    licenca: "CC0 1.0",
  },
};

/** BigSoundBank (Joseph Sardin): um arquivo por página, licença CONFERIDA na
 *  página de cada um ("License CC0 (public domain)") em 2026-11-03. */
const bsb = (id, slug) => ({
  bsb: id,
  pagina: `https://bigsoundbank.com/${slug}-s${id}.html`,
  url: `https://bigsoundbank.com/UPLOAD/ogg/${id}.ogg`,
});

/**
 * conjunto → takes. Cada take: origem + trecho (s). A ORDEM dos conjuntos e
 * dos takes vira o nome do arquivo (`<conjunto>-<n>.ogg`).
 */
const CONJUNTOS = {
  // ---- passos (o mesmo conjunto serve ao COLOCAR de material mole)
  "passo-pedra": [
    { p: "kenney", a: "footstep00.ogg", ini: 0, dur: 0.2 },
    { p: "kenney", a: "footstep01.ogg", ini: 0, dur: 0.22 },
    { p: "kenney", a: "footstep07.ogg", ini: 0, dur: 0.18 },
  ],
  "passo-madeira": [
    { p: "tinyworlds", a: "wood01.ogg", ini: 0, dur: 0.24 },
    { p: "tinyworlds", a: "wood02.ogg", ini: 0, dur: 0.24 },
    { p: "tinyworlds", a: "wood03.ogg", ini: 0, dur: 0.3 },
  ],
  "passo-terra": [
    { p: "kenney", a: "footstep04.ogg", ini: 0, dur: 0.28 },
    { p: "kenney", a: "footstep05.ogg", ini: 0, dur: 0.18 },
    { p: "kenney", a: "footstep06.ogg", ini: 0, dur: 0.18 },
  ],
  "passo-planta": [
    { p: "tinyworlds", a: "leaves01.ogg", ini: 0, dur: 0.3 },
    { p: "tinyworlds", a: "leaves02.ogg", ini: 0, dur: 0.3 },
  ],
  // ---- golpe da ferramenta (e o COLOCAR de material duro)
  "golpe-pedra": [
    { p: "rubberduck", a: "bfh1_rock_hit_01.ogg", ini: 0, dur: 0.1 },
    { p: "rubberduck", a: "bfh1_rock_falling_04.ogg", ini: 0, dur: 0.16 },
    { p: "rubberduck", a: "bfh1_rock_falling_07.ogg", ini: 0, dur: 0.16 },
  ],
  "golpe-madeira": [
    { p: "rubberduck", a: "bfh1_wood_hit_01.ogg", ini: 0, dur: 0.12 },
    { p: "rubberduck", a: "bfh1_wood_hit_03.ogg", ini: 0, dur: 0.17 },
    { p: "kenney", a: "chop.ogg", ini: 0.03, dur: 0.13 },
  ],
  "golpe-vidro": [
    { p: "rubberduck", a: "bfh1_glass_hit_01.ogg", ini: 0, dur: 0.18 },
    { p: "rubberduck", a: "bfh1_glass_hit_02.ogg", ini: 0, dur: 0.2 },
  ],
  "golpe-metal": [
    { p: "rubberduck", a: "bfh1_metal_hit_01.ogg", ini: 0, dur: 0.12 },
    { p: "rubberduck", a: "bfh1_metal_hit_04.ogg", ini: 0, dur: 0.2 },
    { p: "rubberduck", a: "bfh1_metal_hit_06.ogg", ini: 0, dur: 0.16 },
  ],
  // ---- quebrar
  "quebrar-pedra": [
    { p: "rubberduck", a: "bfh1_rock_breaking_01.ogg", ini: 0, dur: 0.38 },
    { p: "rubberduck", a: "bfh1_rock_breaking_03.ogg", ini: 0, dur: 0.36 },
    { p: "rubberduck", a: "bfh1_rock_falling_08.ogg", ini: 0, dur: 0.3 },
  ],
  "quebrar-madeira": [
    { p: "rubberduck", a: "bfh1_wood_breaking_01.ogg", ini: 0, dur: 0.2 },
    { p: "rubberduck", a: "bfh1_wood_breaking_03.ogg", ini: 0, dur: 0.3 },
    { p: "rubberduck", a: "bfh1_wood_breaking_04.ogg", ini: 0, dur: 0.26 },
  ],
  "quebrar-vidro": [
    { p: "rubberduck", a: "bfh1_glass_breaking_01.ogg", ini: 0, dur: 0.32 },
    { p: "rubberduck", a: "bfh1_glass_breaking_02.ogg", ini: 0, dur: 0.34 },
    { p: "rubberduck", a: "bfh1_glass_breaking_05.ogg", ini: 0, dur: 0.36 },
  ],
  "quebrar-metal": [
    { p: "rubberduck", a: "bfh1_metal_falling_03.ogg", ini: 0, dur: 0.24 },
    { p: "rubberduck", a: "bfh1_metal_hit_02.ogg", ini: 0, dur: 0.3 },
    { p: "rubberduck", a: "bfh1_metal_hit_03.ogg", ini: 0, dur: 0.3 },
  ],
  "quebrar-tecido": [
    { p: "kenney", a: "cloth2.ogg", ini: 0.04, dur: 0.3 },
    { p: "kenney", a: "cloth4.ogg", ini: 0, dur: 0.34 },
  ],
  // ---- porta, baú, Dimas
  "porta-abrir": [
    { p: "kenney", a: "doorOpen_1.ogg", ini: 0.03, dur: 0.66 },
    { p: "kenney", a: "doorOpen_2.ogg", ini: 0.02, dur: 0.76 },
  ],
  "porta-fechar": [
    { p: "kenney", a: "doorClose_1.ogg", ini: 0, dur: 0.38 },
    { p: "kenney", a: "doorClose_4.ogg", ini: 0.03, dur: 0.4 },
  ],
  "bau-abrir": [
    { p: "kenney", a: "creak1.ogg", ini: 0.14, dur: 0.4 },
    { p: "kenney", a: "creak3.ogg", ini: 0.04, dur: 0.2 },
  ],
  "bau-fechar": [
    { p: "rubberduck", a: "bfh1_wood_hit_02.ogg", ini: 0, dur: 0.18 },
    { p: "kenney", a: "bookPlace2.ogg", ini: 0, dur: 0.18 },
  ],
  "moeda-ganhou": [{ p: "kenney", a: "handleCoins.ogg", ini: 0.04, dur: 0.58 }],
  "moeda-gastou": [{ p: "kenney", a: "handleCoins2.ogg", ini: 0.04, dur: 0.24 }],
  // ---- bichos e grilo (BigSoundBank)
  "bicho-vaca": [
    { ...bsb("2383", "cow-moos-3"), ini: 1.1, dur: 1.45 },
    { ...bsb("2386", "cow-moos-6"), ini: 0.55, dur: 1.5 },
  ],
  "bicho-ovelha": [
    { ...bsb("2343", "sheep-1"), ini: 0.1, dur: 0.58 },
    { ...bsb("2345", "sheep-3"), ini: 0.05, dur: 0.72 },
  ],
  "bicho-galinha": [
    { ...bsb("0453", "annoyed-hen"), ini: 0.04, dur: 0.7 },
    { ...bsb("1039", "hens-worried"), ini: 4.12, dur: 0.88 },
  ],
  "bicho-cachorro": [
    { ...bsb("2955", "barking-dog-3"), ini: 0.02, dur: 0.64 },
    { ...bsb("0682", "barking-of-a-spitz"), ini: 0.7, dur: 0.38 },
  ],
  "bicho-gato": [
    { ...bsb("1475", "little-meow-of-a-cat-5"), ini: 0.08, dur: 0.64 },
    { ...bsb("1889", "meow-cat-1"), ini: 1.28, dur: 1.4 },
  ],
  grilo: [
    { ...bsb("1020", "field-cricket"), ini: 0.15, dur: 1.0 },
    // 2º take do MESMO grilo: o "nocturnal insect" (#0424) que estava aqui é
    // chiado de fundo igualado a −20 dB (pico 0,05 no original) — virava hiss.
    { ...bsb("1020", "field-cricket"), ini: 2.0, dur: 1.0 },
  ],
};

const sh = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

function baixar(url, destino) {
  if (existsSync(destino) && statSync(destino).size > 0) return;
  console.log(`  baixando ${url}`);
  sh("curl", ["-sSfL", "-m", "180", "-o", destino, url]);
}

/** Caminho local do arquivo ORIGINAL de um take (baixa e extrai se faltar). */
function original(t) {
  mkdirSync(CACHE, { recursive: true });
  if (t.bsb) {
    const f = join(CACHE, `bsb-${t.bsb}.ogg`);
    baixar(t.url, f);
    return f;
  }
  const pac = PACOTES[t.p];
  const zip = join(CACHE, `${t.p}.zip`);
  const pasta = join(CACHE, t.p);
  baixar(pac.zip, zip);
  if (!existsSync(pasta)) sh("unzip", ["-q", "-o", zip, "-d", pasta]);
  return join(pasta, pac.pasta, t.a);
}

/** Média e pico (dB) do trecho — o volumedetect do ffmpeg escreve no STDERR. */
function medidas(arq, ini, dur) {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-ss", String(ini), "-t", String(dur), "-i", arq, "-ac", "1", "-af", "volumedetect", "-f", "null", "-"],
    { encoding: "utf8" },
  ).stderr;
  const media = Number(/mean_volume: (-?[\d.]+) dB/.exec(r)?.[1]);
  const pico = Number(/max_volume: (-?[\d.]+) dB/.exec(r)?.[1]);
  if (!Number.isFinite(media) || !Number.isFinite(pico)) throw new Error(`volumedetect falhou em ${arq}`);
  return { media, pico };
}

const ALVO_MEDIA = -20;
const TETO_PICO = -3; // o Vorbis estoura até +5 dB no transiente; folga

rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });

const linhas = [];
let total = 0;
let n = 0;
for (const [conj, takes] of Object.entries(CONJUNTOS)) {
  takes.forEach((t, i) => {
    const arq = original(t);
    const { media, pico } = medidas(arq, t.ini, t.dur);
    const ganho = Math.min(ALVO_MEDIA - media, TETO_PICO - pico);
    const nome = `${conj}-${i + 1}.ogg`;
    const fadeOut = Math.max(0, t.dur - 0.025).toFixed(3);
    sh("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", String(t.ini), "-t", String(t.dur), "-i", arq,
      "-ac", "1", "-ar", "44100",
      "-af", `volume=${ganho.toFixed(2)}dB,afade=t=in:d=0.004,afade=t=out:st=${fadeOut}:d=0.025`,
      "-map_metadata", "-1",
      "-c:a", "libvorbis", "-q:a", "0",
      join(SAIDA, nome),
    ]);
    const kb = statSync(join(SAIDA, nome)).size;
    total += kb;
    n++;
    const origem = t.bsb
      ? `BigSoundBank #${t.bsb} — Joseph Sardin | ${t.pagina} | CC0 1.0`
      : `${PACOTES[t.p].nome}: \`${t.a}\` | ${PACOTES[t.p].pagina} | ${PACOTES[t.p].licenca}`;
    linhas.push(`| \`${nome}\` | ${origem} | ${t.ini}–${(t.ini + t.dur).toFixed(2)} s |`);
  });
}

writeFileSync(
  join(SAIDA, "CREDITOS.md"),
  `# Créditos dos sons (§🔊 sons v2)

Gerado por \`scripts/preparar-sons.mjs\` — **não editar à mão**: a tabela de
origem mora no script, e rodá-lo refaz esta pasta inteira.

Todos os arquivos são **CC0 1.0 (domínio público)**: não exigem crédito, mas o
repositório é público e a origem fica registrada. Cada amostra foi cortada,
convertida para mono e teve o volume igualado (−20 dBFS de média, pico −3 dBFS).

- Kenney — RPG Audio: https://opengameart.org/content/50-rpg-sound-effects (o mesmo
  pacote de https://kenney.nl/assets/rpg-audio)
- rubberduck — 75 CC0 breaking/falling/hit sfx: https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx
- TinyWorlds — Different steps: https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud
- BigSoundBank (Joseph Sardin): https://bigsoundbank.com — licença conferida na página de cada som

| Arquivo | Origem · página · licença | Trecho do original |
|---|---|---|
${linhas.join("\n")}
`,
);

console.log(`${n} arquivos, ${(total / 1024).toFixed(0)} KB em ${SAIDA}`);
const sobras = readdirSync(SAIDA).filter((f) => !f.endsWith(".ogg") && f !== "CREDITOS.md");
if (sobras.length) console.log("sobras inesperadas:", sobras);
