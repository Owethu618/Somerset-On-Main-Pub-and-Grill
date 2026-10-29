/* ==========================================================
   forms.js  -  Validation + processing for the 3 forms
   Used on: Enquiry (#enquiryForm), Contact Us (#contactForm),
            Event Booking (#bookingForm)

   WHAT HAPPENS WHEN A FORM IS SUBMITTED
   1. The browser's own validation is switched off (novalidate) so OUR messages show.
   2. Every field is checked against its rules (see the RULES objects below).
   3. If something is wrong: a clear message appears under that field and
      the first wrong field is focused.
   4. If everything is correct:
        - Enquiry  -> a confirmation panel appears on the page (reference number,
                      summary and a reply message based on the enquiry type).
        - Contact  -> the visitor's email app opens with the message already written
                      (mailto:) and a confirmation is shown.
        - Booking  -> same as Contact, with the booking details.
   ========================================================== */

// The email address that receives the messages. Change it in ONE place.
const RECEIVER_EMAIL = 'owethumanene26@gmail.com';

/* ---------- small helper functions ---------- */

// Letters (any language), spaces, hyphens and apostrophes. 2 - 50 characters.
const NAME_PATTERN = /^[\p{L}][\p{L} '\-]{1,49}$/u;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// South African numbers: 0821234567 or +27821234567 (spaces, brackets and dashes are ignored)
const PHONE_PATTERN = /^(\+27|0)[1-9][0-9]{8}$/;

function cleanPhone(value) {
  return value.replace(/[\s\-()]/g, '');
}

function showError(field, message) {
  const errorEl = document.getElementById(field.id + '-error') ||
                  document.getElementById(field.name + '-error');
  if (errorEl) errorEl.textContent = message;
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  field.classList.toggle('input-error', Boolean(message));
}

// Returns an error message (string) or '' when the field is fine
function checkText(field, label, options) {
  const value = field.value.trim();
  if (options.required && value === '') return label + ' is required.';
  if (value === '') return ''; // optional and empty is fine

  if (options.type === 'name' && !NAME_PATTERN.test(value)) {
    return label + ' must be 2–50 letters (no numbers or symbols).';
  }
  if (options.type === 'email' && !EMAIL_PATTERN.test(value)) {
    return 'Please enter a valid email address, e.g. name@example.com.';
  }
  if (options.type === 'phone' && !PHONE_PATTERN.test(cleanPhone(value))) {
    return 'Please enter a valid South African number, e.g. 082 123 4567.';
  }
  if (options.min && value.length < options.min) {
    return label + ' must be at least ' + options.min + ' characters (you have ' + value.length + ').';
  }
  if (options.max && value.length > options.max) {
    return label + ' must be ' + options.max + ' characters or fewer.';
  }
  return '';
}

/* ---------- the generic form engine ----------
   rules = [ { id:'name', label:'Name', kind:'text', type:'name', required:true }, ... ]
   kinds: text | select | radio | checkbox | date | time | number                      */

function setUpForm(form, rules, onValid) {
  form.setAttribute('novalidate', ''); // turn off the browser's pop-up bubbles

  function validateRule(rule) {
    let message = '';

    if (rule.kind === 'radio') {
      const checked = form.querySelector('input[name="' + rule.id + '"]:checked');
      const first = form.querySelector('input[name="' + rule.id + '"]');
      message = !checked && rule.required ? 'Please choose ' + rule.label + '.' : '';
      const errorEl = document.getElementById(rule.id + '-error');
      if (errorEl) errorEl.textContent = message;
      return { message, field: first };
    }

    const field = form.querySelector('#' + rule.id);

    if (rule.kind === 'checkbox') {
      message = rule.required && !field.checked ? rule.label : '';
    } else if (rule.kind === 'select') {
      message = rule.required && field.value === '' ? 'Please select ' + rule.label + '.' : '';
    } else if (rule.kind === 'date') {
      if (field.value === '') {
        message = rule.required ? rule.label + ' is required.' : '';
      } else {
        // compare as text: "2026-10-24" >= "2026-10-23" works because of the YYYY-MM-DD format
        const today = new Date();
        const todayText = today.getFullYear() + '-' + zeroPad(today.getMonth() + 1) + '-' + zeroPad(today.getDate());
        if (field.value < todayText) message = 'The date cannot be in the past.';
      }
    } else if (rule.kind === 'time') {
      if (field.value === '') {
        message = rule.required ? rule.label + ' is required.' : '';
      } else if (field.value < '10:00' || field.value > '22:00') {
        message = 'Please choose a time between 10:00 and 22:00.';
      }
    } else if (rule.kind === 'number') {
      const n = Number(field.value);
      if (field.value === '') message = rule.required ? rule.label + ' is required.' : '';
      else if (!Number.isInteger(n) || n < rule.min || n > rule.max) {
        message = rule.label + ' must be a whole number from ' + rule.min + ' to ' + rule.max + '.';
      }
    } else {
      message = checkText(field, rule.label, rule);
    }

    showError(field, message);
    return { message, field };
  }

  // validate a field when the visitor leaves it, and re-check as they fix it
  rules.forEach((rule) => {
    const elements = rule.kind === 'radio'
      ? form.querySelectorAll('input[name="' + rule.id + '"]')
      : [form.querySelector('#' + rule.id)];
    elements.forEach((el) => {
      el.addEventListener('blur', () => validateRule(rule));
      el.addEventListener('change', () => validateRule(rule));
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') validateRule(rule);
      });
    });
  });

  // live character counters on textareas  (<span class="char-count" data-for="message">)
  form.querySelectorAll('.char-count').forEach((counter) => {
    const box = form.querySelector('#' + counter.dataset.for);
    const update = () => { counter.textContent = box.value.length + ' / ' + box.maxLength; };
    box.addEventListener('input', update);
    update();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // we handle the sending ourselves

    let firstBad = null;
    let problems = 0;
    rules.forEach((rule) => {
      const result = validateRule(rule);
      if (result.message) {
        problems++;
        if (!firstBad) firstBad = result.field;
      }
    });

    const summary = form.querySelector('.form-summary');
    if (problems > 0) {
      if (summary) {
        summary.textContent = 'Please fix the ' + problems + (problems === 1 ? ' problem' : ' problems') + ' marked below and try again.';
        summary.hidden = false;
      }
      firstBad.focus();
      return;
    }

    if (summary) summary.hidden = true;
    onValid(); // everything is correct, carry on
  });

  // return a helper so the handlers can read values easily
  return {
    value: (id) => (form.querySelector('#' + id) ? form.querySelector('#' + id).value.trim() : ''),
    radio: (name) => {
      const picked = form.querySelector('input[name="' + name + '"]:checked');
      return picked ? picked.value : '';
    },
    checked: (id) => form.querySelector('#' + id).checked
  };
}

function zeroPad(n) { return String(n).padStart(2, '0'); }

// Builds a mailto: link with the subject and body already filled in
function buildMailto(subject, lines) {
  return 'mailto:' + RECEIVER_EMAIL +
    '?subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(lines.join('\n'));
}

// Escapes text before putting it in the page (stops people injecting HTML)
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function makeReference(prefix) {
  const d = new Date();
  return prefix + '-' + d.getFullYear() + zeroPad(d.getMonth() + 1) + zeroPad(d.getDate()) + '-' +
    Math.floor(1000 + Math.random() * 9000);
}

/* ==========================================================
   ENQUIRY FORM  -  shows a response on the page
   ========================================================== */
(function () {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const rules = [
    { id: 'name', label: 'Your name', kind: 'text', type: 'name', required: true },
    { id: 'email', label: 'Email address', kind: 'text', type: 'email', required: true },
    { id: 'phone', label: 'Phone number', kind: 'text', type: 'phone', required: false },
    { id: 'enquiryType', label: 'a type of enquiry', kind: 'select', required: true },
    { id: 'contactMethod', label: 'how we should reply', kind: 'radio', required: true },
    { id: 'message', label: 'Your message', kind: 'text', required: true, min: 10, max: 200 },
    { id: 'consent', label: 'Please tick the box so we may reply to you.', kind: 'checkbox', required: true }
  ];

  // a different reply message for each enquiry type
  const REPLIES = {
    general: 'A team member will get back to you with an answer to your question.',
    events: 'Our events team will contact you about dates and availability. You can also use the Event Booking page to book directly.',
    menu: 'We will answer your food and drinks question. Our full menu is on the Menu page.',
    feedback: 'Thank you for helping us improve one stride at a time. The owner will read your feedback personally.'
  };

  const response = document.getElementById('enquiryResponse');
  const form$ = setUpForm(form, rules, () => {
    const typeSelect = document.getElementById('enquiryType');
    const typeText = typeSelect.options[typeSelect.selectedIndex].text;
    const reference = makeReference('ENQ');
    const method = form$.radio('contactMethod');

    const subject = 'Website enquiry ' + reference + ' - ' + typeText;
    const lines = [
      'Reference: ' + reference,
      'Name: ' + form$.value('name'),
      'Email: ' + form$.value('email'),
      'Phone: ' + (form$.value('phone') || 'not given'),
      'Enquiry type: ' + typeText,
      'Preferred reply: ' + method,
      '',
      'Message:',
      form$.value('message')
    ];

    response.innerHTML =
      '<h2>Thank you, ' + esc(form$.value('name')) + '!</h2>' +
      '<p>Your enquiry has been received. Your reference number is <strong>' + reference + '</strong>.</p>' +
      '<p>' + REPLIES[typeSelect.value] + '</p>' +
      '<dl class="summary-list">' +
        '<dt>Enquiry type</dt><dd>' + esc(typeText) + '</dd>' +
        '<dt>We will reply by</dt><dd>' + esc(method) + ' (' + esc(method === 'Email' ? form$.value('email') : (form$.value('phone') || 'phone number not given – we will email you')) + ')</dd>' +
        '<dt>Your message</dt><dd>' + esc(form$.value('message')) + '</dd>' +
      '</dl>' +
      '<p>We usually reply within 1–2 business days.</p>' +
      '<p><a class="btn btn-primary" href="' + buildMailto(subject, lines) + '">Email this enquiry to us</a> ' +
      '<button type="button" class="btn btn-secondary" id="newEnquiry">Send another enquiry</button></p>';

    form.hidden = true;
    response.hidden = false;
    response.focus();

    document.getElementById('newEnquiry').addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('.char-count').forEach((c) => { c.textContent = '0 / 200'; });
      response.hidden = true;
      form.hidden = false;
      document.getElementById('name').focus();
    });
  });
})();

/* ==========================================================
   CONTACT FORM  -  sends an email (opens the visitor's email app)
   ========================================================== */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const rules = [
    { id: 'firstName', label: 'First name', kind: 'text', type: 'name', required: true },
    { id: 'surname', label: 'Surname', kind: 'text', type: 'name', required: true },
    { id: 'email', label: 'Email address', kind: 'text', type: 'email', required: true },
    { id: 'phone', label: 'Phone number', kind: 'text', type: 'phone', required: false },
    { id: 'subject', label: 'a subject', kind: 'select', required: true },
    { id: 'message', label: 'Your message', kind: 'text', required: true, min: 10, max: 300 }
  ];

  const confirmBox = document.getElementById('contactConfirm');
  const form$ = setUpForm(form, rules, () => {
    const subjectSelect = document.getElementById('subject');
    const subjectText = subjectSelect.options[subjectSelect.selectedIndex].text;
    const fullName = form$.value('firstName') + ' ' + form$.value('surname');

    const mailtoLink = buildMailto('Website contact: ' + subjectText + ' - ' + fullName, [
      'Name: ' + fullName,
      'Email: ' + form$.value('email'),
      'Phone: ' + (form$.value('phone') || 'not given'),
      'Subject: ' + subjectText,
      'Wants news & specials: ' + (form$.checked('newsletter') ? 'Yes' : 'No'),
      '',
      'Message:',
      form$.value('message')
    ]);

    confirmBox.innerHTML =
      '<strong>Thank you, ' + esc(form$.value('firstName')) + '!</strong> ' +
      'Your email app should open now with your message ready to send – just press <em>Send</em>. ' +
      'If nothing opened, <a href="' + mailtoLink + '">click here to send it</a>.';
    confirmBox.hidden = false;
    confirmBox.focus();

    window.location.href = mailtoLink; // opens the email app
    form.reset();
    form.querySelectorAll('.char-count').forEach((c) => { c.textContent = '0 / 300'; });
  });
})();

/* ==========================================================
   EVENT BOOKING FORM  -  validates, then emails the booking request
   ========================================================== */
(function () {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  // visitors cannot pick a date in the past
  const dateInput = document.getElementById('eventDate');
  const now = new Date();
  dateInput.min = now.getFullYear() + '-' + zeroPad(now.getMonth() + 1) + '-' + zeroPad(now.getDate());

  const rules = [
    { id: 'organisation', label: 'Name of organisation', kind: 'text', required: true, min: 2, max: 80 },
    { id: 'contactPerson', label: 'Contact person', kind: 'text', type: 'name', required: true },
    { id: 'cellphone', label: 'Cell phone number', kind: 'text', type: 'phone', required: true },
    { id: 'email', label: 'Email address', kind: 'text', type: 'email', required: true },
    { id: 'eventDate', label: 'Event date', kind: 'date', required: true },
    { id: 'eventTime', label: 'Event time', kind: 'time', required: true },
    { id: 'guests', label: 'Number of guests', kind: 'number', required: true, min: 1, max: 200 },
    { id: 'eventType', label: 'an event type', kind: 'select', required: true },
    { id: 'additionalInfo', label: 'Additional information', kind: 'text', required: false, max: 200 }
  ];

  const confirmBox = document.getElementById('bookingConfirm');
  const form$ = setUpForm(form, rules, () => {
    const reference = makeReference('BKG');
    const mailtoLink = buildMailto('Event booking request ' + reference + ' - ' + form$.value('organisation'), [
      'Reference: ' + reference,
      'Organisation: ' + form$.value('organisation'),
      'Contact person: ' + form$.value('contactPerson'),
      'Cell phone: ' + form$.value('cellphone'),
      'Email: ' + form$.value('email'),
      'Date: ' + form$.value('eventDate'),
      'Time: ' + form$.value('eventTime'),
      'Guests: ' + form$.value('guests'),
      'Event type: ' + form$.value('eventType'),
      '',
      'Additional information:',
      form$.value('additionalInfo') || 'none'
    ]);

    confirmBox.innerHTML =
      '<strong>Booking request ' + reference + ' captured.</strong> ' +
      'Your email app should open with the details ready – press <em>Send</em> to submit your request. ' +
      'If nothing opened, <a href="' + mailtoLink + '">click here</a>. We will confirm availability by email.';
    confirmBox.hidden = false;
    confirmBox.focus();

    window.location.href = mailtoLink;
    form.reset();
    form.querySelectorAll('.char-count').forEach((c) => { c.textContent = '0 / 200'; });
  });
})();
