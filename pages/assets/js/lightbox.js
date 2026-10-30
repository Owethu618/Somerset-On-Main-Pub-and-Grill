/* ==========================================================
   lightbox.js  -  Image lightbox for EVERY page
   Used on: index, about, menu, contact, enquiry, eventbooking

   HOW IT WORKS
   - Every <img> inside <main> automatically opens in the lightbox when
     it is clicked (or when its link is clicked, e.g. the menu photos).
     You do NOT need to add any special attributes to your images.
   - All the images on ONE page form ONE gallery, so the visitor can
     move between them with the Previous / Next buttons.
   - Images in the header, navigation and footer (your logo) are skipped
     so the logo still takes visitors back to the home page.
   - To exclude any other image, give it:  data-no-lightbox
   - To show a nicer caption, give the <img> or its link:  data-caption="Text"

   CONTROLS
   Close button (X), click the dark background, Esc key,
   Previous / Next buttons, left / right arrow keys, swipe on touch screens.
   ========================================================== */

(function () {
  'use strict';

  /* ----- 1. Which images are allowed to open in the lightbox? ----- */
  const SKIP_AREAS = 'header, nav, footer, .lightbox';

  function getImages() {
    return Array.from(document.querySelectorAll('main img')).filter(function (img) {
      return !img.closest(SKIP_AREAS) && !img.hasAttribute('data-no-lightbox') &&
             img.getClientRects().length > 0; // skip images hidden by the menu search
    });
  }

  /* The big picture to show: the link's address if the image sits inside
     a link to a picture (menu photos), otherwise the image's own file. */
  function fullSource(img) {
    const link = img.closest('a[href]');
    const href = link ? link.getAttribute('href') : '';
    const looksLikeImage =
      /\.(avif|webp|jpe?g|png|gif|svg)(\?|#|$)/i.test(href) ||
      /images\.(unsplash|pexels)\.com/i.test(href);
    return looksLikeImage ? link.href : (img.currentSrc || img.src);
  }

  function captionFor(img) {
    const link = img.closest('a[data-caption]');
    return img.dataset.caption || (link && link.dataset.caption) || img.alt || '';
  }

  /* ----- 2. Build the overlay once ----- */
  let overlay, imgEl, captionEl, counterEl, errorEl, loaderEl, closeBtn, prevBtn, nextBtn;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.hidden = true;
    overlay.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Close image viewer">&times;</button>' +
      '<button type="button" class="lightbox__nav lightbox__prev" aria-label="Previous image">&#10094;</button>' +
      '<figure class="lightbox__figure">' +
        '<div class="lightbox__stage">' +
          '<div class="lightbox__loader" aria-hidden="true"></div>' +
          '<img class="lightbox__img" alt="">' +
          '<p class="lightbox__error" hidden>Sorry, this image could not be loaded.</p>' +
        '</div>' +
        '<figcaption class="lightbox__caption"></figcaption>' +
        '<p class="lightbox__counter" aria-live="polite"></p>' +
      '</figure>' +
      '<button type="button" class="lightbox__nav lightbox__next" aria-label="Next image">&#10095;</button>';
    document.body.appendChild(overlay);

    imgEl     = overlay.querySelector('.lightbox__img');
    captionEl = overlay.querySelector('.lightbox__caption');
    counterEl = overlay.querySelector('.lightbox__counter');
    errorEl   = overlay.querySelector('.lightbox__error');
    loaderEl  = overlay.querySelector('.lightbox__loader');
    closeBtn  = overlay.querySelector('.lightbox__close');
    prevBtn   = overlay.querySelector('.lightbox__prev');
    nextBtn   = overlay.querySelector('.lightbox__next');

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(index - 1); });
    nextBtn.addEventListener('click', function () { show(index + 1); });

    // Click on the dark background (not on the picture or the buttons) closes it
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay ||
          e.target.classList.contains('lightbox__figure') ||
          e.target.classList.contains('lightbox__stage')) close();
    });

    // Swipe left / right on phones and tablets
    let touchStartX = 0;
    overlay.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      const distance = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 50) show(distance > 0 ? index - 1 : index + 1);
    }, { passive: true });
  }

  /* ----- 3. Show / open / close ----- */
  let slides = [];        // [{ src, alt, caption }] captured when the lightbox opens
  let index = 0;          // which slide is showing
  let lastFocused = null; // so focus goes back where it was when closing

  function show(i) {
    index = (i + slides.length) % slides.length; // wraps around at both ends
    const slide = slides[index];

    errorEl.hidden = true;
    imgEl.hidden = false;
    loaderEl.hidden = false;
    imgEl.classList.remove('loaded');

    imgEl.onload  = function () { loaderEl.hidden = true; imgEl.classList.add('loaded'); };
    imgEl.onerror = function () { loaderEl.hidden = true; imgEl.hidden = true; errorEl.hidden = false; };
    imgEl.src = slide.src;
    imgEl.alt = slide.alt;

    captionEl.textContent = slide.caption;
    counterEl.textContent = slides.length > 1 ? (index + 1) + ' of ' + slides.length : '';

    // Only show Previous / Next when this page has more than one picture
    prevBtn.hidden = nextBtn.hidden = slides.length < 2;

    // Pre-load the neighbouring pictures so moving feels instant
    if (slides.length > 1) {
      new Image().src = slides[(index + 1) % slides.length].src;
      new Image().src = slides[(index - 1 + slides.length) % slides.length].src;
    }
  }

  function open(clickedImg) {
    const images = getImages();
    slides = images.map(function (img) {
      return { src: fullSource(img), alt: img.alt || '', caption: captionFor(img) };
    });
    const start = images.indexOf(clickedImg);
    if (start === -1) return;

    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('no-scroll'); // stops the page scrolling behind the overlay
    show(start);
    closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove('no-scroll');
    imgEl.removeAttribute('src');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* ----- 4. Listen for clicks on ANY image (one listener for the whole page) ----- */
  function imageFromClick(target) {
    const direct = target.closest('img');
    if (direct) return getImages().indexOf(direct) !== -1 ? direct : null;

    // Click on a link that wraps a picture (e.g. the caption text on the hero photo)
    const link = target.closest('a[href]');
    const inner = link && link.querySelector('img');
    if (inner && getImages().indexOf(inner) !== -1 && link.closest('main')) return inner;
    return null;
  }

  function init() {
    buildOverlay();

    // Make the images look clickable and reachable with the keyboard
    getImages().forEach(function (img) {
      img.classList.add('lightbox-ready');
      if (!img.closest('a[href]')) {
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
      }
    });

    document.addEventListener('click', function (e) {
      if (!overlay.hidden) return;
      const img = imageFromClick(e.target);
      if (!img) return;
      e.preventDefault(); // stop links opening the picture in a new browser tab
      open(img);
    });

    document.addEventListener('keydown', function (e) {
      if (overlay.hidden) {
        // Enter or Space on a focused picture opens it
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList &&
            e.target.classList.contains('lightbox-ready') && e.target.tagName === 'IMG') {
          e.preventDefault();
          open(e.target);
        }
        return;
      }
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft'  && slides.length > 1) show(index - 1);
      else if (e.key === 'ArrowRight' && slides.length > 1) show(index + 1);
      else if (e.key === 'Tab') {
        // keep keyboard focus inside the overlay while it is open
        const focusable = Array.from(overlay.querySelectorAll('button')).filter(function (b) { return !b.hidden; });
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
