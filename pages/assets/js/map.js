/* ==========================================================
   map.js  -  Interactive map (Leaflet + OpenStreetMap)
   Used on: Contact Us

   Features: zoom / drag, marker with pop-up, street + satellite layers,
   "Get directions" link, "Show my location" (with distance), "Reset view".
   If the Leaflet library cannot load (e.g. no internet) the page falls
   back to the plain Google Maps embed so the visitor still sees a map.
   ========================================================== */

(function () {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  // Somerset On Main, Main Street, Somerset East (KwaNojoli)
  const RESTAURANT = { lat: -32.719207, lng: 25.584974 };
  const START_ZOOM = 16;

  const GOOGLE_EMBED =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3356.7523930555667!2d25.58497417546863!3d-32.719206673687914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e7ccc13959457f7%3A0xebe735cb7b68ce76!2sSomerset%20on%20Main!5e0!3m2!1sen!2sza';

  // Fallback: show the Google embed if Leaflet (the map library) did not load
  if (typeof L === 'undefined') {
    mapDiv.innerHTML =
      '<iframe title="Map showing Somerset On Main Pub and Grill, Main Street, Somerset East" src="' + GOOGLE_EMBED +
      '" width="100%" height="100%" style="border:0" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
    return;
  }

  /* ----- create the map ----- */
  const map = L.map(mapDiv, { scrollWheelZoom: false }).setView([RESTAURANT.lat, RESTAURANT.lng], START_ZOOM);

  // Two base layers the visitor can switch between
  const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    });

  L.control.layers({ 'Street map': streets, 'Satellite': satellite }).addTo(map);
  L.control.scale().addTo(map);

  /* ----- marker + pop-up ----- */
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=' + RESTAURANT.lat + ',' + RESTAURANT.lng;

  const marker = L.marker([RESTAURANT.lat, RESTAURANT.lng], { title: 'Somerset On Main Pub and Grill' }).addTo(map);
  marker.bindPopup(
    '<strong>Somerset "On Main" Pub &amp; Grill</strong><br>' +
    'Main Street, Somerset East<br>KwaNojoli, Eastern Cape<br>' +
    '<a href="tel:+27422431925">042 243 1925</a><br>' +
    '<a href="' + directionsUrl + '" target="_blank" rel="noopener">Get directions &rarr;</a>'
  ).openPopup();

  /* ----- scroll-wheel zoom only after the visitor clicks the map
         (so the page can still be scrolled normally) ----- */
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());

  /* ----- buttons under the map ----- */
  const directionsBtn = document.getElementById('mapDirections');
  const resetBtn = document.getElementById('mapReset');
  const locateBtn = document.getElementById('mapLocate');
  const info = document.getElementById('mapInfo');

  if (directionsBtn) directionsBtn.href = directionsUrl;

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      map.setView([RESTAURANT.lat, RESTAURANT.lng], START_ZOOM);
      marker.openPopup();
    });
  }

  let userLayer = null;

  if (locateBtn) {
    locateBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        info.textContent = 'Your browser does not support location services.';
        return;
      }
      info.textContent = 'Finding your location...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const here = L.latLng(position.coords.latitude, position.coords.longitude);
          const there = L.latLng(RESTAURANT.lat, RESTAURANT.lng);
          const km = (here.distanceTo(there) / 1000).toFixed(1); // Leaflet works out the distance in metres

          if (userLayer) map.removeLayer(userLayer);
          userLayer = L.circleMarker(here, { radius: 8, color: '#c9762f', fillOpacity: 0.8 })
            .addTo(map).bindPopup('You are here');
          map.fitBounds(L.latLngBounds([here, there]).pad(0.3)); // zoom so both points are visible
          info.textContent = 'You are about ' + km + ' km from Somerset On Main.';
        },
        () => {
          info.textContent = 'We could not get your location. Please allow location access and try again.';
        },
        { timeout: 10000 }
      );
    });
  }
})();
