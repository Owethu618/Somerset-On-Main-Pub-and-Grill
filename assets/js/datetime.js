/* ==========================================================
   datetime.js (added) - live datestamp + timestamp
   Datestamp: shown only where data-show-date="true" (index.html)
   Timestamp: in the footer of every page, always the current time (SAST)
   Re-syncs to the real clock every second, so it never drifts
   or freezes, and refreshes when the tab/window comes back.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const dateEl = document.getElementById('datestamp');
  const timeEl = document.getElementById('timestamp');
  const showDate = !!dateEl;                     // datestamp only exists on index.html
  const zone = 'Africa/Johannesburg';

  const dateFormat = new Intl.DateTimeFormat('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: zone
  });
  const timeFormat = new Intl.DateTimeFormat('en-ZA', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: zone
  });

  let timer;

  const update = () => {
    const now = new Date();                       // read the real clock every time
    if (showDate && dateEl) dateEl.textContent = dateFormat.format(now);
    if (timeEl) timeEl.textContent = timeFormat.format(now) + ' SAST';

    // schedule the next update for the start of the next real second
    clearTimeout(timer);
    timer = setTimeout(update, 1000 - now.getMilliseconds() + 5);
  };

  update();

  // refresh immediately when the visitor returns to the tab or window
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  window.addEventListener('focus', update);
  window.addEventListener('pageshow', update);
});
