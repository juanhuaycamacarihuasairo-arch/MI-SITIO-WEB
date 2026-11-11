// ---------- SALUDO ----------
const mensaje = document.getElementById("mensaje");
document.getElementById("btn-saludo").addEventListener("click", () => {
  const h = new Date().getHours();
  const momento = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  mensaje.textContent = `¡${momento}! Gracias por visitar la página de nuestra universidad.`;
});

// ---------- MODO OSCURO (se recuerda la elección) ----------
const botonTema = document.getElementById("btn-tema");
function aplicarTema(oscuro) {
  document.body.classList.toggle("oscuro", oscuro);
  botonTema.textContent = oscuro ? "☀️" : "🌙";
  botonTema.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}
let guardado = null;
try { guardado = localStorage.getItem("tema"); } catch (e) {}
aplicarTema(guardado ? guardado === "oscuro" : matchMedia("(prefers-color-scheme: dark)").matches);
botonTema.addEventListener("click", () => {
  const oscuro = !document.body.classList.contains("oscuro");
  aplicarTema(oscuro);
  try { localStorage.setItem("tema", oscuro ? "oscuro" : "claro"); } catch (e) {}
});

// ---------- CONTADORES (cuentan al aparecer) ----------
function contar(el) {
  const meta = +el.dataset.meta, suf = el.dataset.sufijo || "";
  const ini = performance.now(), dur = 1400;
  (function paso(t) {
    const p = Math.min((t - ini) / dur, 1);
    el.textContent = Math.round(meta * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(paso);
  })(ini);
}

// ---------- APARECER AL HACER SCROLL + MENÚ ACTIVO ----------
const io = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    if (e.target.classList.contains("cifras")) e.target.querySelectorAll("[data-meta]").forEach(contar);
    io.unobserve(e.target);
  });
}, { threshold: 0.25 });
document.querySelectorAll(".cifras,.identidad,.tarjeta,.contacto").forEach((el) => {
  el.classList.add("revela"); io.observe(el);
});

const enlaces = document.querySelectorAll(".enlaces a");
const ioMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) enlaces.forEach((a) => a.classList.toggle("activo", a.hash === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("#identidad,#noticias,#contacto").forEach((s) => ioMenu.observe(s));

// ---------- FILTRO DE NOTICIAS ----------
const filtros = document.querySelectorAll(".filtro");
const tarjetas = document.querySelectorAll(".tarjeta");
filtros.forEach((f) => f.addEventListener("click", () => {
  filtros.forEach((x) => x.classList.toggle("activo", x === f));
  tarjetas.forEach((t) => t.classList.toggle("oculta", f.dataset.filtro !== "todas" && t.dataset.cat !== f.dataset.filtro));
}));

// ---------- IMAGEN DE RESPALDO SI UNA FOTO EXTERNA NO CARGA ----------
tarjetas.forEach((t) => {
  const img = t.querySelector("img");
  img.addEventListener("error", () => { img.src = "imagenes/unifsb.png"; }, { once: true });
});

// ---------- VISOR AMPLIADO ----------
const visor = document.getElementById("visor");
const visorImg = document.getElementById("visor-img");
const visorTexto = document.getElementById("visor-texto");
function abrir(t) {
  const img = t.querySelector("img");
  visorImg.src = img.src; visorImg.alt = img.alt;
  visorTexto.textContent = t.querySelector("figcaption").textContent;
  visor.showModal();
}
tarjetas.forEach((t) => {
  t.addEventListener("click", () => abrir(t));
  t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(t); } });
});
document.getElementById("cerrar").addEventListener("click", () => visor.close());
visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
