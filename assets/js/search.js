/* ==========================================================
   search.js  -  Menu search
   Used on: Menu page (pages/menu.html)

   The page has:
     <input id="menuSearch">           - the search box
     <article class="menu-card">       - every dish (name in <h4>, description in <p>)
     <section class="menu-category">   - Starters, Salads, Main meals, Cocktails
   Typing in the box shows only the dishes that match what was typed.
   - Every word typed must appear in the dish name, description or category,
     so "chicken salad" finds the chicken salad.
   - Capital letters and accents do not matter.
   - Typing a category name (e.g. "salads") shows that whole category.
   - Categories with no matching dishes are hidden.
   ========================================================== */

(function () {
  'use strict';

  const searchBox = document.getElementById('menuSearch');
  if (!searchBox) return; // only runs on the menu page

  const clearBtn   = document.getElementById('clearSearch');
  const statusEl   = document.getElementById('searchStatus');
  const noResults  = document.getElementById('noResults');
  const resetBtn   = document.getElementById('resetFilters');
  const cards      = Array.from(document.querySelectorAll('.menu-card'));
  const categories = Array.from(document.querySelectorAll('.menu-category'));
  const menuNav    = document.querySelector('.menu-nav');

  // lower-case and remove accents so "Crème" matches "creme"
  function normalise(text) {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Pre-compute the searchable text of every card once
  const cardText = new Map();
  cards.forEach(function (card) {
    cardText.set(card, normalise(card.textContent));
  });

  // The heading text of each category (e.g. "a little something starters 05 favourites")
  const categoryText = new Map();
  categories.forEach(function (cat) {
    const heading = cat.querySelector('.menu-category__heading');
    categoryText.set(cat, normalise(heading ? heading.textContent : ''));
  });

  function applySearch() {
    const raw = searchBox.value.trim();
    const words = normalise(raw).split(/\s+/).filter(Boolean);
    let visibleCards = 0;
    let visibleCategories = 0;

    categories.forEach(function (cat) {
      const catCards = Array.from(cat.querySelectorAll('.menu-card'));
      const catMatches = words.length > 0 && words.every(function (w) {
        return categoryText.get(cat).indexOf(w) !== -1;
      });
      let shown = 0;

      catCards.forEach(function (card) {
        const text = cardText.get(card);
        const match = words.length === 0 || catMatches ||
          words.every(function (w) { return text.indexOf(w) !== -1; });
        card.hidden = !match;
        if (match) shown++;
      });

      // A category with no cards (the cocktail poster) stays visible when
      // nothing is typed, or when its own name matches the search.
      const isPosterOnly = catCards.length === 0;
      const showCategory = isPosterOnly ? (words.length === 0 || catMatches) : shown > 0;
      cat.hidden = !showCategory;

      visibleCards += shown;
      if (showCategory) visibleCategories++;

      // keep the "05 favourites" label correct while searching
      const count = cat.querySelector('.menu-category__count');
      if (count && catCards.length) {
        if (!count.dataset.original) count.dataset.original = count.textContent;
        count.textContent = words.length === 0
          ? count.dataset.original
          : shown + (shown === 1 ? ' match' : ' matches');
      }
    });

    const nothing = words.length > 0 && visibleCards === 0 && visibleCategories === 0;
    noResults.hidden = !nothing;
    if (menuNav) menuNav.hidden = nothing;
    clearBtn.hidden = raw === '';

    if (words.length === 0) {
      statusEl.textContent = '';
    } else if (nothing) {
      statusEl.textContent = 'No items found for "' + raw + '".';
    } else {
      const n = visibleCards;
      statusEl.textContent = n > 0
        ? 'Showing ' + n + (n === 1 ? ' item' : ' items') + ' for "' + raw + '".'
        : 'Showing the ' + raw + ' section.';
    }
  }

  function clearSearch() {
    searchBox.value = '';
    applySearch();
    searchBox.focus();
  }

  searchBox.addEventListener('input', applySearch);
  searchBox.addEventListener('search', applySearch); // the browser's own clear (x) button
  searchBox.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') e.preventDefault(); // never reload the page
    if (e.key === 'Escape' && searchBox.value) clearSearch();
  });
  clearBtn.addEventListener('click', clearSearch);
  if (resetBtn) resetBtn.addEventListener('click', clearSearch);

  applySearch();
})();
