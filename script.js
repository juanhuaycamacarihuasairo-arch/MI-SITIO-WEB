// ---------- SALUDO ----------
const mensaje = document.getElementById("mensaje");
const botonSaludo = document.getElementById("btn-saludo");
if (botonSaludo && mensaje) botonSaludo.addEventListener("click", () => {
  const h = new Date().getHours();
  const momento = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  mensaje.textContent = `¡${momento}! Gracias por visitar la página de nuestra universidad.`;
});

// ---------- MODO OSCURO (se recuerda la elección; la clase se aplica en <head> para evitar parpadeo) ----------
const raiz = document.documentElement;
const botonTema = document.getElementById("btn-tema");
function pintarTema() {
  const oscuro = raiz.classList.contains("oscuro");
  botonTema.textContent = oscuro ? "☀️" : "🌙";
  botonTema.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}
pintarTema();
botonTema.addEventListener("click", () => {
  const oscuro = raiz.classList.toggle("oscuro");
  pintarTema();
  try { localStorage.setItem("tema", oscuro ? "oscuro" : "claro"); } catch (e) {}
});

// ---------- MENÚ MÓVIL ----------
const burger = document.getElementById("btn-menu");
const enlacesMenu = document.getElementById("enlaces");
if (burger && enlacesMenu) {
  const cerrarMenu = () => {
    enlacesMenu.classList.remove("abierto");
    burger.setAttribute("aria-expanded", "false");
    burger.textContent = "☰";
    burger.setAttribute("aria-label", "Abrir menú");
  };
  burger.addEventListener("click", () => {
    const abierto = enlacesMenu.classList.toggle("abierto");
    burger.setAttribute("aria-expanded", abierto);
    burger.textContent = abierto ? "✕" : "☰";
    burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  enlacesMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", cerrarMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenu(); });
}

// ---------- CONTADORES (cuentan al aparecer) ----------
function contar(el) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
}, { threshold: 0.15 });
document.querySelectorAll(".cifras,.identidad,.tarjeta,.contacto,.contacto-aviso").forEach((el) => {
  el.classList.add("revela"); io.observe(el);
});

const enlaces = document.querySelectorAll(".enlaces a[href*='#']");
const ioMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) enlaces.forEach((a) => a.classList.toggle("activo", a.hash === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("#identidad,#noticias").forEach((s) => ioMenu.observe(s));

// ---------- FILTRO DE NOTICIAS ----------
const filtros = document.querySelectorAll(".filtro");
const tarjetas = document.querySelectorAll(".tarjeta");
filtros.forEach((f) => f.addEventListener("click", () => {
  filtros.forEach((x) => { x.classList.toggle("activo", x === f); x.setAttribute("aria-pressed", x === f); });
  tarjetas.forEach((t) => t.classList.toggle("oculta", f.dataset.filtro !== "todas" && t.dataset.cat !== f.dataset.filtro));
}));

// ---------- VISOR AMPLIADO (con flechas y teclado) ----------
const visor = document.getElementById("visor");
if (visor) {
  const visorImg = document.getElementById("visor-img");
  const visorTexto = document.getElementById("visor-texto");
  let actual = 0;
  const visibles = () => [...tarjetas].filter((t) => !t.classList.contains("oculta"));
  function mostrar(t) {
    const img = t.querySelector("img");
    visorImg.src = img.dataset.grande || img.currentSrc || img.src;
    visorImg.alt = img.alt;
    visorImg.width = img.width; visorImg.height = img.height;
    visorTexto.textContent = t.querySelector("figcaption").textContent.trim();
  }
  function abrir(t) { actual = visibles().indexOf(t); mostrar(t); visor.showModal(); }
  function mover(d) {
    const v = visibles(); if (!v.length) return;
    actual = (actual + d + v.length) % v.length; mostrar(v[actual]);
  }
  tarjetas.forEach((t) => {
    t.addEventListener("click", () => abrir(t));
    t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(t); } });
  });
  document.getElementById("cerrar").addEventListener("click", () => visor.close());
  document.getElementById("prev").addEventListener("click", () => mover(-1));
  document.getElementById("sig").addEventListener("click", () => mover(1));
  visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
  visor.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") mover(-1);
    if (e.key === "ArrowRight") mover(1);
  });
  // deslizar con el dedo en el celular
  let x0 = null;
  visor.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
  });
}
