const preferenciaOscura = window.matchMedia("(prefers-color-scheme: dark)");
let apariencia = "claro";
try { apariencia = localStorage.getItem("museo-apariencia") || "claro"; } catch {}
if (!["claro", "oscuro", "automatico"].includes(apariencia)) apariencia = "claro";
const aplicarApariencia = () => {
  const oscuro = apariencia === "oscuro" || (apariencia === "automatico" && preferenciaOscura.matches);
  document.documentElement.dataset.tema = oscuro ? "oscuro" : "claro";
  document.querySelector('meta[name="theme-color"]').content = oscuro ? "#0b0e14" : "#ffffff";
  document.getElementById("apariencia").value = apariencia;
  document.querySelector(".apariencia").dataset.modo = apariencia;
  document.querySelector(".apariencia").title = `Tema: ${apariencia === "automatico" ? "automático" : apariencia}. Cambiar tema`;
};
document.getElementById("apariencia").addEventListener("change", (e) => {
  apariencia = e.target.value;
  try { localStorage.setItem("museo-apariencia", apariencia); } catch {}
  aplicarApariencia();
});
preferenciaOscura.addEventListener("change", aplicarApariencia);
aplicarApariencia();

const pestanas = document.querySelectorAll('.vistas [role="tab"]');
pestanas.forEach((tab) =>
  tab.addEventListener("click", () => {
    pestanas.forEach((t) => {
      const activa = t === tab;
      t.setAttribute("aria-selected", String(activa));
      document.getElementById(t.getAttribute("aria-controls")).hidden = !activa;
    });
  })
);

document.querySelectorAll(".explorador").forEach((panel) => {
  const datos = JSON.parse(panel.dataset.puntos || "[]");
  const detalle = panel.querySelector(".parte-detalle");
  if (!detalle || !datos.length) return;
  const num = detalle.querySelector(".parte-detalle__num");
  const titulo = detalle.querySelector("strong");
  const texto = detalle.querySelector("p");

  const elegir = (indice, usuario) => {
    if (usuario) panel.classList.add("is-tocado");
    panel.querySelectorAll("[data-indice]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.indice === String(indice)))
    );
    const d = datos[indice - 1];
    num.textContent = indice;
    titulo.textContent = d.titulo;
    texto.innerHTML = d.texto;
  };
  panel.querySelectorAll("[data-indice]").forEach((b) =>
    b.addEventListener("click", () => elegir(Number(b.dataset.indice), true))
  );
  elegir(1, false);
});

const marcador = document.querySelector(".retos__hechos");
document.querySelectorAll(".reto__boton").forEach((boton) =>
  boton.addEventListener("click", () => {
    const respuesta = document.getElementById(boton.getAttribute("aria-controls"));
    const abrir = respuesta.hidden;
    respuesta.hidden = !abrir;
    boton.setAttribute("aria-expanded", String(abrir));
    boton.textContent = abrir ? "Ocultar respuesta" : "Ver respuesta";
    if (abrir) boton.closest(".reto").classList.add("is-hecho");
    if (marcador) {
      const hechos = document.querySelectorAll(".reto.is-hecho").length;
      const total = document.querySelectorAll(".reto").length;
      marcador.textContent = hechos;
      const estado = document.querySelector(".retos__estado");
      if (estado) estado.textContent = hechos === total ? "Exploración completada" : "Exploración en curso";
      document.querySelector(".retos__marcador").classList.toggle("is-completo", hechos === total);
    }
  })
);

const enlaces = document.querySelectorAll("[data-seccion]");
const secciones = [...document.querySelectorAll("main section[id]")];
const chips = document.querySelector(".indice-movil ul");
let actual = null;

const activar = (id) => {
  if (id === actual) return;
  actual = id;
  enlaces.forEach((a) => {
    const activo = a.dataset.seccion === id;
    a.classList.toggle("is-activo", activo);
    if (activo) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
    if (activo && chips && chips.contains(a) && chips.offsetParent !== null) {
      chips.scrollTo({ left: a.offsetLeft - (chips.clientWidth - a.offsetWidth) / 2, behavior: "smooth" });
    }
  });
};

const barra = document.querySelector(".progreso span");
const alDesplazar = () => {
  const linea = window.innerHeight * 0.3;
  let visible = secciones[0] ? secciones[0].id : null;
  for (const s of secciones) {
    if (s.getBoundingClientRect().top <= linea) visible = s.id;
  }
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4 && secciones.length) {
    visible = secciones[secciones.length - 1].id;
  }
  activar(visible);
  if (barra) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.width = `${total > 0 ? (window.scrollY / total) * 100 : 0}%`;
  }
};
if (secciones.length) {
  window.addEventListener("scroll", alDesplazar, { passive: true });
  window.addEventListener("resize", alDesplazar);
  alDesplazar();
}

const abrirDesplegable = (id) => {
  const desplegable = id && document.querySelector(`#${CSS.escape(id)} > details.desplegable`);
  if (desplegable) desplegable.open = true;
};
enlaces.forEach((a) => a.addEventListener("click", () => abrirDesplegable(a.dataset.seccion)));
window.addEventListener("hashchange", () => abrirDesplegable(location.hash.slice(1)));
abrirDesplegable(location.hash.slice(1));

const galeria = document.querySelector(".galeria");
const visor = document.querySelector(".visor");
if (galeria && visor) {
  const fotos = JSON.parse(galeria.dataset.fotos);
  const img = visor.querySelector("img");
  const pie = visor.querySelector("figcaption");
  const contador = visor.querySelector(".visor__contador");
  let indice = 0;

  const mostrar = (i) => {
    indice = (i + fotos.length) % fotos.length;
    img.src = fotos[indice].src;
    img.alt = fotos[indice].alt;
    const giro = fotos[indice].giro || 0;
    img.style.setProperty("--giro-foto", `${giro}deg`);
    img.classList.toggle("foto-giro-lateral", Math.abs(giro) % 180 === 90);
    pie.textContent = fotos[indice].pie;
    contador.textContent = `FOTO ${String(indice + 1).padStart(2, "0")}/${String(fotos.length).padStart(2, "0")}`;
  };

  galeria.querySelectorAll(".galeria__boton").forEach((b) =>
    b.addEventListener("click", () => {
      mostrar(Number(b.dataset.indice));
      visor.showModal();
    })
  );
  visor.querySelector(".visor__cerrar").addEventListener("click", () => visor.close());
  visor.querySelectorAll("[data-paso]").forEach((b) =>
    b.addEventListener("click", () => mostrar(indice + Number(b.dataset.paso)))
  );
  visor.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") mostrar(indice - 1);
    if (e.key === "ArrowRight") mostrar(indice + 1);
  });

  let inicioX = null;
  img.addEventListener("touchstart", (e) => {
    inicioX = e.touches.length === 1 ? e.touches[0].clientX : null;
  }, { passive: true });
  img.addEventListener("touchend", (e) => {
    if (inicioX === null) return;
    const dx = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(dx) > 50) mostrar(indice + (dx < 0 ? 1 : -1));
    inicioX = null;
  });
}

const BASE = document.documentElement.dataset.base || "";
const normalizar = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const palabras = (t) => " " + normalizar(t).replace(/[^a-z0-9ñ]+/g, " ");
const coincide = (texto, consulta) => {
  const enTexto = palabras(texto);
  return palabras(consulta).trim().split(" ").filter(Boolean).every((p) => enTexto.includes(" " + p));
};

const lista = document.getElementById("inventario");
const inventario = lista
  ? (() => {
      const filas = [...lista.children];
      const puntos = [...document.querySelectorAll(".tiempo__punto")];
      const estado = { texto: "", decada: "", coleccion: "", orden: "numero" };
      const total = document.getElementById("total");
      const vacio = document.getElementById("vacio");
      const activos = document.getElementById("activos");
      const limpiar = document.getElementById("limpiar");
      const campoPanel = document.getElementById("buscar-pieza");

      const aplicar = () => {
        const texto = normalizar(estado.texto.trim());
        let visibles = 0;
        const numeros = new Set();
        filas.forEach((f) => {
          const ok =
            (!estado.decada || f.dataset.decada === estado.decada) &&
            (!estado.coleccion || f.dataset.coleccion === estado.coleccion) &&
            (!texto || coincide(f.dataset.texto, texto));
          f.hidden = !ok;
          if (ok) { visibles++; numeros.add(f.dataset.numero); }
        });
        puntos.forEach((p) => p.classList.toggle("is-apagado", !numeros.has(p.dataset.numero)));
        total.textContent = visibles;
        vacio.hidden = visibles > 0;
        const partes = [];
        if (estado.texto.trim()) partes.push(`«${estado.texto.trim()}»`);
        if (estado.decada) partes.push(`años ${estado.decada}`);
        if (estado.coleccion) partes.push(estado.coleccion.toLowerCase());
        activos.hidden = limpiar.hidden = partes.length === 0;
        const cuenta = `${visibles} ${visibles === 1 ? "pieza" : "piezas"}`;
        activos.innerHTML = partes.length ? `${cuenta} · Filtrando por <strong>${partes.join(" · ").replace(/</g, "&lt;")}</strong>` : "";
      };

      const ordenar = () => {
        const clave = estado.orden;
        const valor = (f) => (clave === "nombre" ? f.dataset.nombre : f.dataset[clave]);
        filas
          .sort((a, b) => valor(a).localeCompare(valor(b), "es", { numeric: true }) || a.dataset.numero.localeCompare(b.dataset.numero))
          .forEach((f) => lista.appendChild(f));
      };

      const marcar = (selector, activo) =>
        document.querySelectorAll(selector).forEach((b) => b.setAttribute("aria-pressed", String(b === activo)));

      const epoca = document.querySelector(".panel__epoca");
      const epocaActiva = document.querySelector(".panel__epoca-activa");
      if (epoca) {
        const movil = matchMedia("(max-width: 599px)");
        const ajustarEpoca = () => { epoca.open = !movil.matches; };
        ajustarEpoca();
        movil.addEventListener("change", ajustarEpoca);
      }
      const todas = document.querySelector(".tiempo__todas");
      const elegirDecada = (valor) => {
        estado.decada = valor;
        document.querySelectorAll(".tiempo__tramo").forEach((t) =>
          t.setAttribute("aria-pressed", String(t.dataset.decada === valor))
        );
        if (todas) todas.setAttribute("aria-pressed", String(!valor));
        if (epocaActiva) epocaActiva.textContent = valor ? ` · años ${valor}` : "";
        aplicar();
      };
      document.querySelectorAll(".tiempo__tramo").forEach((b) =>
        b.addEventListener("click", () => elegirDecada(estado.decada === b.dataset.decada ? "" : b.dataset.decada))
      );
      if (todas) todas.addEventListener("click", () => elegirDecada(""));
      document.querySelectorAll("#colecciones .filtro").forEach((b) =>
        b.addEventListener("click", () => {
          estado.coleccion = b.dataset.valor;
          marcar("#colecciones .filtro", b);
          const fila = b.parentElement;
          if (fila.scrollWidth > fila.clientWidth) fila.scrollTo({ left: b.offsetLeft - 16, behavior: "smooth" });
          aplicar();
        })
      );
      document.querySelectorAll(".orden button").forEach((b) =>
        b.addEventListener("click", () => {
          estado.orden = b.dataset.orden;
          marcar(".orden button", b);
          ordenar();
        })
      );
      const reiniciar = () => {
        Object.assign(estado, { texto: "", coleccion: "" });
        elegirDecada("");
        marcar("#colecciones .filtro", document.querySelector('#colecciones .filtro[data-valor=""]'));
        const campo = document.getElementById("q");
        if (campo) campo.value = "";
        if (campoPanel) campoPanel.value = "";
        aplicar();
      };
      document.querySelectorAll(".panel__limpiar").forEach((b) => b.addEventListener("click", reiniciar));

      const colInicial = new URLSearchParams(location.search).get("coleccion");
      const botonCol = colInicial && [...document.querySelectorAll("#colecciones .filtro")].find((b) => b.dataset.valor === colInicial);
      if (botonCol) botonCol.click();

      if (campoPanel) {
        campoPanel.addEventListener("input", () => { estado.texto = campoPanel.value; aplicar(); });
        campoPanel.addEventListener("focus", () => {
          if (matchMedia("(max-width: 759px)").matches) {
            setTimeout(() => campoPanel.scrollIntoView({ block: "start", behavior: "smooth" }), 250);
          }
        });
        const qInicial = new URLSearchParams(location.search).get("q");
        if (qInicial) { campoPanel.value = qInicial; estado.texto = qInicial; aplicar(); }
      }

      return {
        buscar(texto) { estado.texto = texto; if (campoPanel) campoPanel.value = texto; aplicar(); },
      };
    })()
  : null;

const filaColecciones = document.getElementById("colecciones");
if (filaColecciones) {
  let arrastre = null;
  filaColecciones.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || filaColecciones.scrollWidth <= filaColecciones.clientWidth) return;
    arrastre = { x: e.clientX, inicio: filaColecciones.scrollLeft, movido: false };
  });
  window.addEventListener("pointermove", (e) => {
    if (!arrastre) return;
    const dx = e.clientX - arrastre.x;
    if (Math.abs(dx) > 5) arrastre.movido = true;
    if (arrastre.movido) filaColecciones.scrollLeft = arrastre.inicio - dx;
  });
  window.addEventListener("pointerup", () => {
    if (arrastre && arrastre.movido) {
      const anular = (e) => { e.stopPropagation(); e.preventDefault(); };
      filaColecciones.addEventListener("click", anular, { capture: true, once: true });
      setTimeout(() => filaColecciones.removeEventListener("click", anular, { capture: true }), 0);
    }
    arrastre = null;
  });
  filaColecciones.addEventListener("wheel", (e) => {
    const max = filaColecciones.scrollWidth - filaColecciones.clientWidth;
    if (max <= 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const destino = filaColecciones.scrollLeft + e.deltaY;
    if ((e.deltaY < 0 && filaColecciones.scrollLeft <= 0) || (e.deltaY > 0 && filaColecciones.scrollLeft >= max)) return;
    filaColecciones.scrollLeft = Math.max(0, Math.min(max, destino));
    e.preventDefault();
  }, { passive: false });
}

const busqueda = document.querySelector(".busqueda");
if (busqueda) {
  const abrir = busqueda.querySelector(".busqueda__abrir");
  const formulario = busqueda.querySelector(".busqueda__form");
  const campo = busqueda.querySelector("#q");
  const caja = busqueda.querySelector(".busqueda__resultados");
  const datos = JSON.parse(document.getElementById("datos-busqueda").textContent);
  let elegido = -1;
  let resultados = [];

  const cerrarResultados = () => {
    caja.hidden = true;
    campo.setAttribute("aria-expanded", "false");
    elegido = -1;
  };
  const desplegar = () => {
    formulario.hidden = false;
    busqueda.classList.add("is-abierta");
    abrir.setAttribute("aria-expanded", "true");
    campo.focus();
  };
  const plegar = () => {
    cerrarResultados();
    formulario.hidden = true;
    busqueda.classList.remove("is-abierta");
    abrir.setAttribute("aria-expanded", "false");
  };
  const pintar = () => {
    const texto = normalizar(campo.value.trim());
    if (!texto) { cerrarResultados(); return; }
    resultados = datos.filter((d) => coincide(d.x, texto)).slice(0, 8);
    caja.innerHTML = resultados.length
      ? resultados
          .map((d, i) => `<li role="option" id="res-${i}" aria-selected="${i === elegido}"><a href="${BASE}/${d.n}/">
              <img src="${d.f}" alt="" loading="lazy" style="--color:${d.k}"><span><strong>${d.t}</strong><small>${d.n} · ${d.c}${d.a ? ` · ${d.a}` : ""}</small></span></a></li>`)
          .join("")
      : '<li class="busqueda__vacio">No hay ninguna pieza con ese texto.</li>';
    caja.hidden = false;
    campo.setAttribute("aria-expanded", "true");
  };

  const campoColeccion = document.getElementById("buscar-pieza");
  abrir.addEventListener("click", () => {
    if (campoColeccion) {
      campoColeccion.scrollIntoView({ block: "center", behavior: "smooth" });
      campoColeccion.focus({ preventScroll: true });
      return;
    }
    formulario.hidden ? desplegar() : plegar();
  });
  busqueda.querySelector(".busqueda__cerrar").addEventListener("click", () => {
    if (campo.value && inventario) inventario.buscar("");
    campo.value = "";
    plegar();
    abrir.focus();
  });
  campo.addEventListener("input", () => {
    elegido = -1;
    if (inventario) inventario.buscar(campo.value);
    pintar();
  });
  campo.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!resultados.length) return;
      e.preventDefault();
      elegido = (elegido + (e.key === "ArrowDown" ? 1 : -1) + resultados.length) % resultados.length;
      pintar();
      campo.setAttribute("aria-activedescendant", `res-${elegido}`);
    } else if (e.key === "Escape") {
      if (!caja.hidden) cerrarResultados();
      else { plegar(); abrir.focus(); }
    }
  });
  formulario.addEventListener("submit", (e) => {
    const destino = resultados[elegido >= 0 ? elegido : 0];
    if (destino) { e.preventDefault(); location.href = `${BASE}/${destino.n}/`; }
    else if (inventario) e.preventDefault();
  });
  document.addEventListener("click", (e) => {
    if (busqueda.contains(e.target)) return;
    if (campo.value.trim() && inventario) cerrarResultados();
    else plegar();
  });

  const inicial = new URLSearchParams(location.search).get("q");
  if (inicial && inventario && !document.getElementById("buscar-pieza")) { desplegar(); campo.value = inicial; inventario.buscar(inicial); }
}

const carrusel = document.querySelector(".carrusel");
if (carrusel) {
  const piezas = [...carrusel.querySelectorAll(".carrusel__pieza")];
  const controles = carrusel.querySelector(".carrusel__controles");
  const actual = carrusel.querySelector(".carrusel__actual");
  let indice = 0;

  const cargar = (i) => {
    const img = piezas[(i + piezas.length) % piezas.length].querySelector("img[data-src]");
    if (img) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
  };

  const mostrar = (nuevo) => {
    indice = (nuevo + piezas.length) % piezas.length;
    piezas.forEach((p, i) => {
      const activa = i === indice;
      p.classList.toggle("is-activa", activa);
      p.toggleAttribute("inert", !activa);
      if (activa) p.removeAttribute("aria-hidden");
      else p.setAttribute("aria-hidden", "true");
    });
    actual.textContent = String(indice + 1).padStart(3, "0");
    cargar(indice);
    cargar(indice + 1);
    cargar(indice - 1);
  };

  if (piezas.length > 1) {
    controles.hidden = false;
    controles.querySelectorAll("[data-paso]").forEach((b) =>
      b.addEventListener("click", () => mostrar(indice + Number(b.dataset.paso)))
    );
    const pulsar = (paso) => {
      const tecla = controles.querySelector(`[data-paso="${paso}"]`);
      tecla.classList.add("is-pulsada");
      setTimeout(() => tecla.classList.remove("is-pulsada"), 120);
      mostrar(indice + paso);
    };
    carrusel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { pulsar(1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { pulsar(-1); e.preventDefault(); }
    });
    let inicioX = null, inicioY = null;
    const pista = carrusel.querySelector(".carrusel__pista");
    pista.addEventListener("touchstart", (e) => { inicioX = e.touches[0].clientX; inicioY = e.touches[0].clientY; }, { passive: true });
    pista.addEventListener("touchend", (e) => {
      if (inicioX === null) return;
      const dx = e.changedTouches[0].clientX - inicioX;
      const dy = e.changedTouches[0].clientY - inicioY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) mostrar(indice + (dx < 0 ? 1 : -1));
      inicioX = null;
    });
    cargar(1);
    cargar(-1);
  }
}
