// función para obtener la fecha actual

document.addEventListener("DOMContentLoaded", () => {
  const dateElement = document.getElementById("current-date");
  const today = new Date();
  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  let formattedDate = formatter.format(today);

  formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  if (dateElement) {
    dateElement.textContent = formattedDate;
  }
});

// menú despegable

const menuButton = document.getElementById('menu-button');
const menuOverlay = document.querySelector('.menu-overlay');

menuButton.addEventListener('click', () => {
  const isActive = menuOverlay.classList.toggle('is-active');
  menuButton.classList.toggle('is-active', isActive);
  document.body.classList.toggle('no-scroll', isActive);
});

// Función para cerrar el menú cuando el usuario pulse un enlace interno

const menuLinks = menuOverlay.querySelectorAll('a[href^="#"]');

menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    menuOverlay.classList.remove('is-active');
    menuButton.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
  });
});

// Cambiar el tema de la landing dependiendo de la fecha

function applySeasonalPalette() {
  const hoy = new Date();
  const year = hoy.getFullYear();

  const inicio = new Date(year, 2, 18);
  const fin = new Date(year, 4, 28);

  if (hoy >= inicio && hoy <= fin) {
    const root = document.documentElement.style;
    root.setProperty('--color-bg', 'hsl(353, 60%, 90%)');
    root.setProperty('--color-text', 'hsl(353, 60%, 24%)');
    root.setProperty('--color-border', 'hsla(353, 80%, 50%, 0.20)');
    root.setProperty('--color-accent', 'hsl(353, 80%, 50%)');
    root.setProperty('--blob-vivid-1', 'hsla(353, 70%, 58%, 0.28)');
    root.setProperty('--blob-vivid-2', 'hsla(1, 65%, 66%, 0.22)');
    root.setProperty('--blob-vivid-3', 'hsla(345, 65%, 60%, 0.24)');
  }
}

applySeasonalPalette();

// sección activa

const sectionText = document.querySelector('.header__section-text');
const sections = document.querySelectorAll('.section[data-section]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      sectionText.textContent = entry.target.dataset.section;
    }
  });
}, {
  root: null,
  threshold: 0,
  rootMargin: '-50% 0px -50% 0px'
});

sections.forEach(section => observer.observe(section));

// función para encoger y hacer ascender el hero
// (dos fases independientes: primero encoge centrado, luego asciende)

(() => {
  const wrapper = document.getElementById('heroPin');
  const hero = wrapper.querySelector('.hero');

  function resolveDistance(varName, fallback) {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim() || fallback;

    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.height = raw;
    document.body.appendChild(probe);
    const px = probe.offsetHeight;
    probe.remove();

    return px;
  }

  let shrinkDistance = resolveDistance('--hero-shrink-distance', '50dvh');
  let ascendDistance = resolveDistance('--hero-ascend-distance', '50dvh');

  let ticking = false;

  function update() {
    const rect = wrapper.getBoundingClientRect();
    const scrolled = -rect.top;
    const totalDistance = shrinkDistance + ascendDistance;

    const shrinkProgress = shrinkDistance > 0
      ? Math.min(Math.max(scrolled / shrinkDistance, 0), 1)
      : 0;

    const ascendScrolled = scrolled - shrinkDistance;
    const ascendProgress = ascendDistance > 0
      ? Math.min(Math.max(ascendScrolled / ascendDistance, 0), 1)
      : 0;

    hero.style.setProperty('--shrink-progress', shrinkProgress);
    hero.style.setProperty('--ascend-progress', ascendProgress);

    if (scrolled <= 0) {
      hero.classList.remove('hero--pinned');
      hero.style.top = '0px';
    } else if (scrolled < totalDistance) {
      hero.classList.add('hero--pinned');
      hero.style.top = '0px';
    } else {
      hero.classList.remove('hero--pinned');
      hero.style.top = totalDistance + 'px';
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function onResize() {
    shrinkDistance = resolveDistance('--hero-shrink-distance', '50dvh');
    ascendDistance = resolveDistance('--hero-ascend-distance', '50dvh');
    onScroll();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  update();
})();

// función para desplegar y contraer los proyectos

document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '-50px 0px -50px 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, observerOptions);

  const elementsToObserve = document.querySelectorAll('.u-fade-blur, .projects__carousel-container');
  elementsToObserve.forEach(el => observer.observe(el));
});

// función para el carrusel

document.addEventListener('DOMContentLoaded', () => {
  const AUTOPLAY_DELAY = 3000;
  const SWIPE_THRESHOLD = 40;

  document.querySelectorAll('.projects__carousel-container').forEach(initCarousel);

  function initCarousel(container) {
    const track = container.querySelector('.projects__carousel-track');
    const carousel = container.querySelector('.projects__carousel');
    const slides = track.querySelectorAll('.projects__carousel-slide');
    const prevBtn = container.querySelector('.projects__carousel-button--prev');
    const nextBtn = container.querySelector('.projects__carousel-button--next');
    const total = slides.length;

    if (total <= 1) return;

    let index = Number.parseInt(track.dataset.index, 10) || 0;
    let autoplayId = null;

    container.setAttribute('tabindex', '0');
    container.style.outline = 'none';

    carousel.style.touchAction = 'none';

    function render({ instant = false } = {}) {
      if (instant) {
        track.style.transition = 'none';
        track.style.transform = `translateY(-${index * 100}%)`;
        track.dataset.index = index;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            track.style.transition = '';
          });
        });
      } else {
        track.style.transform = `translateY(-${index * 100}%)`;
        track.dataset.index = index;
      }
    }

    function next() {
      if (index >= total - 1) {
        index = 0;
        render({ instant: true });
      } else {
        index += 1;
        render();
      }
    }

    function prev() {
      if (index <= 0) {
        index = total - 1;
        render({ instant: true });
      } else {
        index -= 1;
        render();
      }
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = setInterval(next, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
    prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);

    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
        startAutoplay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
        startAutoplay();
      }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    carousel.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isSwiping = true;
      stopAutoplay();
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        e.preventDefault();
      }
    }, { passive: false });

    carousel.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      isSwiping = false;
      const touch = e.changedTouches[0];
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaY) >= SWIPE_THRESHOLD) {
        if (deltaY < 0) {
          next();
        } else {
          prev();
        }
      }
      startAutoplay();
    });

    render({ instant: true });
    startAutoplay();
  }
});