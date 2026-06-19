/* ====================================================================
   BATALLA DE TALENTOS · SENA
   Script principal
   ====================================================================
   Índice:
   1. Utilidades
   2. Menú de navegación responsive
   3. Header con sombra al hacer scroll + barra de progreso
   4. Scroll-spy (resalta el enlace de la sección activa)
   5. Scroll suave para navegadores sin soporte nativo
   6. Animaciones de aparición al hacer scroll (Intersection Observer)
   7. Botón "volver arriba"
   8. Año dinámico en el footer
   ==================================================================== */

(function () {
  "use strict";

  /* ---------------------- 1. UTILIDADES ---------------------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------- 2. MENÚ DE NAVEGACIÓN RESPONSIVE ---------------- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  const navLinks = $$(".nav-link");

  function abrirMenu() {
    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Cerrar menú de navegación");
    document.body.style.overflow = "hidden";
  }

  function cerrarMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú de navegación");
    document.body.style.overflow = "";
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("is-open");
      isOpen ? cerrarMenu() : abrirMenu();
    });

    // Cierra el menú al elegir una sección (en vista móvil)
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("is-open")) {
          cerrarMenu();
        }
      });
    });

    // Cierra el menú con la tecla Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        cerrarMenu();
        navToggle.focus();
      }
    });
  }

  /* ----- 3. HEADER CON SOMBRA AL SCROLL + BARRA DE PROGRESO ----- */
  const siteHeader = $("#siteHeader");
  const scrollProgress = $("#scrollProgress");

  function actualizarHeaderYProgreso() {
    const scrollY = window.scrollY || window.pageYOffset;

    // Header compacto tras superar 40px
    if (siteHeader) {
      siteHeader.classList.toggle("is-scrolled", scrollY > 40);
    }

    // Barra de progreso de lectura
    if (scrollProgress) {
      const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
      const progreso = alturaTotal > 0 ? (scrollY / alturaTotal) * 100 : 0;
      scrollProgress.style.width = progreso + "%";
    }
  }

  /* ---------------------- 4. SCROLL-SPY ---------------------- */
  const secciones = $$("main section[id]");

  function actualizarEnlaceActivo() {
    let seccionActualId = null;
    const offset = 120; // compensa la altura del header fijo

    secciones.forEach((seccion) => {
      const top = seccion.getBoundingClientRect().top - offset;
      if (top <= 0) {
        seccionActualId = seccion.id;
      }
    });

    navLinks.forEach((link) => {
      const esActivo = link.dataset.section === seccionActualId;
      link.classList.toggle("is-active", esActivo);
      if (esActivo) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ------------- EVENTO DE SCROLL UNIFICADO (rendimiento) ------------- */
  let scrollTicking = false;

  function manejarScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        actualizarHeaderYProgreso();
        actualizarEnlaceActivo();
        actualizarVisibilidadBotonArriba();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener("scroll", manejarScroll, { passive: true });
  window.addEventListener("load", () => {
    actualizarHeaderYProgreso();
    actualizarEnlaceActivo();
  });

  /* -------- 5. SCROLL SUAVE (refuerzo para navegadores antiguos) -------- */
  $$('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener("click", (event) => {
      const destinoId = enlace.getAttribute("href");
      if (destinoId.length <= 1) return; // ignora "#" vacíos

      const destino = $(destinoId);
      if (!destino) return;

      event.preventDefault();
      destino.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      // Mantiene la URL actualizada sin saltos abruptos
      history.pushState(null, "", destinoId);
    });
  });

  /* -------- 6. ANIMACIONES DE APARICIÓN AL HACER SCROLL -------- */
  const elementosReveal = $$(".reveal");

  if ("IntersectionObserver" in window && elementosReveal.length) {
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada, index) => {
          if (entrada.isIntersecting) {
            // Pequeño desfase escalonado para listas/galerías
            const retraso = prefersReducedMotion ? 0 : (index % 3) * 90;
            setTimeout(() => {
              entrada.target.classList.add("is-visible");
            }, retraso);
            observer.unobserve(entrada.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    elementosReveal.forEach((el) => observer.observe(el));
  } else {
    // Sin soporte de IntersectionObserver: mostrar todo de inmediato
    elementosReveal.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------- 7. BOTÓN VOLVER ARRIBA ---------------------- */
  const backToTopBtn = $("#backToTop");

  function actualizarVisibilidadBotonArriba() {
    if (!backToTopBtn) return;
    const scrollY = window.scrollY || window.pageYOffset;
    backToTopBtn.classList.toggle("is-visible", scrollY > 480);
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---------------------- 8. AÑO DINÁMICO EN EL FOOTER ---------------------- */
  const anioActualEl = $("#anio-actual");
  if (anioActualEl) {
    anioActualEl.textContent = new Date().getFullYear();
  }
})();
