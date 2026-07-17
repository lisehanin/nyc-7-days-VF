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
