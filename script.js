// The email address that receives messages from the Contact, Enquiry and Event Booking forms.
// Change it here, in ONE place.
const RECEIVER_EMAIL = 'owethumanene26@gmail.com';

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

      // The form is valid: build an email to RECEIVER_EMAIL from everything the visitor typed
      event.preventDefault();

      const pageName = location.pathname.split('/').pop().replace('.html', '');
      const subjects = {
        contact: 'Website message',
        enquiry: 'Website enquiry',
        eventbooking: 'Event booking request'
      };
      const lines = [];
      let who = '';

      fields.forEach((field) => {
        if (field.type === 'submit' || field.type === 'button' || field.closest('[hidden]')) return;
        const label = (field.labels?.[0]?.textContent || field.name)
          .replace('*', '').replace('(optional)', '').trim();
        let value = field.value.trim();
        if (field.tagName === 'SELECT') value = field.options[field.selectedIndex]?.text || '';
        if (field.type === 'checkbox') value = field.checked ? 'Yes' : 'No';
        if (value === '') return;
        lines.push(label + ': ' + value);
        if (!who && /name|contact_person|organization/.test(field.name) && field.name !== 'organization') who = value;
      });

      const subject = (subjects[pageName] || 'Website form') + (who ? ' - ' + who : '');
      const mailto = 'mailto:' + RECEIVER_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n\n'));

      const statusMessage = document.createElement('p');
      statusMessage.className = 'form-status';
      statusMessage.setAttribute('role', 'status');
      statusMessage.setAttribute('tabindex', '-1');
      statusMessage.innerHTML =
        'Thank you! Your email app should open now with your message ready - just press <strong>Send</strong>. ' +
        'If nothing opened, <a href="' + mailto + '">click here to send it</a>, ' +
        'or email us directly at <strong>' + RECEIVER_EMAIL + '</strong>.';

      form.parentElement.querySelector('.form-status')?.remove();
      form.insertAdjacentElement('afterend', statusMessage);
      statusMessage.focus();

      window.location.href = mailto; // opens the visitor's email app
    });
  });
});
