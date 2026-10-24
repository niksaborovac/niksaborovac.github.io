// Small enhancements only: navigation and page content work without JavaScript.
const galleryTrack = document.querySelector('.project-track');
const pauseButton = document.querySelector('[data-pause-gallery]');

if (galleryTrack && pauseButton) {
  const group = galleryTrack.querySelector('.gallery-group');
  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.inert = true;
  galleryTrack.append(duplicate);
  galleryTrack.classList.add('is-ready');
  pauseButton.addEventListener('click', () => {
    const paused = galleryTrack.classList.toggle('is-paused');
    pauseButton.textContent = paused ? 'Play animation' : 'Pause animation';
    pauseButton.setAttribute('aria-pressed', String(paused));
  });
}

const lightbox = document.querySelector('.lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const image = lightbox.querySelector('.lightbox-image');
  const title = lightbox.querySelector('.lightbox-title');
  const close = lightbox.querySelector('.lightbox-close');
  let previousFocus;
  document.querySelectorAll('[data-document]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      previousFocus = link;
      image.src = link.href;
      image.alt = link.dataset.document;
      title.textContent = link.dataset.document;
      if (galleryTrack) galleryTrack.style.animationPlayState = 'paused';
      lightbox.showModal();
    });
  });
  close.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) {
      const box = lightbox.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) lightbox.close();
    }
  });
  lightbox.addEventListener('close', () => {
    if (galleryTrack) galleryTrack.style.animationPlayState = '';
    previousFocus?.focus();
  });
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const subject = `Portfolio enquiry from ${data.get('name')}`;
    const body = `${data.get('message')}\r\n\r\nFrom: ${data.get('name')}\r\nEmail: ${data.get('email')}`;
    // Open a draft in the visitor's mail app; no message is sent automatically.
    const recipient = contactForm.dataset.recipient;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.querySelector('[data-form-status]').textContent = 'Your email app should open with a draft. If it does not, use the email link on this page.';
  });
}
