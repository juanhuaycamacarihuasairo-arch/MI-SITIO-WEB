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
if (typeof IntersectionObserver !== "undefined") {
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
}

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
  tarjetas.forEach((t) => t.querySelector(".abrir-visor").addEventListener("click", () => abrir(t)));
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

// ---------- COMENTARIOS Y CORAZONES ----------
const plantillaInteracciones = document.getElementById("interacciones-template");
const noticiasSociales = [...document.querySelectorAll(".tarjeta[data-noticia]")];
if (plantillaInteracciones && noticiasSociales.length) {
  const avisoSocial = document.getElementById("aviso-social");
  noticiasSociales.forEach((noticia) => noticia.append(plantillaInteracciones.content.cloneNode(true)));

  const configSocial = window.UNIFSLB_SUPABASE_CONFIG;
  const urlSocial = configSocial && typeof configSocial.url === "string" ? configSocial.url.trim() : "";
  const claveSocial = configSocial && typeof configSocial.anonKey === "string" ? configSocial.anonKey.trim() : "";

  if (!urlSocial || !claveSocial) {
    avisoSocial.hidden = false;
    avisoSocial.textContent = "Comentarios y corazones estarán disponibles cuando se configure la conexión de la base de datos.";
  } else if (!window.supabase || typeof window.supabase.createClient !== "function") {
    avisoSocial.hidden = false;
    avisoSocial.textContent = "No se pudo cargar el servicio de comentarios. Comprueba tu conexión a internet e inténtalo de nuevo.";
  } else {
    const clienteSocial = window.supabase.createClient(urlSocial, claveSocial);
    const estado = (noticia, texto) => {
      noticia.querySelector(".estado-social").textContent = texto;
    };

    async function cargarComentarios(noticia) {
      const { data, error } = await clienteSocial
        .from("news_comments")
        .select("author_name, body, created_at")
        .eq("news_id", noticia.dataset.noticia)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      const lista = noticia.querySelector(".lista-comentarios");
      lista.replaceChildren();
      data.forEach((comentario) => {
        const elemento = document.createElement("li");
        elemento.className = "comentario";
        const autor = document.createElement("strong");
        autor.textContent = comentario.author_name;
        const texto = document.createElement("p");
        texto.textContent = comentario.body;
        const fecha = document.createElement("time");
        const fechaComentario = new Date(comentario.created_at);
        if (!Number.isNaN(fechaComentario.valueOf())) {
          fecha.dateTime = comentario.created_at;
          fecha.textContent = new Intl.DateTimeFormat("es-PE", {
            dateStyle: "medium",
            timeStyle: "short"
          }).format(fechaComentario);
        }
        elemento.append(autor, texto, fecha);
        lista.append(elemento);
      });
      estado(noticia, data.length ? "" : "Aún no hay comentarios. ¡Sé el primero!");
    }

    async function cargarCorazones(noticia) {
      const { data, error } = await clienteSocial.rpc("get_news_like_summary", {
        p_news_id: noticia.dataset.noticia
      });
      if (error) throw error;
      const resumen = Array.isArray(data) ? data[0] : null;
      if (!resumen) throw new Error("La base de datos no devolvió el resumen de corazones.");

      const boton = noticia.querySelector(".boton-corazon");
      const gustado = Boolean(resumen.liked_by_me);
      boton.setAttribute("aria-pressed", String(gustado));
      boton.querySelector("[data-icono-corazon]").textContent = gustado ? "♥" : "♡";
      boton.querySelector("[data-texto-corazon]").textContent = gustado ? "Te gusta" : "Me gusta";
      boton.querySelector("[data-contador-corazones]").textContent = String(resumen.total);
    }

    async function conectarInteracciones() {
      try {
        const { data, error } = await clienteSocial.auth.getSession();
        if (error) throw error;
        let session = data.session;
        if (!session) {
          const resultado = await clienteSocial.auth.signInAnonymously();
          if (resultado.error) throw resultado.error;
          session = resultado.data.session;
        }
        if (!session || !session.user) throw new Error("No se pudo crear una sesión de visitante.");
        const userId = session.user.id;

        noticiasSociales.forEach((noticia) => {
          const botonCorazon = noticia.querySelector(".boton-corazon");
          const formulario = noticia.querySelector(".form-comentario");
          const botonPublicar = formulario.querySelector(".boton-publicar");
          botonCorazon.disabled = false;
          botonPublicar.disabled = false;

          botonCorazon.addEventListener("click", async () => {
            const quitar = botonCorazon.getAttribute("aria-pressed") === "true";
            botonCorazon.disabled = true;
            try {
              const cambio = quitar
                ? clienteSocial.from("news_likes").delete()
                    .eq("news_id", noticia.dataset.noticia).eq("user_id", userId)
                : clienteSocial.from("news_likes").insert({
                    news_id: noticia.dataset.noticia,
                    user_id: userId
                  });
              const { error: errorCambio } = await cambio;
              if (errorCambio) throw errorCambio;
              await cargarCorazones(noticia);
              estado(noticia, "");
            } catch (errorCambio) {
              console.error("No se pudo actualizar el corazón:", errorCambio);
              estado(noticia, "No se pudo actualizar el corazón. Intenta de nuevo.");
            } finally {
              botonCorazon.disabled = false;
            }
          });

          formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const nombre = formulario.elements.nombre.value.trim().slice(0, 40) || "Visitante";
            const comentario = formulario.elements.comentario.value.trim();
            if (comentario.length < 3) {
              estado(noticia, "Escribe un comentario de al menos 3 caracteres.");
              return;
            }

            botonPublicar.disabled = true;
            estado(noticia, "Publicando tu comentario…");
            try {
              const { error: errorPublicacion } = await clienteSocial.from("news_comments").insert({
                news_id: noticia.dataset.noticia,
                user_id: userId,
                author_name: nombre,
                body: comentario
              });
              if (errorPublicacion) throw errorPublicacion;
              formulario.reset();
              await cargarComentarios(noticia);
              estado(noticia, "Tu comentario ya está publicado.");
            } catch (errorPublicacion) {
              console.error("No se pudo publicar el comentario:", errorPublicacion);
              estado(noticia, errorPublicacion.code === "P0001"
                ? errorPublicacion.message
                : "No se pudo publicar. Comprueba tu conexión e inténtalo de nuevo.");
            } finally {
              botonPublicar.disabled = false;
            }
          });
        });

        await Promise.all(noticiasSociales.map(async (noticia) => {
          try {
            await Promise.all([cargarComentarios(noticia), cargarCorazones(noticia)]);
          } catch (errorCarga) {
            console.error(`No se pudo cargar la actividad de ${noticia.dataset.noticia}:`, errorCarga);
            estado(noticia, "No se pudo cargar la actividad. Recarga la página para volver a intentar.");
          }
        }));
      } catch (errorConexion) {
        console.error("No se pudo conectar la actividad de noticias:", errorConexion);
        avisoSocial.hidden = false;
        avisoSocial.textContent = "No se pudo conectar la base de datos. Inténtalo más tarde.";
      }
    }

    conectarInteracciones();
  }
}
