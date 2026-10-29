/* ==========================================================
   lightbox.js  -  Gallery lightbox
   Used on: About Us (photo gallery) and Menu (cocktail menu images)

   HOW IT WORKS
   Any link written like this becomes part of a lightbox:
     <a href="big-image.jpg" data-lightbox="gallery" data-caption="Text under the image">
        <img src="thumbnail.jpg" alt="Describe the image">
     </a>
   All links that share the same data-lightbox value form one group,
   so the visitor can move between them with Next / Previous.
   Controls: click, Close button, Esc key, left/right arrow keys, swipe on touch screens.
   ========================================================== */

(function () {
  const links = Array.from(document.querySelectorAll('a[data-lightbox]'));
  if (links.length === 0) return; // nothing to do on pages without a gallery

  let group = [];        // the links in the group that was clicked
  let index = 0;         // which image of the group is showing
  let lastFocused = null; // so focus can go back where it was when closing

  /* ----- build the overlay once and add it to the page ----- */
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');
  overlay.hidden = true;
  overlay.innerHTML =
    '<button type="button" class="lightbox__close" aria-label="Close image viewer">&times;</button>' +
    '<button type="button" class="lightbox__nav lightbox__prev" aria-label="Previous image">&#10094;</button>' +
    '<figure class="lightbox__figure">' +
      '<div class="lightbox__loader" aria-hidden="true"></div>' +
      '<img class="lightbox__img" alt="">' +
      '<p class="lightbox__error" hidden>Sorry, this image could not be loaded.</p>' +
      '<figcaption class="lightbox__caption"></figcaption>' +
    '</figure>' +
    '<button type="button" class="lightbox__nav lightbox__next" aria-label="Next image">&#10095;</button>';
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('.lightbox__img');
  const captionEl = overlay.querySelector('.lightbox__caption');
  const errorEl = overlay.querySelector('.lightbox__error');
  const loaderEl = overlay.querySelector('.lightbox__loader');
  const closeBtn = overlay.querySelector('.lightbox__close');
  const prevBtn = overlay.querySelector('.lightbox__prev');
  const nextBtn = overlay.querySelector('.lightbox__next');

  /* ----- show one image of the current group ----- */
  function show(i) {
    index = (i + group.length) % group.length; // wraps around at both ends
    const link = group[index];
    const thumb = link.querySelector('img');

    errorEl.hidden = true;
    imgEl.hidden = false;
    loaderEl.hidden = false;
    imgEl.classList.remove('loaded');

    imgEl.onload = () => { loaderEl.hidden = true; imgEl.classList.add('loaded'); };
    imgEl.onerror = () => { loaderEl.hidden = true; imgEl.hidden = true; errorEl.hidden = false; };
    imgEl.src = link.getAttribute('href');
    imgEl.alt = thumb ? thumb.alt : '';

    const caption = link.dataset.caption || (thumb ? thumb.alt : '');
    captionEl.textContent = caption + (group.length > 1 ? '  (' + (index + 1) + ' of ' + group.length + ')' : '');

    // Hide arrows if the group has only one picture
    prevBtn.hidden = nextBtn.hidden = group.length < 2;

    // Pre-load the next picture so moving forward feels instant
    if (group.length > 1) {
      new Image().src = group[(index + 1) % group.length].getAttribute('href');
    }
  }

  function open(link) {
    lastFocused = document.activeElement;
    group = links.filter((l) => l.dataset.lightbox === link.dataset.lightbox);
    overlay.hidden = false;
    document.body.classList.add('no-scroll'); // stops the page scrolling behind the overlay
    show(group.indexOf(link));
    closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove('no-scroll');
    imgEl.src = '';
    if (lastFocused) lastFocused.focus();
  }

  /* ----- events ----- */
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // stop the browser from navigating to the image file
      open(link);
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));

  // click on the dark background (but not on the image or buttons) closes it
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('lightbox__figure')) close();
  });

  document.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'Tab') {
      // keep keyboard focus inside the overlay while it is open
      const focusable = Array.from(overlay.querySelectorAll('button')).filter((b) => !b.hidden);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe left / right on phones and tablets
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    const distance = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 50) show(distance > 0 ? index - 1 : index + 1);
  }, { passive: true });
})();
