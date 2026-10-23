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
