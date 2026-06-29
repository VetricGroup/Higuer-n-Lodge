/* =====================================================================
   Higuerón Lodge — animations.js
   GSAP + ScrollTrigger · Vanilla JS · mobile-first · minimalista/editorial

   Efectos:
     1. Scroll reveal  → fade-in + leve desplazamiento vertical
     2. Hero parallax  → la imagen del hero sube suave al iniciar el scroll
     3. Parallax doble → las 2 imágenes de "Nosotros" se mueven a distinta
                         velocidad para crear profundidad

   INTEGRACIÓN (en tu index.html, antes de </body> y DESPUÉS de tu script):
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
     <script src="animations.js"></script>

   HOOKS EN EL HTML (clases/atributos que lee este archivo):
     · class="reveal"        → cualquier sección/elemento que deba aparecer
     · data-hero-img         → la <img> del hero
     · data-parallax="N"     → cada imagen con parallax (N = recorrido en %).
                               Usá signos opuestos para que se muevan en
                               sentidos contrarios (p. ej. -6 y 10).

   CSS recomendado (estado inicial + accesibilidad):
     .reveal { opacity: 0; transform: translateY(20px); }
     @media (prefers-reduced-motion: reduce) {
       .reveal { opacity: 1 !important; transform: none !important; }
     }
   ===================================================================== */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ready = window.gsap && window.ScrollTrigger;

  // Fallback elegante: sin GSAP o con "reduce motion" → mostrar todo, sin parallax.
  if (!ready || prefersReduced) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true }); // evita saltos por la barra del navegador móvil

  /* 1 ─ SCROLL REVEAL ------------------------------------------------- */
  // Estado inicial controlado por GSAP (por si el CSS no cargó).
  gsap.set(".reveal", { opacity: 0, y: 28 });

  // batch() agrupa los elementos que entran juntos → más fluido que un trigger por nodo.
  ScrollTrigger.batch(".reveal", {
    start: "top 85%",
    once: true,
    onEnter: function (els) {
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.1,
        overwrite: true
      });
    }
  });

  /* 2 ─ HERO PARALLAX ------------------------------------------------- */
  var hero = document.querySelector("[data-hero-img]");
  if (hero) {
    gsap.to(hero, {
      yPercent: 14,           // recorrido suave
      ease: "none",
      scrollTrigger: {
        trigger: hero.closest("section"),
        start: "top top",
        end: "bottom top",
        scrub: true           // atado al scroll = movimiento natural
      }
    });
  }

  /* 3 ─ PARALLAX DOBLE EN "NOSOTROS" ---------------------------------- */
  // matchMedia: efecto completo en desktop, sutil en móvil (rendimiento).
  var mm = gsap.matchMedia();

  function buildParallax(factor) {
    return function () {
      gsap.utils.toArray("[data-parallax]").forEach(function (el) {
        var amt = (parseFloat(el.dataset.parallax) || 0) * factor;
        gsap.fromTo(
          el,
          { yPercent: -amt },
          {
            yPercent: amt,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section"),
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      });
    };
  }

  mm.add("(min-width: 640px)", buildParallax(1));    // desktop: efecto pleno
  mm.add("(max-width: 639px)", buildParallax(0.45)); // móvil: más sutil

  /* Recalcular posiciones cuando imágenes/fuentes terminan de cargar */
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();