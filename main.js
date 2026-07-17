// ============================================================
// NYC — Carnet de voyage — logique principale
// ============================================================

var DAY_COLORS = {
  J1: '#B23A2E', J2: '#8FB8C9', J3: '#E3A857', J4: '#7E9B76',
  J5: '#D98A88', J6: '#5B6B78', J7: '#B8802E', J8: '#4F7E92'
};

var currentDay = 'J1';
var map = null;
var dayLayers = {};

// ---------- Tabs ----------
function initTabs(){
  var buttons = document.querySelectorAll('.tab');
  for(var i=0; i<buttons.length; i++){
    buttons[i].addEventListener('click', function(){
      var target = this.dataset.tab;
      var allTabs = document.querySelectorAll('.tab');
      var allPanels = document.querySelectorAll('.tab-panel');
      for(var j=0; j<allTabs.length; j++){ allTabs[j].classList.remove('active'); }
      for(var k=0; k<allPanels.length; k++){ allPanels[k].classList.remove('active'); }
      this.classList.add('active');
      document.getElementById('tab-' + target).classList.add('active');
      if(target === 'map'){
        initMapIfNeeded();
        setTimeout(function(){ if(map){ map.invalidateSize(); } }, 80);
      }
    });
  }
}

// ---------- Day selector ----------
function initDaySelector(){
  var el = document.getElementById('daySelector');
  var html = '';
  for(var i=0; i<window.DAYS_ORDER.length; i++){
    var d = window.DAYS_ORDER[i];
    var meta = window.DAYS_META[d];
    var shortDate = meta.date.replace(' 2026','').replace('juillet','juil.');
    html += '<button class="day-btn" data-day="' + d + '" type="button">' +
      '<span class="d-num">' + d + '</span>' +
      '<span class="d-date">' + shortDate + '</span>' +
      '</button>';
  }
  el.innerHTML = html;
  var btns = el.querySelectorAll('.day-btn');
  for(var j=0; j<btns.length; j++){
    btns[j].addEventListener('click', function(){
      currentDay = this.dataset.day;
      renderDaySelectorState();
      renderTimeline(currentDay);
    });
  }
  renderDaySelectorState();
}
function renderDaySelectorState(){
  var btns = document.querySelectorAll('.day-btn');
  for(var i=0; i<btns.length; i++){
    if(btns[i].dataset.day === currentDay){ btns[i].classList.add('active'); }
    else { btns[i].classList.remove('active'); }
  }
}

// ---------- Reservation / price badges ----------
function reservationBadge(item){
  if(item.reservation_link){
    return '<a class="tag tag-resa-link" href="' + item.reservation_link + '" target="_blank" rel="noopener">🎟️ Réserver</a>';
  }
  var t = item.reservation_text;
  if(!t){ return ''; }
  if(t === 'Non'){ return '<span class="tag tag-resa-non">✔ Pas de réservation</span>'; }
  if(t === 'Oui'){ return '<span class="tag tag-resa-oui">⚠ Réservation requise</span>'; }
  return '<span class="tag tag-resa-info">ℹ ' + t + '</span>';
}
function prixBadge(item){
  if(!item.prix || item.prix === '-'){ return ''; }
  return '<span class="tag tag-prix">💰 ' + item.prix + '</span>';
}

function escapeHTML(s){
  var d = document.createElement('div');
  d.innerText = s;
  return d.innerHTML;
}

// ---------- Timeline (Tab 1) ----------
function photoBlockHTML(item, rot){
  if(item.photos && item.photos.length){
    var imgs = '';
    for(var i=0; i<item.photos.length; i++){
      imgs += '<img src="' + item.photos[i] + '" alt="' + item.activite + '" loading="lazy">';
    }
    return '<div class="card-photo gallery" style="--rot:' + rot + 'deg">' + imgs + '</div>';
  }
  if(item.photo){
    return '<div class="card-photo" style="--rot:' + rot + 'deg"><img src="' + item.photo + '" alt="' + item.activite + '" loading="lazy"></div>';
  }
  return '<div class="card-photo placeholder" style="--rot:' + rot + 'deg">🗽</div>';
}

function activityCardHTML(item, rot){
  var photo = photoBlockHTML(item, rot);

  var lieuHTML = '';
  if(item.lieu_label){
    if(item.lieu_link){
      lieuHTML = '<a class="pin-link" href="' + item.lieu_link + '" target="_blank" rel="noopener">📍 ' + item.lieu_label + '</a>';
    } else {
      lieuHTML = '<span class="plain-lieu">📍 ' + item.lieu_label + '</span>';
    }
  }

  var precisions = item.precisions ? '<p class="precisions">' + escapeHTML(item.precisions) + '</p>' : '';

  return '' +
    '<div class="activity-card">' +
      photo +
      '<div class="card-body">' +
        '<span class="stamp-time">' + (item.horaire || '') + '</span>' +
        '<h3>' + (item.activite || '') + '</h3>' +
        lieuHTML +
        precisions +
        '<div class="tags">' + reservationBadge(item) + prixBadge(item) + '</div>' +
      '</div>' +
    '</div>';
}

function renderTimeline(day){
  var items = [];
  for(var i=0; i<window.ITINERARY.length; i++){
    if(window.ITINERARY[i].jour === day){ items.push(window.ITINERARY[i]); }
  }

  var heading = document.getElementById('dayHeading');
  var meta = window.DAYS_META[day];
  heading.innerHTML = '<h2>' + meta.titre + '</h2><p>' + meta.date + '</p>';

  var container = document.getElementById('timeline');
  var html = '';
  var rot = -1.5;
  var idx = 0;
  while(idx < items.length){
    var item = items[idx];
    if(item.alt_group){
      var group = [];
      var j = idx;
      while(j < items.length && items[j].alt_group === item.alt_group){
        group.push(items[j]); j++;
      }
      rot *= -1;
      var cardA = activityCardHTML(group[0], rot);
      rot *= -1;
      var cardB = group[1] ? activityCardHTML(group[1], rot) : '';
      html += '' +
        '<div class="activity-row alt-wrapper">' +
          '<span class="stamp-time" style="margin-bottom:10px;display:inline-block;">' + (item.horaire || '') + '</span>' +
          '<div class="alt-badge">À choisir — une option ou l\'autre</div>' +
          '<div class="alt-grid">' + cardA + '<div class="alt-divider">OU</div>' + cardB + '</div>' +
        '</div>';
      idx = j;
    } else {
      rot *= -1;
      html += '<div class="activity-row">' + activityCardHTML(item, rot) + '</div>';
      idx++;
    }
  }
  container.innerHTML = html;
}

// ---------- Map (Tab 2) ----------
function initMapIfNeeded(){
  if(map){ return; }
  if(typeof L === 'undefined'){ return; }

  map = L.map('map', { scrollWheelZoom: true }).setView([40.746, -73.978], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd', maxZoom: 19
  }).addTo(map);

  for(var d=0; d<window.DAYS_ORDER.length; d++){
    dayLayers[window.DAYS_ORDER[d]] = L.layerGroup().addTo(map);
  }

  for(var i=0; i<window.ITINERARY.length; i++){
    var item = window.ITINERARY[i];
    if(!item.coords){ continue; }
    var color = DAY_COLORS[item.jour];
    var marker = L.circleMarker(item.coords, {
      radius: 8, color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.95
    });
    var thumb = item.photo || (item.photos && item.photos[0]);
    var photoHTML = thumb ? '<img src="' + thumb + '" alt="">' : '';
    marker.bindPopup(
      '<div class="map-popup">' + photoHTML +
      '<div class="mp-time">' + item.jour + ' · ' + (item.horaire || '') + '</div>' +
      '<h4>' + item.activite + '</h4>' +
      '<p>' + (item.lieu_label || '') + '</p></div>'
    );
    marker.addTo(dayLayers[item.jour]);
  }

  renderMapLegend();
}

function renderMapLegend(){
  var el = document.getElementById('mapLegend');
  var html = '';
  for(var i=0; i<window.DAYS_ORDER.length; i++){
    var d = window.DAYS_ORDER[i];
    html += '<div class="legend-chip" data-day="' + d + '">' +
      '<span class="legend-dot" style="background:' + DAY_COLORS[d] + '"></span> ' + d + '</div>';
  }
  el.innerHTML = html;
  var chips = el.querySelectorAll('.legend-chip');
  for(var j=0; j<chips.length; j++){
    chips[j].addEventListener('click', function(){
      var d = this.dataset.day;
      var layer = dayLayers[d];
      if(map.hasLayer(layer)){
        map.removeLayer(layer);
        this.classList.add('off');
      } else {
        map.addLayer(layer);
        this.classList.remove('off');
      }
    });
  }
}

// ---------- Récap (Tab 3) ----------
function renderRecap(){
  var el = document.getElementById('recapGrid');
  var html = '';
  for(var i=0; i<window.DAYS_ORDER.length; i++){
    var d = window.DAYS_ORDER[i];
    var meta = window.DAYS_META[d];
    var list = '';
    for(var k=0; k<window.ITINERARY.length; k++){
      if(window.ITINERARY[k].jour === d){
        list += '<li>' + window.ITINERARY[k].activite + '</li>';
      }
    }
    var titre = meta.titre.replace(/^JOUR \d+ — /,'');
    html += '<div class="recap-card"><h3>' + titre + '</h3>' +
      '<span class="r-date">' + d + ' · ' + meta.date + '</span>' +
      '<ul class="recap-list">' + list + '</ul></div>';
  }
  el.innerHTML = html;
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', function(){
  initTabs();
  initDaySelector();
  renderTimeline(currentDay);
  renderRecap();
});
