document.addEventListener('DOMContentLoaded', () => {
  const heroPhoto = document.querySelector('.home-hero-photo');
  const heroImage = heroPhoto?.querySelector('img');

  if (heroPhoto && heroImage) {
    const slides = [
      {
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=85',
        fullImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=85',
        alt: 'Warmly lit restaurant dining room'
      },
      {
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
        fullImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
        alt: 'Inviting restaurant interior with tables ready for guests'
      },
      {
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=85',
        fullImage: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1600&q=85',
        alt: 'Grilled steak served with vegetables'
      },
      {
        image: 'https://images.pexels.com/photos/11160096/pexels-photo-11160096.jpeg?auto=compress&cs=tinysrgb&w=1200',
        fullImage: 'https://images.pexels.com/photos/11160096/pexels-photo-11160096.jpeg?auto=compress&cs=tinysrgb&w=1600',
        alt: 'Crispy fried calamari served with dipping sauces'
      },
      {
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=85',
        fullImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=85',
        alt: 'Cocktail served with citrus and fresh herbs'
      }
    ];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let currentSlide = 0;

    slides.forEach(({ image }) => {
      const preload = new Image();
      preload.src = image;
    });

    const showNextSlide = () => {
      currentSlide = (currentSlide + 1) % slides.length;
      const slide = slides[currentSlide];
      heroImage.classList.add('is-transitioning');

      window.setTimeout(() => {
        heroImage.src = slide.image;
        heroImage.alt = slide.alt;
        heroPhoto.href = slide.fullImage;
        heroPhoto.setAttribute('aria-label', `Open ${slide.alt.toLowerCase()} photo`);
        heroImage.classList.remove('is-transitioning');
      }, 350);
    };

    if (!reducedMotion.matches) {
      window.setInterval(() => {
        if (!document.hidden && !heroPhoto.matches(':hover, :focus-within')) {
          showNextSlide();
        }
      }, 5000);
    }
  }

  const forms = document.querySelectorAll('form');

  const localDateString = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
  };

  const setFieldError = (field, message) => {
    field.setAttribute('aria-invalid', 'true');
    field.closest('.form-field')?.classList.add('has-error');

    let errorNode = field.nextElementSibling;
    if (!errorNode?.classList.contains('field-error')) {
      errorNode = document.createElement('span');
      errorNode.className = 'field-error';
      errorNode.id = `${field.id || field.name}-error`;
      errorNode.setAttribute('role', 'alert');
      field.insertAdjacentElement('afterend', errorNode);
    }

    errorNode.textContent = message;
    field.setAttribute('aria-describedby', errorNode.id);
  };

  const clearFieldError = (field) => {
    field.removeAttribute('aria-invalid');
    field.closest('.form-field')?.classList.remove('has-error');

    const errorNode = field.nextElementSibling;
    if (errorNode?.classList.contains('field-error')) {
      field.removeAttribute('aria-describedby');
      errorNode.remove();
    }
  };

  const validateField = (field) => {
    if (field.disabled || field.closest('[hidden]')) {
      clearFieldError(field);
      return true;
    }

    const value = field.value.trim();
    const type = field.type;

    if (field.required && (type === 'file' ? !field.files.length : value === '')) {
      setFieldError(field, 'This field is required.');
      return false;
    }

    if (type === 'date' && field.min && value && value < field.min) {
      setFieldError(field, 'Please select today or a future date.');
      return false;
    }

    if (!value && type !== 'file') {
      clearFieldError(field);
      return true;
    }

    if (field.validity.typeMismatch) {
      setFieldError(field, type === 'email' ? 'Enter a valid email address.' : 'Enter a valid value.');
      return false;
    }

    if (field.validity.patternMismatch) {
      setFieldError(field, 'Please enter a valid phone number.');
      return false;
    }

    if (field.validity.tooShort) {
      setFieldError(field, `Please enter at least ${field.minLength} characters.`);
      return false;
    }

    if (field.validity.rangeUnderflow) {
      setFieldError(field, `Enter a value of at least ${field.min}.`);
      return false;
    }

    if (field.validity.rangeOverflow) {
      setFieldError(field, `Enter a value no greater than ${field.max}.`);
      return false;
    }

    if (type === 'file' && field.files.length > 0) {
      const file = field.files[0];
      const allowedExtensions = (field.accept || '')
        .split(',')
        .map((extension) => extension.trim().toLowerCase())
        .filter((extension) => extension.startsWith('.'));
      const extension = `.${file.name.split('.').pop().toLowerCase()}`;

      if (allowedExtensions.length && !allowedExtensions.includes(extension)) {
        setFieldError(field, `Choose a file in one of these formats: ${allowedExtensions.join(', ')}.`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFieldError(field, 'Choose a file smaller than 10 MB.');
        return false;
      }
    }

    clearFieldError(field);
    return true;
  };

  forms.forEach((form) => {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    const eventType = form.querySelector('#event_type');
    const otherEventType = form.querySelector('#other_event_type');
    const otherEventField = form.querySelector('#other-event-field');

    form.querySelectorAll('input[type="date"]').forEach((field) => {
      field.min = localDateString();
    });

    const updateHoverLabel = (field) => {
      const label = field.labels?.[0];
      if (!label) return;

      const empty = field.type === 'file'
        ? field.files.length === 0
        : field.value.trim() === '';

      if (empty && field.required) {
        field.title = label.textContent.replace('*', '').trim();
      } else {
        field.removeAttribute('title');
      }
    };

    const updateOtherEventField = () => {
      if (!eventType || !otherEventType) return;

      const isOther = eventType.value.toLowerCase() === 'other';
      if (otherEventField) {
        otherEventField.hidden = !isOther;
      } else {
        otherEventType.hidden = !isOther;
      }
      otherEventType.required = isOther;

      if (!isOther) {
        otherEventType.value = '';
        clearFieldError(otherEventType);
      }
      updateHoverLabel(otherEventType);
    };

    fields.forEach((field) => {
      updateHoverLabel(field);
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        updateHoverLabel(field);
        if (field.hasAttribute('aria-invalid')) validateField(field);
      });
      field.addEventListener('change', () => {
        updateHoverLabel(field);
        if (field.hasAttribute('aria-invalid') || field.type === 'date') {
          validateField(field);
        }
        if (field === eventType) updateOtherEventField();
      });
    });

    updateOtherEventField();

    form.addEventListener('submit', (event) => {
      let formIsValid = true;
      let firstInvalidField;

      fields.forEach((field) => {
        if (!validateField(field)) {
          formIsValid = false;
          firstInvalidField ||= field;
        }
      });

      if (!formIsValid) {
        event.preventDefault();
        firstInvalidField?.focus();
        return;
      }

      if (form.hasAttribute('data-local-only')) {
        event.preventDefault();
        const statusMessage = document.createElement('p');
        statusMessage.className = 'form-status';
        statusMessage.setAttribute('role', 'status');
        statusMessage.setAttribute('tabindex', '-1');
        statusMessage.textContent = 'Your details are valid, but this website form is not connected to an online submission service. No information was sent. Please call 042 243 1925 to contact the restaurant.';

        form.parentElement.querySelector('.form-status')?.remove();
        form.insertAdjacentElement('afterend', statusMessage);
        statusMessage.focus();
      }
    });
  });
});

/* ==========================================================
   search.js  -  Menu search + category filter (dynamic content)
   Used on: Menu page

   The page has:
     <input id="menuSearch">                     - the search box
     <button class="filter-btn" data-filter="..."> - category buttons
     <article class="dish" data-category="..."> - every dish / cocktail
   Typing or clicking a button shows only the dishes that match BOTH
   the search text and the chosen category.
   ========================================================== */

(function () {
  const searchBox = document.getElementById('menuSearch');
  if (!searchBox) return; // only runs on the menu page

  const clearBtn = document.getElementById('clearSearch');
  const statusEl = document.getElementById('searchStatus');
  const noResults = document.getElementById('noResults');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const dishes = document.querySelectorAll('.dish');
  const sections = document.querySelectorAll('.menu-group');

  let activeCategory = 'all';

  function applyFilters() {
    const term = searchBox.value.trim().toLowerCase();
    let visibleCount = 0;

    dishes.forEach((dish) => {
      const matchesCategory = activeCategory === 'all' || dish.dataset.category === activeCategory;
      // search both the dish name and its description
      const matchesText = term === '' || dish.textContent.toLowerCase().includes(term);
      const show = matchesCategory && matchesText;
      dish.hidden = !show;
      if (show) visibleCount++;
    });

    // hide a whole heading (e.g. "Salads") when none of its dishes are showing
    sections.forEach((section) => {
      const anyVisible = section.querySelector('.dish:not([hidden])') !== null;
      section.hidden = !anyVisible;
    });

    // hide "Food Menu" / "Drinks" headings when none of their groups are showing
    document.querySelectorAll('.menu-heading').forEach((heading) => {
      let el = heading.nextElementSibling;
      let anyVisible = false;
      while (el && !el.classList.contains('menu-heading')) {
        if (el.classList.contains('menu-group') && !el.hidden) anyVisible = true;
        el = el.nextElementSibling;
      }
      heading.hidden = !anyVisible;
    });

    clearBtn.hidden = term === '';
    noResults.hidden = visibleCount !== 0;

    // live message for screen readers and sighted users
    if (visibleCount === 0) {
      statusEl.textContent = 'No items found.';
    } else {
      statusEl.textContent = 'Showing ' + visibleCount + (visibleCount === 1 ? ' item' : ' items') +
        (term ? ' for "' + searchBox.value.trim() + '"' : '') + '.';
    }
  }

  // search as the visitor types
  searchBox.addEventListener('input', applyFilters);

  clearBtn.addEventListener('click', () => {
    searchBox.value = '';
    applyFilters();
    searchBox.focus();
  });

  // category buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.filter;
      filterButtons.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });
      applyFilters();
    });
  });

  // the "Reset" link inside the no-results message
  document.getElementById('resetFilters').addEventListener('click', () => {
    searchBox.value = '';
    filterButtons[0].click(); // "All"
  });

  applyFilters();
})();



/* ==========================================================
   Accordion (added) - toggles every .accordion-btn panel
   Used on: Enquiry and Event Booking pages
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.accordion-btn').forEach((button) => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    button.addEventListener('click', () => {
      const willOpen = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(willOpen));
      panel.hidden = !willOpen;
    });
  });
});
