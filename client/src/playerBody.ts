import * as THREE from "three";
import { PLAYER, type TipoGesto } from "@logica/shared";

/**
 * Geometria + animação do corpo de 5 partes — compartilhado entre os OUTROS
 * jogadores (`remotePlayers.ts`) e o corpo do PRÓPRIO jogador em 3ª pessoa
 * (2026-09-03, menu de emojis). Extraído de `remotePlayers.ts` pra não
 * duplicar a mesma matemática de balanço nos dois lados.
 *
 * Medidas: espelho manual de `ferramentas/editor-skin.html` (aquela página
 * não tem build, não dá pra importar isto de lá). Mudou aqui, muda lá também.
 * Cabem no MESMO envelope que a caixa antiga ocupava (`PLAYER.width` ×
 * `PLAYER.height`), com y=0 no CENTRO do corpo (pés em -height/2) — é o que
 * mantém a plaquinha de nome, o tombo de dormir e a mira do pvp funcionando
 * sem tocar em quem usa isto.
 */
const PERNA_ALTURA = 0.7;
const TRONCO_ALTURA = 0.7;
const CABECA_ALTURA = 0.4; // PERNA_ALTURA + TRONCO_ALTURA + CABECA_ALTURA === PLAYER.height (1.8)
const PERNA_LARGURA = 0.26;
const PERNA_PROFUNDIDADE = 0.28;
const TRONCO_PROFUNDIDADE = 0.3;
const BRACO_LARGURA = 0.16;
const BRACO_PROFUNDIDADE = 0.28;
const CABECA_LADO = 0.4;

/** Uma peça RÍGIDA do corpo (cabeça/tronco): caixa direto no grupo, sem pivô. */
function parte(
  material: THREE.MeshLambertMaterial,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  return m;
}

/**
 * Uma perna/braço/cabeça: caixa pendurada num PIVÔ na junta (quadril/ombro/
 * pescoço), não no meio do membro. `rotation` do pivô é o que anima
 * andar/correr/gesto/olhar — girar no centro do membro pareceria uma régua
 * batendo, não uma perna balançando. `sentido` decide se o membro fica ABAIXO
 * da junta (-1, pernas/braços) ou ACIMA dela (+1, a cabeça em cima do pescoço).
 */
function membroComPivo(
  material: THREE.MeshLambertMaterial,
  w: number,
  h: number,
  d: number,
  x: number,
  yJunta: number,
  z: number,
  sentido: 1 | -1,
): THREE.Group {
  const pivo = new THREE.Group();
  pivo.position.set(x, yJunta, z);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(0, (sentido * h) / 2, 0); // pendura pra baixo (-1) ou sobe (+1) a partir da junta
  pivo.add(m);
  return pivo;
}

export interface Corpo {
  grupo: THREE.Group;
  material: THREE.MeshLambertMaterial;
  pernaA: THREE.Group;
  pernaB: THREE.Group;
  bracoA: THREE.Group;
  bracoB: THREE.Group;
  /** Pivô no PESCOÇO — gira pra olhar pro alvo (pitch), dentro do limite do
   *  neck (`LIMITE_PESCOCO`). */
  cabeca: THREE.Group;
}

/** Monta o grupo de 5 partes (sem textura — cor só; membros já com pivô pra animar). */
export function criarCorpo(color: THREE.Color): Corpo {
  const material = new THREE.MeshLambertMaterial({ color });
  const grupo = new THREE.Group();
  const pes = -PLAYER.height / 2; // origem do grupo = centro do corpo, igual à caixa antiga
  const yQuadril = pes + PERNA_ALTURA; // topo da perna = onde ela pendura
  const yTronco = pes + PERNA_ALTURA + TRONCO_ALTURA / 2;
  const yOmbro = pes + PERNA_ALTURA + TRONCO_ALTURA; // topo do tronco = onde o braço pendura
  const yPescoco = yOmbro; // base do pescoço = topo do tronco — cabeça sobe dali

  const pernaA = membroComPivo(material, PERNA_LARGURA, PERNA_ALTURA, PERNA_PROFUNDIDADE, -PERNA_LARGURA / 2 - 0.01, yQuadril, 0, -1);
  const pernaB = membroComPivo(material, PERNA_LARGURA, PERNA_ALTURA, PERNA_PROFUNDIDADE, PERNA_LARGURA / 2 + 0.01, yQuadril, 0, -1);
  const bracoA = membroComPivo(material, BRACO_LARGURA, TRONCO_ALTURA, BRACO_PROFUNDIDADE, -(PLAYER.width / 2 + BRACO_LARGURA / 2), yOmbro, 0, -1);
  const bracoB = membroComPivo(material, BRACO_LARGURA, TRONCO_ALTURA, BRACO_PROFUNDIDADE, PLAYER.width / 2 + BRACO_LARGURA / 2, yOmbro, 0, -1);
  const cabeca = membroComPivo(material, CABECA_LADO, CABECA_ALTURA, CABECA_LADO, 0, yPescoco, 0, 1);
  grupo.add(
    pernaA,
    pernaB,
    bracoA,
    bracoB,
    cabeca,
    parte(material, PLAYER.width, TRONCO_ALTURA, TRONCO_PROFUNDIDADE, 0, yTronco, 0),
  );
  return { grupo, material, pernaA, pernaB, bracoA, bracoB, cabeca };
}

/** Libera as 6 geometrias + o material compartilhado. Chamar ANTES de tirar o grupo da cena. */
export function descartarCorpo(corpo: Corpo): void {
  corpo.grupo.traverse((filho) => {
    if (filho instanceof THREE.Mesh) filho.geometry.dispose();
  });
  corpo.material.dispose();
}

/** Estado de animação de UM corpo — vive no chamador (um por jogador remoto, um pro local). */
export interface EstadoAnimacaoCorpo {
  /** Fase do ciclo de passada (rad), avança com a DISTÂNCIA andada — não com o
   *  tempo, senão o personagem "marcharia" parado esperando o próximo pacote. */
  faseAndar: number;
  /** Amplitude atual do balanço (rad), suavizada — evita o membro "travar" ao
   *  parar/começar a andar do nada. */
  amplitude: number;
  /** Gesto em andamento (bater/interagir/emoji), por cima do balanço de andar. */
  gesto?: { tipo: TipoGesto; t: number };
  /** Pitch da CABEÇA, suavizado — nunca salta com o pacote de rede (10 Hz). */
  pitchAtual: number;
}

export function novoEstadoAnimacao(): EstadoAnimacaoCorpo {
  return { faseAndar: 0, amplitude: 0, pitchAtual: 0 };
}

// ── Andar/correr (2026-09-03) ──
const CICLO_POR_METRO = (2 * Math.PI) / 2.8; // ~1 passada completa a cada 2,8 m (2026-09-03: metade da velocidade original, 1,4 m)
const AMPL_ANDANDO = 0.5; // rad (~28°)
const AMPL_CORRENDO = 0.9; // rad (~52°)
const LIMIAR_PARADO = 0.15; // m/s — abaixo disso conta como parado
const LIMIAR_CORRIDA = 5.5; // m/s — entre andar (4,3) e correr (4,3×1,6=6,88)
const LIMIAR_TELEPORTE = 20; // m/s — acima disso é /tp, não corrida (não anima o salto)
const SUAVIZACAO_AMPLITUDE = 8; // por segundo — evita o membro "travar" ao parar/sair do lugar

// ── Gestos de UM/dois braços (2026-09-03) ──
// bater/interagir: curva única (sobe e desce em meia-senoide), só no bracoB.
const DURACAO_BATER = 0.26; // s — rápido, tipo soco
const PICO_BATER = 1.9; // rad (~109°)
const DURACAO_INTERAGIR = 0.4; // s — mais lento, tipo alcançar um baú
const PICO_INTERAGIR = 1.1; // rad (~63°)
// aceno: braço ESTICADO PRA FRENTE (rotation.x, mesmo sentido de bater), com
// um balanço de LADO A LADO por cima (rotation.z) — esse é o aceno em si.
const DURACAO_ACENO = 1.3;
const ACENO_ALTURA = 1.6; // rad — quanto o braço estica pra frente
const ACENO_AMPL_BALANCO = 0.35; // rad — o balanço de lado a lado, por cima do braço esticado
const ACENO_FREQ = 14; // rad/s do balanço
// comemorar: os DOIS braços sobem juntos e ficam um instante lá em cima.
const DURACAO_COMEMORAR = 1.4;
const PICO_COMEMORAR = 2.6; // rad (~149°) — braços bem pra cima
// dança: braços e pernas alternam em oposição, com um envelope que cresce e
// cai (não liga/desliga de repente).
const DURACAO_DANCA = 1.8;
const FREQ_DANCA = 10; // rad/s
const AMPL_DANCA_BRACO = 0.8;
const AMPL_DANCA_PERNA = 0.5;

// ── Cabeça olha pro alvo (2026-09-03) ──
// Limite BEM menor que o pitch inteiro (±89°, `Input.PITCH_LIMIT`): imita o
// limite real do pescoço — olhar reto pra cima/baixo usa também o corpo/olhos
// (que este modelo não tem), então a cabeça só acompanha até aqui e para.
const LIMITE_PESCOCO = 0.85; // rad (~49°)
const SUAVIZACAO_PITCH = 10; // por segundo — mesma disciplina da amplitude

/**
 * Aplica o balanço de andar/correr aos 4 pivôs, a cabeça olhando pro pitch
 * (dentro do limite do pescoço), e por cima disso — se houver um gesto em
 * andamento — a curva do gesto nos membros que ele usa (o resto continua
 * andando normal). `distXZ` = distância HORIZONTAL percorrida NESTE frame
 * (m); quem chama decide de onde tira isso (LERP de rede pro jogador remoto,
 * velocidade real pro jogador local). `pitchAlvo` é o pitch de VERDADE de
 * quem está mirando (rad, + = olhando pra cima — mesma convenção do `input.pitch`).
 */
export function animarCorpo(
  corpo: Corpo,
  estado: EstadoAnimacaoCorpo,
  distXZ: number,
  dt: number,
  pitchAlvo: number,
): void {
  const velocidade = dt > 0 ? distXZ / dt : 0;
  // parado OU teleporte (/tp de longe): sem balanço — só a corrida de verdade anima
  const semBalanco = velocidade < LIMIAR_PARADO || velocidade > LIMIAR_TELEPORTE;
  const alvoAmplitude = semBalanco ? 0 : velocidade > LIMIAR_CORRIDA ? AMPL_CORRENDO : AMPL_ANDANDO;
  estado.amplitude += (alvoAmplitude - estado.amplitude) * Math.min(1, dt * SUAVIZACAO_AMPLITUDE);
  if (!semBalanco) estado.faseAndar += distXZ * CICLO_POR_METRO;
  const balanco = Math.sin(estado.faseAndar) * estado.amplitude;
  corpo.pernaA.rotation.x = balanco;
  corpo.pernaB.rotation.x = -balanco;
  corpo.bracoA.rotation.x = -balanco; // braço oposto à perna do MESMO lado (marcha contralateral)
  corpo.bracoB.rotation.x = balanco;
  corpo.bracoA.rotation.z = 0;
  corpo.bracoB.rotation.z = 0;

  const alvoPitch = Math.max(-LIMITE_PESCOCO, Math.min(LIMITE_PESCOCO, pitchAlvo));
  estado.pitchAtual += (alvoPitch - estado.pitchAtual) * Math.min(1, dt * SUAVIZACAO_PITCH);
  // SEM inversão: pitch positivo (câmera pra CIMA, `Input.PITCH_LIMIT`) tem
  // de virar o rosto pra CIMA. Um teste isolado (HTML solto, câmera própria)
  // tinha indicado sinal invertido, mas o jogo de verdade mostrou o
  // contrário — o teste isolado tinha alguma diferença de eixo/câmera que não
  // bateu com o corpo real. Fonte da verdade agora é o jogo, não o teste.
  corpo.cabeca.rotation.x = estado.pitchAtual;

  if (!estado.gesto) return;
  estado.gesto.t += dt;
  const { tipo, t } = estado.gesto;
  switch (tipo) {
    case "bater":
    case "interagir": {
      const duracao = tipo === "bater" ? DURACAO_BATER : DURACAO_INTERAGIR;
      const pico = tipo === "bater" ? PICO_BATER : PICO_INTERAGIR;
      const progresso = t / duracao;
      if (progresso >= 1) { estado.gesto = undefined; return; }
      // + = braço pra FRENTE (confirmado no jogo — negativo ia pras costas)
      corpo.bracoB.rotation.x = pico * Math.sin(Math.PI * progresso);
      return;
    }
    case "aceno": {
      const progresso = t / DURACAO_ACENO;
      if (progresso >= 1) { estado.gesto = undefined; return; }
      // braço ESTICADO PRA FRENTE (mesmo sentido de bater/comemorar) — o aceno
      // em si é o balanço de LADO A LADO (`rotation.z`) por cima disso.
      const subida = Math.min(1, progresso / 0.2);
      const descida = progresso > 0.85 ? (progresso - 0.85) / 0.15 : 0;
      const altura = subida * (1 - descida);
      corpo.bracoB.rotation.x = ACENO_ALTURA * altura;
      corpo.bracoB.rotation.z = altura * ACENO_AMPL_BALANCO * Math.sin(t * ACENO_FREQ);
      return;
    }
    case "comemorar": {
      const progresso = t / DURACAO_COMEMORAR;
      if (progresso >= 1) { estado.gesto = undefined; return; }
      const subida = Math.min(1, progresso / 0.25);
      const descida = progresso > 0.75 ? (progresso - 0.75) / 0.25 : 0;
      const altura = subida * (1 - descida);
      // + = pra FRENTE/CIMA (mesmo ajuste do bater — tava indo pras costas)
      corpo.bracoA.rotation.x = PICO_COMEMORAR * altura;
      corpo.bracoB.rotation.x = PICO_COMEMORAR * altura;
      return;
    }
    case "danca": {
      const progresso = t / DURACAO_DANCA;
      if (progresso >= 1) { estado.gesto = undefined; return; }
      const envelope = Math.sin(Math.PI * progresso); // cresce e cai, sem liga/desliga seco
      const fase = t * FREQ_DANCA;
      corpo.bracoA.rotation.x = -AMPL_DANCA_BRACO * envelope * Math.sin(fase);
      corpo.bracoB.rotation.x = AMPL_DANCA_BRACO * envelope * Math.sin(fase);
      corpo.pernaA.rotation.x = AMPL_DANCA_PERNA * envelope * Math.sin(fase + Math.PI / 2);
      corpo.pernaB.rotation.x = -AMPL_DANCA_PERNA * envelope * Math.sin(fase + Math.PI / 2);
      return;
    }
  }
}
