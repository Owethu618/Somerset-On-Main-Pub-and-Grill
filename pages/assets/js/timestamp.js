/* ==========================================================
   timestamp.js  -  Datestamp (top of index.html) and live timestamp
                    (bottom of About, Contact, Enquiry, Event Booking, Menu)

   Fills in these elements if they exist on the page:
     <span id="datestamp">   ->  Friday, 30 October 2026
     <time id="timestamp">   ->  Friday, 30 October 2026 · 15:41:07  (updates every second)
   The date and time come from the visitor's own device clock.
   ========================================================== */

(function () {
  'use strict';

  const dateEl = document.getElementById('datestamp');
  const timeEl = document.getElementById('timestamp');
  if (!dateEl && !timeEl) return;

  const dateFormat = new Intl.DateTimeFormat('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeFormat = new Intl.DateTimeFormat('en-ZA', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  function update() {
    const now = new Date();
    const dateText = dateFormat.format(now);
    if (dateEl) {
      dateEl.textContent = dateText;
      if (dateEl.tagName === 'TIME') dateEl.setAttribute('datetime', now.toISOString().slice(0, 10));
    }
    if (timeEl) {
      timeEl.textContent = dateText + ' · ' + timeFormat.format(now);
      timeEl.setAttribute('datetime', now.toISOString());
    }
  }

  update();
  if (timeEl) setInterval(update, 1000); // the date alone never needs refreshing
})();
