/* ==========================================================
   main.js  -  runs on EVERY page
   1. Hamburger navigation
   2. Dynamic content: live clock, date stamp, greeting, open/closed status
   3. Accordion (used on the Enquiry page FAQ)
   4. Back-to-top button
   ========================================================== */

/* ---------- 1. HAMBURGER NAVIGATION ---------- */
// NOTE: the class on the links container is "navbar__links"
// (the old code looked for ".nav-links", which did not exist and caused an error)
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navbar__links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', isOpen);          // animates the 3 bars into an X
    hamburger.setAttribute('aria-expanded', String(isOpen)); // tells screen readers the state
  });

  // Close the menu when a link is clicked or when Escape is pressed
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });
}

/* ---------- 2. DYNAMIC CONTENT ---------- */

// Opening hours (24h clock). Day numbers: 0 = Sunday ... 6 = Saturday
// These match the hours listed on the Contact Us page.
const OPENING_HOURS = {
  0: { open: 10, close: 20 }, // Sunday
  1: { open: 11, close: 22 }, // Monday
  2: { open: 11, close: 22 },
  3: { open: 11, close: 22 },
  4: { open: 11, close: 22 },
  5: { open: 11, close: 22 }, // Friday
  6: { open: 10, close: 23 }  // Saturday
};

// Get the current day/hour in South Africa (SAST), whatever the visitor's own time zone is
function getRestaurantNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day: dayIndex, hour: parseInt(get('hour'), 10) % 24, minute: parseInt(get('minute'), 10) };
}

const pad = (n) => String(n).padStart(2, '0');

// "Open now - closes 22:00" / "Closed - opens tomorrow at 11:00"
function updateOpenStatus() {
  const targets = document.querySelectorAll('[data-open-status]');
  if (targets.length === 0) return;

  const now = getRestaurantNow();
  const today = OPENING_HOURS[now.day];
  const minutesNow = now.hour * 60 + now.minute;
  let message;
  let isOpen = false;

  if (minutesNow >= today.open * 60 && minutesNow < today.close * 60) {
    isOpen = true;
    message = 'We are open now – closing at ' + pad(today.close) + ':00';
  } else if (minutesNow < today.open * 60) {
    message = 'We are closed – opening today at ' + pad(today.open) + ':00';
  } else {
    const tomorrow = OPENING_HOURS[(now.day + 1) % 7];
    message = 'We are closed – opening tomorrow at ' + pad(tomorrow.open) + ':00';
  }

  targets.forEach((el) => {
    el.textContent = message;
    el.classList.toggle('is-open', isOpen);
    el.classList.toggle('is-closed', !isOpen);
  });
}

// Live clock in the footer (updates every second)
function displayTime() {
  const clock = document.getElementById('time');
  if (!clock) return;
  const now = new Date();
  clock.textContent = 'Local time: ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}

// Date stamp on the home page
function displayDate() {
  const stamp = document.getElementById('datestamp');
  if (!stamp) return;
  stamp.textContent = "Today's Date: " + new Date().toDateString();
}

// Greeting that changes with the time of day (home page)
function displayGreeting() {
  const greeting = document.getElementById('greeting');
  if (!greeting) return;
  const hour = new Date().getHours();
  let text = 'Good evening';
  if (hour < 12) text = 'Good morning';
  else if (hour < 18) text = 'Good afternoon';
  greeting.textContent = text + ' and welcome to Somerset "On Main"!';
}

displayDate();
displayGreeting();
displayTime();
updateOpenStatus();
setInterval(displayTime, 1000);        // clock ticks every second
setInterval(updateOpenStatus, 60000);  // open/closed status re-checked every minute

/* ---------- 3. ACCORDION ---------- */
// Any <button class="accordion"> toggles the panel that follows it
document.querySelectorAll('.accordion').forEach((button) => {
  button.addEventListener('click', () => {
    const panel = button.nextElementSibling;
    const willOpen = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(willOpen));
    button.classList.toggle('active', willOpen);
    panel.hidden = !willOpen;
  });
});

/* ---------- 4. BACK-TO-TOP BUTTON ---------- */
const topButton = document.createElement('button');
topButton.type = 'button';
topButton.className = 'back-to-top';
topButton.setAttribute('aria-label', 'Back to top');
topButton.innerHTML = '&#8679;';
document.body.appendChild(topButton);

window.addEventListener('scroll', () => {
  topButton.classList.toggle('visible', window.scrollY > 300);
});
topButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
