// Small enhancements only: navigation and page content work without JavaScript.
const galleryWindow = document.querySelector('.gallery-window');
const galleryControls = document.querySelector('.gallery-controls');

if (galleryWindow && galleryControls) {
  const cards = Array.from(galleryWindow.querySelectorAll('.project-card'));
  const previous = galleryControls.querySelector('[data-gallery-previous]');
  const next = galleryControls.querySelector('[data-gallery-next]');
  const position = galleryControls.querySelector('[data-gallery-position]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollTimer;
  let currentIndex = 0;

  function updateGallery() {
    const bounds = galleryWindow.getBoundingClientRect();
    const visible = cards.filter(card => {
      const rect = card.getBoundingClientRect();
      return rect.left >= bounds.left - 2 && rect.right <= bounds.right + 2;
    });
    const edge = parseFloat(getComputedStyle(galleryWindow).scrollPaddingLeft) || 0;
    const closest = cards.reduce((best, card) => Math.abs(card.getBoundingClientRect().left - bounds.left - edge) < Math.abs(best.getBoundingClientRect().left - bounds.left - edge) ? card : best);
    const first = cards.indexOf(visible[0] || closest) + 1;
    const last = visible.length ? cards.indexOf(visible[visible.length - 1]) + 1 : first;
    currentIndex = first - 1;
    position.textContent = `${first === last ? first : `${first}–${last}`} / ${cards.length}`;
    position.setAttribute('aria-label', `Projects ${first} to ${last} of ${cards.length}`);
    previous.disabled = galleryWindow.scrollLeft <= 2;
    next.disabled = galleryWindow.scrollLeft + galleryWindow.clientWidth >= galleryWindow.scrollWidth - 2;
  }

  function scrollToCard(index, instant = false) {
    const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
    galleryWindow.scrollTo({
      left: card.offsetLeft - cards[0].offsetLeft,
      behavior: instant || reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  function moveGallery(direction) {
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    scrollToCard(Math.round(galleryWindow.scrollLeft / step) + direction);
  }

  previous.addEventListener('click', () => moveGallery(-1));
  next.addEventListener('click', () => moveGallery(1));
  galleryWindow.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveGallery(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      scrollToCard(event.key === 'Home' ? 0 : cards.length - 1);
    }
  });
  galleryWindow.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateGallery, 120);
  }, { passive: true });
  window.addEventListener('resize', () => {
    scrollToCard(currentIndex, true);
    updateGallery();
  });
  galleryWindow.classList.add('is-ready');
  galleryControls.hidden = false;
  updateGallery();
}

const lightbox = document.querySelector('.lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const image = lightbox.querySelector('.lightbox-image');
  const title = lightbox.querySelector('.lightbox-title');
  const description = lightbox.querySelector('.project-description');
  const report = lightbox.querySelector('.project-report');
  const close = lightbox.querySelector('.lightbox-close');
  const imageControls = lightbox.querySelector('.project-image-controls');
  const imageCaption = lightbox.querySelector('.project-image-caption');
  const imagePrevious = lightbox.querySelector('[data-image-previous]');
  const imageNext = lightbox.querySelector('[data-image-next]');
  let projectImages = [];
  let imageIndex = 0;
  let previousFocus;

  function showImage(index) {
    imageIndex = (index + projectImages.length) % projectImages.length;
    const current = projectImages[imageIndex];
    image.src = current.src;
    image.alt = current.alt;
    if (imageControls) {
      imageControls.hidden = projectImages.length < 2;
      imageCaption.textContent = `${current.caption || title.textContent} · ${imageIndex + 1} / ${projectImages.length}`;
    }
  }

  document.querySelectorAll('[data-document]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      previousFocus = link;
      title.textContent = link.dataset.document;
      if (description) description.textContent = link.dataset.description || '';
      if (report) {
        report.hidden = !link.dataset.report;
        if (link.dataset.report) {
          report.href = link.dataset.report;
          report.setAttribute('aria-label', `View report for ${title.textContent} (PDF, opens in a new tab)`);
        } else {
          report.removeAttribute('href');
          report.removeAttribute('aria-label');
        }
      }
      try {
        projectImages = JSON.parse(link.dataset.images || '[]');
      } catch {
        projectImages = [];
      }
      if (!projectImages.length) {
        projectImages = [{ src: link.href, alt: link.dataset.document }];
      }
      showImage(0);
      lightbox.showModal();
      document.body.classList.add('lightbox-open');
    });
  });
  imagePrevious?.addEventListener('click', () => showImage(imageIndex - 1));
  imageNext?.addEventListener('click', () => showImage(imageIndex + 1));
  lightbox.addEventListener('keydown', event => {
    if (projectImages.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      showImage(imageIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  close.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) {
      const box = lightbox.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) lightbox.close();
    }
  });
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    previousFocus?.focus({ preventScroll: true });
  });
}

const copyEmailButton = document.querySelector('[data-copy-email]');
if (copyEmailButton) {
  copyEmailButton.addEventListener('click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(copyEmailButton.dataset.copyEmail);
      status.textContent = 'Email address copied.';
    } catch {
      status.textContent = 'Could not copy. Select the email address to copy it.';
    }
  });
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  window.formspree = window.formspree || function () {
    (window.formspree.q = window.formspree.q || []).push(arguments);
  };
  window.formspree('initForm', {
    formElement: '#contact-form',
    formId: contactForm.dataset.formId,
    useDefaultStyles: false,
    disable: ({ form }) => {
      const button = form.querySelector('[data-fs-submit-btn]');
      button.disabled = true;
      button.textContent = 'Sending...';
      form.setAttribute('aria-busy', 'true');
    },
    enable: ({ form }) => {
      const button = form.querySelector('[data-fs-submit-btn]');
      button.disabled = false;
      button.textContent = 'Send Message';
      form.removeAttribute('aria-busy');
    },
  });
}
