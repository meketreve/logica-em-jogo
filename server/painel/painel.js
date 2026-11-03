// Painel do professor — a página. Pergunta o estado ao painel (localhost) a
// cada 1,5 s e desenha; cada botão vira um POST em /api/… com o cabeçalho
// x-lj-painel (sem ele o painel recusa: é o que impede um site de fora de
// mandar ações pra cá). Sem build e sem framework: é um arquivo só.
import qrcode from "./vendor/qrcode.mjs";

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
/** **negrito** do changelog → <strong>, o resto escapado. */
const negrito = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const dataBr = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : iso);
const quando = (ms) => {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} às ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** "Os 3 conectados saem" × "A pessoa conectada sai" — o professor lê isto antes de derrubar a turma. */
const saemTodos = (n, oQue) =>
  n === 1 ? `A <strong>1</strong> pessoa conectada ${oQue[0]}.` : `Os <strong>${n}</strong> conectados ${oQue[1]}.`;

let estado = null;
/** Assinatura do que já foi desenhado: lista só se redesenha quando MUDA
 *  (redesenhar a cada 1,5 s apagaria o tamanho escolhido num <select>). */
const desenhado = { aulas: "", mundos: "", qr: "", jogadores: "" };
let codigoVisivel = false;
let falhasSeguidas = 0;
let esperandoAtualizar = false;

async function acao(rota, corpo = {}) {
  const r = await fetch(`/api/${rota}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-lj-painel": "1" },
    body: JSON.stringify(corpo),
  });
  let j = {};
  try {
    j = await r.json();
  } catch {
    /* sem corpo */
  }
  return { ok: r.ok && j.ok !== false, ...j };
}

// ------------------------------------------------------------- modal ---

/** Confirmação na própria página (nunca `confirm()`: trava a aba e as sondas). */
function perguntar(texto, { sim = "OK", perigo = false, extra = "" } = {}) {
  return new Promise((resolver) => {
    $("modal-texto").innerHTML = texto;
    $("modal-extra").innerHTML = extra;
    $("modal-sim").textContent = sim;
    $("modal-sim").className = `botao ${perigo ? "botao-perigo" : "botao-forte"}`;
    $("modal").hidden = false;
    const primeiro = $("modal-extra").querySelector("input");
    (primeiro ?? $("modal-sim")).focus();
    const fim = (v) => {
      $("modal").hidden = true;
      $("modal-sim").onclick = $("modal-nao").onclick = null;
      document.removeEventListener("keydown", tecla);
      resolver(v);
    };
    const tecla = (e) => {
      if (e.key === "Escape") fim(false);
      if (e.key === "Enter") fim(true);
    };
    document.addEventListener("keydown", tecla);
    $("modal-sim").onclick = () => fim(true);
    $("modal-nao").onclick = () => fim(false);
  });
}

function mostrarErro(t) {
  $("erro").textContent = t ?? "";
  $("erro").hidden = !t;
}

// ------------------------------------------------------------ desenho ---

function desenharFaixa(v) {
  const f = $("faixa");
  const rotulo = `${v.titulo ? `“${esc(v.titulo)}”` : "versão instalada"}${v.data ? ` (${dataBr(v.data)})` : ""}`;
  let texto;
  let classe = v.checagem;
  if (v.atualizou) {
    texto = `✅ <strong>Atualizado agora!</strong> Novidade: ${rotulo}`;
    classe = "em-dia";
  } else if (v.checagem === "nova") {
    texto = `⬇️ <strong>Tem versão nova</strong> do jogo. Você está na ${rotulo}.`;
  } else if (v.checagem === "em-dia") {
    texto = `✅ Jogo na versão mais nova: ${rotulo}`;
  } else if (v.checagem === "sem-internet") {
    texto = `📴 Sem internet — rodando a versão de ${v.data ? dataBr(v.data) : "antes"}${v.titulo ? ` (“${esc(v.titulo)}”)` : ""}. A aula funciona normalmente.`;
  } else if (v.checagem === "desconhecido") {
    texto = `Versão instalada: ${rotulo}`;
  } else {
    texto = `🔎 Procurando atualização… (versão instalada: ${rotulo})`;
  }
  f.className = `faixa faixa-${classe}`;
  f.dataset.estado = v.atualizou ? "atualizou" : v.checagem;
  $("faixa-texto").innerHTML = texto;
  $("faixa-novidades").hidden = v.novidades.length === 0;
  const novidades = $("novidades");
  if (novidades.dataset.n !== String(v.novidades.length)) {
    novidades.innerHTML = v.novidades.map((i) => `<li>${negrito(i)}</li>`).join("");
    novidades.dataset.n = String(v.novidades.length);
  }
  const bt = $("faixa-atualizar");
  bt.hidden = v.checagem !== "nova" || v.atualizou;
  // atualizar REINICIA o servidor: só sem aula rodando (decisão dele)
  const rodando = !!estado?.jogo;
  bt.disabled = rodando;
  bt.title = rodando ? "Pare a aula primeiro — atualizar reinicia o servidor." : "";
  bt.textContent = rodando ? "⬇️ Atualizar (pare a aula antes)" : "⬇️ Atualizar agora";
  $("rodape-versao").textContent = v.titulo ? `${v.titulo} · ${dataBr(v.data)}` : "";
}

function cartaoHtml({ caminho, num, titulo, resumo, img, atual, extra = "" }) {
  const capa = img
    ? `<div class="cartao-capa"><img class="cartao-img" src="miniaturas/${esc(img)}" alt=""><span class="cartao-selo">${esc(num)}</span></div>`
    : `<div class="cartao-img">${esc(num || "🧱")}</div>`;
  return `<div class="cartao${atual ? " atual" : ""}" role="button" tabindex="0" data-acao="abrir" data-caminho="${esc(caminho)}">
    ${capa}
    <div class="cartao-corpo">
      <span class="cartao-num">${esc(num)}</span>
      <span class="cartao-titulo">${esc(titulo)}</span>
      <span class="cartao-resumo">${esc(resumo)}</span>
      ${extra}
      <span class="cartao-acao">${atual ? "● no ar agora" : "▶ Abrir"}</span>
    </div>
  </div>`;
}

function desenharAulas(e) {
  const atual = e.jogo?.caminho ?? "";
  const assinatura = JSON.stringify([e.aulas, e.mundoLivre, atual]);
  if (assinatura === desenhado.aulas) return;
  desenhado.aulas = assinatura;
  const tamanho = e.mundoLivre.existe
    ? ""
    : `<select data-tamanho-livre aria-label="Tamanho do mundo livre">
         <option value="P">pequeno (padrão)</option><option value="M">médio</option>
         <option value="G">grande</option><option value="E">gigante (gera andando)</option>
       </select>`;
  const cartoes = [
    cartaoHtml({
      caminho: e.mundoLivre.caminho,
      num: "Livre",
      titulo: "Mundo livre",
      resumo: e.mundoLivre.existe ? "Construção livre — continua de onde a turma parou." : "Construção livre. Ainda não existe: nasce agora.",
      img: "mundo-livre.jpg",
      atual: atual === e.mundoLivre.caminho,
      extra: tamanho,
    }),
    ...e.aulas.map((a) =>
      cartaoHtml({
        caminho: a.caminho,
        num: a.numero ? `Aula ${a.numero}` : "Sua aula",
        titulo: a.titulo,
        resumo: a.resumo,
        img: a.miniatura,
        atual: atual === a.caminho,
      }),
    ),
  ];
  $("aulas").innerHTML = cartoes.join("");
  // a imagem que falta vira a capa colorida, não um ícone quebrado
  for (const img of $("aulas").querySelectorAll("img")) {
    img.addEventListener("error", () => {
      const num = img.closest(".cartao").querySelector(".cartao-num").textContent.replace(/\D/g, "");
      img.closest(".cartao-capa").outerHTML = `<div class="cartao-img">${esc(num || "🧱")}</div>`;
    });
  }
}

function desenharMundos(e) {
  const lista = e.mundos.filter((m) => m.caminho !== e.mundoLivre.caminho);
  const atual = e.jogo?.caminho ?? "";
  const assinatura = JSON.stringify([lista, atual]);
  if (assinatura === desenhado.mundos) return;
  desenhado.mundos = assinatura;
  $("mundos").innerHTML = lista.length
    ? lista
        .map(
          (m) => `<li data-mundo="${esc(m.nome)}">
        <span class="nome">${esc(m.nome)}</span>
        <span class="suave pequeno">salvo em ${quando(m.alteradoEm)}</span>
        <button class="botao" data-acao="abrir" data-caminho="${esc(m.caminho)}" ${atual === m.caminho ? "disabled" : ""}>${atual === m.caminho ? "● no ar" : "▶ Abrir"}</button>
        <button class="botao" data-acao="publicar" data-caminho="${esc(m.caminho)}" data-nome="${esc(m.nome)}" title="Copia pra lista de aulas: cada turma entra do jeito que você montou">📤 Publicar como aula</button>
      </li>`,
        )
        .join("")
    : `<li class="vazio">Nenhum mundo salvo ainda — crie um abaixo.</li>`;
}

function desenharQr(endereco) {
  if (desenhado.qr === endereco) return;
  desenhado.qr = endereco;
  const qr = qrcode(0, "M");
  qr.addData(endereco);
  qr.make();
  const svg = qr.createSvgTag({ cellSize: 8, margin: 2, scalable: true, alt: `QR code: ${endereco}` });
  $("qr").innerHTML = svg;
  $("projetar-qr").innerHTML = svg;
}

function desenharNoAr(e) {
  const j = e.jogo;
  const noAr = j && j.estado === "no-ar";
  $("no-ar").hidden = !noAr;
  $("subindo").hidden = !(j && j.estado !== "no-ar");
  if (j && j.estado !== "no-ar") $("subindo-texto").textContent = j.estado === "parando" ? "Parando e salvando…" : `Abrindo ${j.rotulo}…`;
  $("titulo-escolher").textContent = j ? "Trocar de aula" : "1. Escolha a aula";
  if (!noAr) {
    $("projetar").hidden = true;
    return;
  }
  $("no-ar-titulo").textContent = j.rotulo;
  $("no-ar-tipo").textContent = j.aula
    ? "Aula reutilizável: cada turma começa do zero, nada é salvo."
    : "O que a turma construir fica salvo sozinho (a cada 30 s e ao parar).";
  $("endereco").textContent = e.endereco;
  $("entrar-jogo").href = `http://localhost:${e.portaJogo}/`;
  $("projetar-endereco").textContent = e.endereco;
  desenharQr(e.endereco);
  const outros = e.enderecos.slice(1);
  $("outros-enderecos").hidden = outros.length === 0;
  $("outros-enderecos").textContent = outros.length ? `Não conecta? Tente também: ${outros.map((ip) => `http://${ip}:${e.portaJogo}`).join(" · ")}` : "";
  const cod = $("codigo");
  cod.textContent = codigoVisivel ? j.codigo ?? "—" : "••••";
  cod.dataset.oculto = codigoVisivel ? "0" : "1";
  document.querySelector('[data-acao="mostrar-codigo"]').textContent = codigoVisivel ? "esconder" : "mostrar";
  const assinatura = JSON.stringify(j.jogadores);
  if (assinatura !== desenhado.jogadores) {
    desenhado.jogadores = assinatura;
    const ordem = [...j.jogadores].sort((a, b) => (a.papel === "professor" ? -1 : 0) - (b.papel === "professor" ? -1 : 0) || a.nome.localeCompare(b.nome));
    $("conectados").innerHTML = ordem
      .map((p) => `<li class="${p.papel === "professor" ? "prof" : ""}" data-jogador="${esc(p.nome)}">${p.papel === "professor" ? "🎓 " : ""}${esc(p.nome)}</li>`)
      .join("");
  }
  const n = j.jogadores.length;
  $("conectados-titulo").textContent = n === 0 ? "Ninguém conectado" : n === 1 ? "1 conectado" : `${n} conectados`;
  $("conectados-vazio").hidden = j.jogadores.length > 0;
}

function desenhar(e) {
  estado = e;
  desenharFaixa(e.versao);
  mostrarErro(e.erro);
  desenharNoAr(e);
  desenharAulas(e);
  desenharMundos(e);
  const reg = $("registro");
  const pertoDoFim = reg.scrollTop + reg.clientHeight >= reg.scrollHeight - 20;
  reg.textContent = e.registro.join("\n");
  if (pertoDoFim) reg.scrollTop = reg.scrollHeight;
}

async function atualizarEstado() {
  try {
    const r = await fetch("/api/estado", { cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    const e = await r.json();
    falhasSeguidas = 0;
    $("fora").hidden = true;
    esperandoAtualizar = false;
    desenhar(e);
  } catch {
    // 2 falhas seguidas (3 s) antes de assustar o professor
    if (++falhasSeguidas >= 2) {
      $("fora").hidden = false;
      if (esperandoAtualizar) {
        $("fora-titulo").innerHTML = "<strong>Atualizando o jogo…</strong>";
        $("fora-texto").textContent = "A janela preta está baixando a versão nova. Esta página volta sozinha quando terminar (pode levar um minuto).";
      }
    }
  }
}

// ------------------------------------------------------------- ações ---

async function abrir(caminho, tamanho) {
  const e = estado;
  if (e?.jogo) {
    const n = e.jogo.jogadores.length;
    const sim = await perguntar(
      `Trocar <strong>${esc(e.jogo.rotulo)}</strong> por outro mundo?` +
        (n ? `<br><br>${saemTodos(n, ["sai do mundo atual e entra de novo no novo", "saem do mundo atual e entram de novo no novo"])}` : "") +
        (e.jogo.aula ? "" : "<br><br>O mundo atual é salvo antes."),
      { sim: "Trocar" },
    );
    if (!sim) return;
  }
  mostrarErro(null);
  const r = await acao("abrir", { caminho, tamanho });
  if (!r.ok) mostrarErro(r.erro ?? "Não deu para abrir.");
  window.scrollTo({ top: 0, behavior: "smooth" });
  void atualizarEstado();
}

async function publicar(caminho, nome) {
  const ok = await perguntar(
    `<strong>Publicar “${esc(nome)}” como aula</strong><br>Vira um cartão na lista de aulas. Cada turma entra nele do jeito que você montou, e o que uma turma mexer não atrapalha a seguinte. O mundo “${esc(nome)}” continua aqui, pra você mudar e publicar de novo.`,
    {
      sim: "📤 Publicar",
      extra: `<label>Nome da aula <input id="publicar-nome" value="aula-${esc(nome)}" maxlength="60" autocomplete="off"></label>`,
    },
  );
  if (!ok) return;
  const nomeAula = $("publicar-nome")?.value ?? "";
  let r = await acao("publicar", { origem: caminho, nome: nomeAula });
  if (!r.ok && r.existe) {
    const sobre = await perguntar(`Já existe uma aula chamada <strong>${esc(r.nome)}</strong>. Trocar ela por esta?`, { sim: "Substituir", perigo: true });
    if (!sobre) return;
    r = await acao("publicar", { origem: caminho, nome: nomeAula, sobrescrever: true });
  }
  if (!r.ok) return mostrarErro(r.erro ?? "Não deu para publicar.");
  const abrirJa = await perguntar(
    `✅ Publicada como <strong>${esc(r.nome)}</strong>${r.prefixoForcado ? ' (o nome precisa começar com "aula" — é isso que faz ela voltar ao original a cada turma)' : ""}.<br><br>Abrir agora pra conferir?`,
    { sim: "▶ Abrir agora" },
  );
  if (abrirJa) await abrir(r.caminho);
}

document.addEventListener("click", async (ev) => {
  const alvo = ev.target.closest("[data-acao]");
  if (!alvo || alvo.closest("select")) return;
  if (ev.target.closest("select")) return; // o seletor de tamanho dentro do cartão
  const a = alvo.dataset.acao;
  if (a === "abrir") {
    const sel = alvo.querySelector("[data-tamanho-livre]");
    return abrir(alvo.dataset.caminho, sel?.value);
  }
  if (a === "publicar") return publicar(alvo.dataset.caminho, alvo.dataset.nome);
  if (a === "novidades") {
    $("novidades").hidden = !$("novidades").hidden;
    alvo.textContent = $("novidades").hidden ? "ver novidades" : "esconder novidades";
    return;
  }
  if (a === "atualizar") {
    const ok = await perguntar("Atualizar o jogo agora?<br><br>O painel fecha por alguns instantes, a janela preta baixa a versão nova e esta página volta sozinha.", { sim: "⬇️ Atualizar" });
    if (!ok) return;
    const r = await acao("atualizar");
    if (!r.ok) return mostrarErro(r.erro);
    esperandoAtualizar = true;
    return;
  }
  if (a === "parar") {
    const n = estado?.jogo?.jogadores.length ?? 0;
    const ok = await perguntar(
      `Parar <strong>${esc(estado?.jogo?.rotulo ?? "a aula")}</strong>?` +
        (n ? `<br><br>${saemTodos(n, ["vai sair do jogo", "vão sair do jogo"])}` : "") +
        (estado?.jogo?.aula ? "" : "<br><br>O mundo é salvo antes de parar."),
      { sim: "⏹ Parar", perigo: true },
    );
    if (!ok) return;
    await acao("parar");
    return atualizarEstado();
  }
  if (a === "trocar") return document.getElementById("escolher").scrollIntoView({ behavior: "smooth" });
  if (a === "projetar") {
    $("projetar").hidden = false;
    return document.documentElement.requestFullscreen?.().catch(() => {});
  }
  if (a === "fechar-projetar") {
    $("projetar").hidden = true;
    if (document.fullscreenElement) return document.exitFullscreen?.().catch(() => {});
    return;
  }
  if (a === "mostrar-codigo") {
    codigoVisivel = !codigoVisivel;
    return estado && desenharNoAr(estado);
  }
  if (a === "trocar-codigo") {
    $("form-codigo").hidden = !$("form-codigo").hidden;
    if (!$("form-codigo").hidden) $("codigo-novo").focus();
    return;
  }
  if (a === "encerrar") {
    const ok = await perguntar(
      "Fechar o painel <strong>e</strong> o servidor do jogo?" + (estado?.jogo ? "<br><br>A aula que está no ar para (e é salva antes)." : ""),
      { sim: "Fechar tudo", perigo: true },
    );
    if (!ok) return;
    await acao("encerrar");
    $("fora-titulo").innerHTML = "<strong>Painel fechado.</strong>";
    $("fora-texto").textContent = "Pode fechar esta aba. Para abrir de novo, dê duplo clique em iniciar-servidor na pasta do jogo.";
    $("fora").hidden = false;
    clearInterval(laco);
  }
});

// Enter/espaço no cartão = clique (o cartão é um div por causa do <select> dentro)
document.addEventListener("keydown", (ev) => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.classList?.contains("cartao")) {
    ev.preventDefault();
    ev.target.click();
  }
  if (ev.key === "Escape" && !$("projetar").hidden) $("projetar").hidden = true;
});

$("form-codigo").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const codigo = $("codigo-novo").value.trim();
  if (!codigo) return;
  const n = estado?.jogo?.jogadores.length ?? 0;
  const ok = await perguntar(
    `Trocar o código do professor para <strong>${esc(codigo)}</strong>?<br><br>O servidor reinicia o mesmo mundo com o código novo` +
      (n ? `. ${saemTodos(n, ["sai e entra de novo", "saem e entram de novo"])}` : "."),
    { sim: "Trocar código" },
  );
  if (!ok) return;
  const r = await acao("codigo", { codigo });
  if (!r.ok) return mostrarErro(r.erro);
  $("form-codigo").hidden = true;
  $("codigo-novo").value = "";
  codigoVisivel = true;
});

$("form-falar").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const texto = $("falar-texto").value.trim();
  if (!texto) return;
  const r = await acao("falar", { texto });
  if (r.ok) $("falar-texto").value = "";
  else mostrarErro(r.erro);
});

$("form-criar").addEventListener("change", () => {
  const tipo = new FormData($("form-criar")).get("tipo");
  // o gigante NÃO tem tamanho (e o plano não tem o gigante): o seletor some
  $("criar-tamanho-rotulo").hidden = tipo === "procedural";
});
$("form-criar").dispatchEvent(new Event("change"));

$("form-criar").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const dados = new FormData($("form-criar"));
  const corpo = { tipo: dados.get("tipo"), nome: $("criar-nome").value, tamanho: $("criar-tamanho").value };
  if (estado?.jogo) {
    const ok = await perguntar(`Parar <strong>${esc(estado.jogo.rotulo)}</strong> e abrir o mundo novo?`, { sim: "Criar e abrir" });
    if (!ok) return;
  }
  mostrarErro(null);
  const r = await acao("criar", corpo);
  if (!r.ok) return mostrarErro(r.erro ?? "Não deu para criar.");
  $("criar-nome").value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
  void atualizarEstado();
});

void atualizarEstado();
const laco = setInterval(atualizarEstado, 1500);
