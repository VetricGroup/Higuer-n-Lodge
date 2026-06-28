/* ============================================================================
   JAVASCRIPT AVANZADO - ANIMACIONES PREMIUM SIN LIBRERÍAS
   Vanilla JS | Intersection Observer | Scroll Listeners
   ============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // ─────────────────────────────────────────────────────────────────────
    // 1. CONFIGURACIÓN GLOBAL
    // ─────────────────────────────────────────────────────────────────────
    
    const config = {
        revealThreshold: 0.15,
        parallaxSpeed: 0.5,
        parallaxElements: [],
        immersive3DElements: [],
        scrollElements: [],
    };

    // ─────────────────────────────────────────────────────────────────────
    // 2. FADE-UP ESCALONADO CON INTERSECTION OBSERVER
    // ─────────────────────────────────────────────────────────────────────
    
    function initRevealAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: config.revealThreshold, // Elemento debe estar 15% visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Agregar clase 'active' para disparar CSS
                    entry.target.classList.add('active');
                    
                    // Opcional: descomenta para que la animación ocurra solo una vez
                    // observer.unobserve(entry.target);
                } else {
                    // Opcional: remueve la clase para reiniciar al salir del viewport
                    // entry.target.classList.remove('active');
                }
            });
        }, observerOptions);

        // Seleccionar todos los elementos con clase 'reveal'
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => {
            observer.observe(el);
            config.scrollElements.push(el);
        });

        return observer;
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3. ANIMACIÓN 3D INMERSIVA EN CONTENEDORES
    // ─────────────────────────────────────────────────────────────────────
    
    function initImmersive3D() {
        // Seleccionar elementos con clase 'immersive-3d'
        const immersive3DElements = document.querySelectorAll('.immersive-3d, .image-container-3d');
        
        const observerOptions = {
            root: null,
            rootMargin: '100px',
            threshold: [0, 0.3, 0.6, 1.0],
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Aplicar animación de entrada 3D
                    entry.target.classList.add('scroll-in');
                    
                    // Calcular rotación basada en posición en viewport
                    const rect = entry.boundingClientRect;
                    const elementCenter = rect.top + rect.height / 2;
                    const viewportCenter = window.innerHeight / 2;
                    const distance = elementCenter - viewportCenter;
                    const ratio = distance / viewportCenter;

                    // Aplicar variables CSS para transformación dinámica
                    entry.target.style.setProperty(
                        '--rotate-x',
                        `${Math.max(Math.min(ratio * 10, 10), -10)}deg`
                    );
                    entry.target.style.setProperty(
                        '--scale',
                        `${Math.max(Math.min(1 + ratio * 0.1, 1.1), 0.9)}`
                    );

                    config.immersive3DElements.push(entry.target);
                }
            });
        }, observerOptions);

        immersive3DElements.forEach(el => observer.observe(el));
        return observer;
    }

    // ─────────────────────────────────────────────────────────────────────
    // 4. PARALLAX SUTIL EN IMÁGENES DE FONDO
    // ─────────────────────────────────────────────────────────────────────
    
    function initParallax() {
        // Seleccionar elementos parallax
        const parallaxElements = document.querySelectorAll(
            '.parallax-image, section:first-of-type img, [data-parallax]'
        );

        config.parallaxElements = Array.from(parallaxElements);

        // Función para actualizar posición parallax
        function updateParallax() {
            const scrollY = window.scrollY;

            config.parallaxElements.forEach(element => {
                if (!element) return;

                // Calcular si el elemento está en viewport
                const rect = element.getBoundingClientRect();
                const isInView = rect.top < window.innerHeight && rect.bottom > 0;

                if (isInView) {
                    // Calcular offset parallax (más lento que el scroll)
                    const speed = element.dataset.parallaxSpeed 
                        ? parseFloat(element.dataset.parallaxSpeed) 
                        : config.parallaxSpeed;

                    // Distancia del top del elemento al top del viewport
                    const distanceFromTop = rect.top;
                    
                    // Calcular parallax offset
                    const parallaxOffset = distanceFromTop * speed * -1;

                    // Aplicar transform con GPU acceleration
                    element.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            });
        }

        // Optimizar con requestAnimationFrame para mejor rendimiento
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Ejecutar una vez al cargar
        updateParallax();
    }

    // ─────────────────────────────────────────────────────────────────────
    // 5. SCROLL SNAPPING MAGNÉTICO (CSS-based, mejorado con JS)
    // ─────────────────────────────────────────────────────────────────────
    
    function initScrollSnap() {
        // El scroll snap se maneja principalmente en CSS
        // Este JS proporciona mejoras y feedback
        
        const sections = document.querySelectorAll('main > section');
        let currentSectionIndex = 0;

        function updateActiveSection() {
            const scrollPosition = window.scrollY;

            sections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollPosition >= sectionTop - window.innerHeight / 2 &&
                    scrollPosition < sectionTop + sectionHeight - window.innerHeight / 2) {
                    currentSectionIndex = index;
                    
                    // Opcional: Agregar clase de debugging
                    section.dataset.active = 'true';
                } else {
                    section.dataset.active = 'false';
                }
            });
        }

        // Throttle para mejor rendimiento
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateActiveSection();
            }, 16); // ~60fps
        });

        updateActiveSection();
    }

    // ─────────────────────────────────────────────────────────────────────
    // 6. ANIMACIÓN 3D DINÁMICA DURANTE SCROLL
    // ─────────────────────────────────────────────────────────────────────
    
    function initDynamic3DOnScroll() {
        const dynamic3DElements = document.querySelectorAll('.immersive-3d.is-scrolling');

        function updateDynamic3D() {
            const scrollY = window.scrollY;

            dynamic3DElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const elementCenter = rect.top + rect.height / 2;
                const viewportCenter = window.innerHeight / 2;
                
                // Calcular ángulos basados en posición en viewport
                const distanceFromCenter = elementCenter - viewportCenter;
                const maxDistance = window.innerHeight / 2;
                const ratio = Math.max(-1, Math.min(1, distanceFromCenter / maxDistance));

                // Rotar suavemente alrededor de X e Y
                const rotateX = ratio * -20;
                const rotateY = ratio * 15;
                const scale = 1 - Math.abs(ratio) * 0.05;

                element.style.setProperty('--rotate-x', `${rotateX}deg`);
                element.style.setProperty('--rotate-y', `${rotateY}deg`);
                element.style.setProperty('--scale', scale);
                element.style.setProperty('--translate-z', `${Math.abs(ratio) * 50}px`);
            });
        }

        // Usar requestAnimationFrame para mejor rendimiento
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateDynamic3D();
                    ticking = false;
                });
                ticking = true;
            }
        });

        updateDynamic3D();
    }

    // ─────────────────────────────────────────────────────────────────────
    // 7. APLICAR CLASES AUTOMÁTICAS A ELEMENTOS
    // ─────────────────────────────────────────────────────────────────────
    
    function autoClassifyElements() {
        // Agregar clase 'text-reveal' a textos
        document.querySelectorAll('.reveal h1, .reveal h2, .reveal h3, .reveal p').forEach(el => {
            if (!el.classList.contains('text-reveal')) {
                el.classList.add('text-reveal');
            }
        });

        // Agregar clase 'card-reveal' a tarjetas
        document.querySelectorAll(
            '.reveal [class*="card"], .reveal [class*="container"], .reveal .relative'
        ).forEach(el => {
            if (!el.classList.contains('card-reveal')) {
                el.classList.add('card-reveal');
            }
        });

        // Agregar clase 'image-reveal' a imágenes
        document.querySelectorAll('.reveal img').forEach(el => {
            if (!el.classList.contains('image-reveal')) {
                el.classList.add('image-reveal');
            }
        });

        // Aplicar 3D a contenedores de imágenes
        document.querySelectorAll('[class*="image-container"], [class*="relative"][class*="h-"]').forEach(el => {
            if (el.querySelector('img') && !el.classList.contains('image-container-3d')) {
                el.classList.add('image-container-3d');
                el.classList.add('immersive-3d');
            }
        });

        // Aplicar parallax a hero image
        const heroImage = document.querySelector('section:first-of-type img');
        if (heroImage && !heroImage.classList.contains('parallax-image')) {
            const heroSection = document.querySelector('section:first-of-type');
            heroSection.classList.add('parallax-container');
            heroImage.classList.add('parallax-image');
            heroImage.dataset.parallaxSpeed = '0.6';
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 8. INICIALIZAR TODAS LAS ANIMACIONES
    // ─────────────────────────────────────────────────────────────────────
    
    function init() {
        // Paso 1: Clasificar elementos automáticamente
        autoClassifyElements();

        // Paso 2: Inicializar cada sistema de animación
        console.log('🎬 Inicializando animaciones premium...');
        
        try {
            initRevealAnimations();
            console.log('✓ Fade-up escalonado activado');
        } catch (error) {
            console.error('Error en reveal animations:', error);
        }

        try {
            initImmersive3D();
            console.log('✓ Animación 3D inmersiva activada');
        } catch (error) {
            console.error('Error en immersive 3D:', error);
        }

        try {
            initParallax();
            console.log('✓ Parallax sutil activado');
        } catch (error) {
            console.error('Error en parallax:', error);
        }

        try {
            initScrollSnap();
            console.log('✓ Scroll snapping magnético activado');
        } catch (error) {
            console.error('Error en scroll snap:', error);
        }

        try {
            initDynamic3DOnScroll();
            console.log('✓ Animación 3D dinámica en scroll activada');
        } catch (error) {
            console.error('Error en dynamic 3D:', error);
        }

        console.log('🎨 Todas las animaciones premium están activas');
    }

    // ─────────────────────────────────────────────────────────────────────
    // 9. UTILIDADES Y HELPERS
    // ─────────────────────────────────────────────────────────────────────
    
    // Helper para desactivar animaciones en dispositivos con motion reducida
    function checkReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduce-motion');
            console.log('⚠️ Modo de movimiento reducido detectado');
        }

        // Escuchar cambios en preferencia
        window.matchMedia('(prefers-reduced-motion: reduce)').addListener((mq) => {
            if (mq.matches) {
                document.body.classList.add('reduce-motion');
            } else {
                document.body.classList.remove('reduce-motion');
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // 10. PUNTO DE ENTRADA PRINCIPAL
    // ─────────────────────────────────────────────────────────────────────
    
    // Verificar preferencias de motion
    checkReducedMotion();

    // Inicializar todas las animaciones
    init();

    // ─────────────────────────────────────────────────────────────────────
    // 11. EXPORT DE FUNCIONES PARA USO EXTERNO (OPCIONAL)
    // ─────────────────────────────────────────────────────────────────────
    
    // Exponer funciones globales para debugging/customización
    window.PremiumAnimations = {
        init,
        config,
        updateParallax: () => {
            // Forzar actualización de parallax
            document.querySelectorAll('.parallax-image').forEach(el => {
                const rect = el.getBoundingClientRect();
                const distanceFromTop = rect.top;
                const parallaxOffset = distanceFromTop * config.parallaxSpeed * -1;
                el.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
            });
        },
        toggleParallax: (enabled) => {
            document.querySelectorAll('.parallax-image').forEach(el => {
                el.style.transform = enabled ? '' : 'none';
            });
        },
        toggleScrollSnap: (enabled) => {
            document.documentElement.style.scrollSnapType = enabled ? 'y mandatory' : 'none';
        },
    };

    // ─────────────────────────────────────────────────────────────────────
    // 12. MONITOREO DE RENDIMIENTO (OPCIONAL)
    // ─────────────────────────────────────────────────────────────────────
    
    if (window.performance && window.performance.mark) {
        performance.mark('animations-loaded');
        if (performance.measure) {
            try {
                performance.measure('animation-load-time', 'navigationStart', 'animations-loaded');
                const measure = performance.getEntriesByName('animation-load-time')[0];
                console.log(`📊 Tiempo de carga de animaciones: ${measure.duration.toFixed(2)}ms`);
            } catch (e) {
                console.log('Medición de rendimiento no disponible');
            }
        }
    }
});