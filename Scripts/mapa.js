/* Mapa por niveles: familia de cada local, ficha lateral, leyenda, listado y enlace al directorio.
   Lee LOCAL_STORE y STORES (en línea en mapa.html). El clic en un local abre el modal (site.js). */
(function () {
  'use strict';
  var LS = (typeof LOCAL_STORE !== 'undefined' && LOCAL_STORE) ? LOCAL_STORE : {};
  var ST = (typeof STORES !== 'undefined' && Array.isArray(STORES)) ? STORES : [];
  var wrap = document.querySelector('.map-wrap');
  if (!wrap) return;

  function norm(s) { return window.norm ? window.norm(s) : String(s == null ? '' : s).toLowerCase().trim(); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  var FAMS = ['Compras', 'Gastronomía', 'Entretenimiento', 'Servicios'];
  function famKey(f) { return norm(f).replace(/\s+/g, '-'); }
  function famOf(s) { return window.familiaDe ? window.familiaDe(s && s.cat) : 'Compras'; }

  var byName = {};
  ST.forEach(function (s) { if (s && s.name) byName[norm(s.name)] = s; });
  function nameOf(f, l) { return (LS[f] && LS[f][l]) || null; }
  function storeOf(f, l) { var nm = nameOf(f, l); return nm ? (byName[norm(nm)] || { name: nm }) : null; }

  var levelName = {};
  $$('.tab[data-level]').forEach(function (t) { levelName[t.getAttribute('data-level')] = t.textContent.trim(); });
  function current() { var t = document.querySelector('.tab[data-level][aria-selected="true"]'); return t ? t.getAttribute('data-level') : 'pb'; }

  /* Cada local: familia, etiqueta accesible y teclado */
  var locals = $$('.m-local[data-local]');
  locals.forEach(function (el) {
    var f = el.getAttribute('data-floor'), l = el.getAttribute('data-local'), s = storeOf(f, l);
    el.setAttribute('data-fam', s ? famKey(famOf(s)) : 'vacio');
    el.setAttribute('aria-label', 'Local ' + l + ', ' + (s ? s.name : 'sin tienda asignada'));
    if (!s) el.setAttribute('aria-disabled', 'true');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
  });

  /* Ficha lateral */
  var info = {
    kicker: document.getElementById('miKicker'), logo: document.getElementById('miLogo'),
    name: document.getElementById('miName'), meta: document.getElementById('miMeta'),
    actions: document.getElementById('miActions'), open: document.getElementById('miOpen'), dir: document.getElementById('miDir')
  };
  var selected = null;
  function dirHref(s) { return 'directorio.html?tienda=' + encodeURIComponent(s.name); }
  function paintInfo(el) {
    if (!info.name) return;
    if (!el) {
      info.kicker.textContent = levelName[current()] || '';
      info.logo.hidden = true; info.logo.innerHTML = '';
      info.name.textContent = 'Elige un local';
      info.meta.textContent = 'Pasa el cursor o toca un local del plano para ver la tienda.';
      info.actions.hidden = true;
      return;
    }
    var f = el.getAttribute('data-floor'), l = el.getAttribute('data-local'), s = storeOf(f, l);
    var lv = levelName[f] || '';
    info.kicker.textContent = s ? (s.cat || famOf(s)) : lv;
    if (s && s.logo) {
      info.logo.hidden = false;
      info.logo.innerHTML = '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + '">';
      info.logo.firstChild.onerror = function () { info.logo.hidden = true; };
    } else { info.logo.hidden = true; info.logo.innerHTML = ''; }
    info.name.textContent = s ? s.name : 'Local ' + l;
    info.meta.textContent = s ? 'Local ' + l + ' · ' + lv : 'Sin tienda asignada · ' + lv;
    info.actions.hidden = !s;
    if (s) { info.dir.href = dirHref(s); info.open.onclick = function () { openFrom(el); }; }
  }

  /* Resalte (todas las celdas de la misma tienda en el nivel) */
  function hit(el) {
    locals.forEach(function (x) { x.classList.remove('is-hit'); });
    if (!el) { wrap.classList.remove('has-hit'); return; }
    var f = el.getAttribute('data-floor'), nm = nameOf(f, el.getAttribute('data-local'));
    locals.forEach(function (x) {
      if (x === el || (nm && x.getAttribute('data-floor') === f && nameOf(f, x.getAttribute('data-local')) === nm)) x.classList.add('is-hit');
    });
    wrap.classList.add('has-hit');
  }
  function show(el) { hit(el); paintInfo(el); }
  function restore() { show(selected); }

  /* Modal de tienda (site.js) + enlace al directorio */
  function addDirLink(s) {
    var box = document.getElementById('mInfo');
    var modal = document.getElementById('storeModal');
    if (!box || !modal || !modal.classList.contains('is-open') || box.querySelector('.map-dirlink')) return;
    var a = document.createElement('a');
    a.className = 'link-line map-dirlink';
    a.href = dirHref(s);
    a.textContent = 'Ver en el directorio';
    box.appendChild(a);
  }
  function openFrom(el) {
    var s = storeOf(el.getAttribute('data-floor'), el.getAttribute('data-local'));
    if (!s || !window.openStore) return;
    window.openStore(s.name);
    addDirLink(s);
  }

  locals.forEach(function (el) {
    el.addEventListener('mouseenter', function () { show(el); });
    el.addEventListener('focus', function () { show(el); });
    el.addEventListener('click', function () {
      selected = el; show(el);
      var s = storeOf(el.getAttribute('data-floor'), el.getAttribute('data-local'));
      if (s) addDirLink(s); // el modal ya lo abrió site.js
    });
  });
  $$('.m-svg').forEach(function (svg) {
    svg.addEventListener('mouseleave', restore);
    svg.addEventListener('focusout', function (e) { if (!svg.contains(e.relatedTarget)) restore(); });
  });

  /* Leyenda por familia (con nº de tiendas del nivel) */
  var legend = document.getElementById('mapLegend');
  function paintLegend() {
    if (!legend) return;
    var lv = current(), seen = {}, count = {};
    locals.forEach(function (el) {
      if (el.getAttribute('data-floor') !== lv) return;
      var nm = nameOf(lv, el.getAttribute('data-local'));
      if (!nm || seen[norm(nm)]) return;
      seen[norm(nm)] = 1;
      var k = el.getAttribute('data-fam');
      count[k] = (count[k] || 0) + 1;
    });
    var on = wrap.getAttribute('data-filter');
    legend.innerHTML = FAMS.map(function (f) {
      var k = famKey(f);
      return '<button type="button" class="legend-item" data-fam="' + k + '" aria-pressed="' + (on === k ? 'true' : 'false') + '">' +
        '<span class="legend-swatch" style="--sw:var(--fam-' + k + ')"></span><span class="legend-item__name">' + f +
        '</span><span class="legend-item__n">' + (count[k] || 0) + '</span></button>';
    }).join('') + '<span class="legend-item legend-item--static"><span class="legend-swatch" style="--sw:var(--fam-vacio)"></span>Sin tienda</span>';
  }
  if (legend) legend.addEventListener('click', function (e) {
    var b = e.target.closest('button.legend-item');
    if (!b) return;
    var k = b.getAttribute('data-fam');
    if (wrap.getAttribute('data-filter') === k) wrap.removeAttribute('data-filter'); else wrap.setAttribute('data-filter', k);
    paintLegend();
  });

  /* Listado de locales del nivel */
  function natural(a, b) {
    var ma = /^(\D*)(\d*)(.*)$/.exec(a), mb = /^(\D*)(\d*)(.*)$/.exec(b);
    if (ma[1] !== mb[1]) return ma[1] < mb[1] ? -1 : 1;
    var na = parseInt(ma[2] || '0', 10), nb = parseInt(mb[2] || '0', 10);
    return na !== nb ? na - nb : (ma[3] < mb[3] ? -1 : ma[3] > mb[3] ? 1 : 0);
  }
  $$('.map-list[data-level]').forEach(function (ul) {
    var lv = ul.getAttribute('data-level');
    var keys = locals.filter(function (el) { return el.getAttribute('data-floor') === lv; })
      .map(function (el) { return el.getAttribute('data-local'); }).sort(natural);
    ul.innerHTML = keys.map(function (l) {
      var s = storeOf(lv, l);
      return '<li><button type="button" class="map-list__item' + (s ? '' : ' is-empty') + '" data-l="' + esc(l) + '">' +
        '<span class="map-list__num">' + esc(l) + '</span><span class="map-list__name">' + (s ? esc(s.name) : 'Sin tienda asignada') + '</span></button></li>';
    }).join('');
    ul.addEventListener('click', function (e) {
      var b = e.target.closest('.map-list__item');
      if (!b) return;
      var el = document.querySelector('.m-local[data-floor="' + lv + '"][data-local="' + b.getAttribute('data-l') + '"]');
      if (!el) return;
      selected = el; show(el);
      if (!b.classList.contains('is-empty')) openFrom(el);
    });
  });

  /* Cambio de nivel: ficha, leyenda, listado y título */
  var listTitle = document.getElementById('mapListTitle');
  function onLevel() {
    var lv = current();
    if (selected && selected.getAttribute('data-floor') !== lv) selected = null;
    restore();
    paintLegend();
    $$('.map-list[data-level]').forEach(function (ul) { ul.hidden = ul.getAttribute('data-level') !== lv; });
    if (listTitle) listTitle.textContent = 'Locales de ' + (levelName[lv] || '');
  }
  $$('.tab[data-level]').forEach(function (t) { t.addEventListener('click', onLevel); });
  onLevel();
})();
