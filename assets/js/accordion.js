/* ==========================================================
   accordion.js  -  Accordion (FAQ) buttons
   Used on: Enquiry page

   HOW IT WORKS
   Each question is a <button class="accordion"> followed by its answer
   in a <div class="panel">. Clicking the button opens that answer;
   clicking it again closes it. Only one answer is open at a time.
   The buttons can also be used with the keyboard (Tab, Enter, Space).
   ========================================================== */

(function () {
  'use strict';

  const buttons = Array.from(document.querySelectorAll('button.accordion'));
  if (buttons.length === 0) return; // nothing to do on pages without an accordion

  function setOpen(button, open) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', String(open));
    button.classList.toggle('active', open);
    if (panel) panel.hidden = !open;
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      const willOpen = button.getAttribute('aria-expanded') !== 'true';
      buttons.forEach(function (other) { setOpen(other, false); }); // close all
      setOpen(button, willOpen);                                     // then open this one
    });
  });
})();
