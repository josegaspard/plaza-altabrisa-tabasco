/* Plaza Altabrisa Tabasco — JS compartido (sin dependencias).
   Las páginas declaran sus datos en línea ANTES de cargar este archivo (con defer):
   const STORES = [...];   const EVENTS = [...];   const LOCAL_STORE = {...}; */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- Utilidades ---------- */
  function norm(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function val(v) { return v == null ? '' : String(v).trim(); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function getStores() { return (typeof STORES !== 'undefined' && Array.isArray(STORES)) ? STORES : []; }
  function getEvents() { return (typeof EVENTS !== 'undefined' && Array.isArray(EVENTS)) ? EVENTS : []; }
  /* Fondo inerte mientras hay un diálogo o el menú abierto (foco y lectores no salen de él) */
  function setInert(on, sels) {
    $$(sels || 'body > header, main, body > footer').forEach(function (el) {
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  var ICON = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M15 4l-8 8 8 8"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M9 4l8 8-8 8"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 8c-.1-1.6-.4-3-1.6-4.2S17.6 2.2 16 2.1C14.4 2 9.6 2 8 2.1 6.4 2.2 5 2.5 3.8 3.7S2.2 6.4 2.1 8C2 9.6 2 14.4 2.1 16c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.4.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.4 0-8zm-2.1 9.8a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.6.4s-4.4.1-5.6-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.6s-.1-4.4.4-5.6A3.2 3.2 0 0 1 6.8 4.6C8 4.1 11 4.2 12.4 4.2s4.4-.1 5.6.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.6s.1 4.4-.4 5.6z"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/></svg>'
  };

  /* ---------- Giro del gestor → familia ---------- */
  const GIRO_FAMILIA = {
    'accesorios': 'Compras', 'bolsas': 'Compras', 'deportes': 'Compras', 'especialidades': 'Compras',
    'hogar': 'Compras', 'joyerias': 'Compras', 'joyeria': 'Compras', 'jugueterias': 'Compras', 'jugueteria': 'Compras',
    'moda caballeros': 'Compras', 'moda dama y caballero': 'Compras', 'moda damas': 'Compras', 'moda': 'Compras',
    'moda infantil': 'Compras', 'opticas': 'Compras', 'optica': 'Compras', 'tecnologia': 'Compras',
    'tiendas departamentales': 'Compras', 'tienda departamental': 'Compras', 'zapaterias': 'Compras', 'zapateria': 'Compras',
    'mascotas': 'Compras', 'belleza': 'Compras', 'perfumeria': 'Compras', 'perfumerias': 'Compras', 'libreria': 'Compras',
    'librerias': 'Compras', 'regalos': 'Compras', 'relojerias': 'Compras', 'lenceria': 'Compras', 'autoservicio': 'Compras',
    'alimentos': 'Gastronomía', 'comida rapida': 'Gastronomía', 'restaurantes': 'Gastronomía', 'restaurante': 'Gastronomía',
    'dulces': 'Gastronomía', 'cafeterias': 'Gastronomía', 'cafeteria': 'Gastronomía', 'cafe': 'Gastronomía',
    'heladerias': 'Gastronomía', 'helados': 'Gastronomía', 'postres': 'Gastronomía', 'panaderias': 'Gastronomía',
    'bebidas': 'Gastronomía', 'bares': 'Gastronomía', 'food court': 'Gastronomía', 'comida': 'Gastronomía',
    'entretenimiento': 'Entretenimiento', 'cines': 'Entretenimiento', 'cine': 'Entretenimiento', 'juegos': 'Entretenimiento',
    'diversion': 'Entretenimiento', 'boliche': 'Entretenimiento', 'casino': 'Entretenimiento',
    'academias': 'Servicios', 'academia': 'Servicios', 'agencias de viajes': 'Servicios', 'agencia de viajes': 'Servicios',
    'bancos': 'Servicios', 'banco': 'Servicios', 'telefonia': 'Servicios', 'servicios': 'Servicios', 'salud': 'Servicios',
    'farmacias': 'Servicios', 'farmacia': 'Servicios', 'gimnasios': 'Servicios', 'gimnasio': 'Servicios', 'spa': 'Servicios',
    'esteticas': 'Servicios', 'estetica': 'Servicios', 'lavanderias': 'Servicios', 'seguros': 'Servicios',
    'educacion': 'Servicios', 'consultorios': 'Servicios', 'tintorerias': 'Servicios', 'cajeros': 'Servicios'
  };
  var FAMILIAS = ['Compras', 'Gastronomía', 'Entretenimiento', 'Servicios'];
  function familia(cat) { return GIRO_FAMILIA[norm(cat)] || 'Compras'; }

  /* ---------- Menú móvil ---------- */
  function initMenu() {
    var btn = $('.menu-btn');
    if (!btn) return;
    function set(open) {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      setInert(open, 'main, body > footer');
    }
    btn.addEventListener('click', function () { set(!document.body.classList.contains('menu-open')); });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 979) set(false); });
  }

  /* ---------- Tarjeta de tienda ---------- */
  function cardHTML(s, i) {
    var name = val(s.name) || 'Tienda';
    var logo = val(s.logo);
    var inner = logo
      ? '<img src="' + esc(logo) + '" alt="' + esc(name) + '" loading="lazy" decoding="async">'
      : '<span class="store-card__txt">' + esc(name) + '</span>';
    return '<button type="button" class="store-card" data-i="' + i + '" aria-label="' + esc(name) + '">' + inner +
      '<span class="store-card__name">' + esc(name) + '</span></button>';
  }
  function bindCards(ctx) {
    ctx.addEventListener('click', function (e) {
      var c = e.target.closest('.store-card');
      if (c) openStore(getStores()[+c.getAttribute('data-i')], c);
    });
    // Logo roto → nombre en texto
    ctx.addEventListener('error', function (e) {
      var img = e.target;
      if (img.tagName === 'IMG' && img.parentNode && img.parentNode.classList.contains('store-card')) {
        var t = document.createElement('span'); t.className = 'store-card__txt'; t.textContent = img.alt;
        img.replaceWith(t);
      }
    }, true);
  }

  /* ---------- Directorio ---------- */
  function initDirectory() {
    var grid = $('#dirGrid');
    if (!grid) return;
    var stores = getStores();
    var tabsBox = $('#dirTabs'), input = $('#dirSearch'), count = $('#dirCount');
    var state = { fam: 'Todo', q: '' };
    var params = new URLSearchParams(location.search);
    var pCat = params.get('cat');
    if (pCat) {
      var hit = FAMILIAS.filter(function (f) { return norm(f) === norm(pCat); })[0];
      if (hit) state.fam = hit;
    }
    if (tabsBox) {
      tabsBox.setAttribute('role', 'tablist');
      tabsBox.innerHTML = ['Todo'].concat(FAMILIAS).map(function (f) {
        return '<button type="button" class="tab" role="tab" data-fam="' + esc(f) + '" aria-selected="' + (f === state.fam) + '">' + esc(f) + '</button>';
      }).join('');
      tabsBox.addEventListener('click', function (e) {
        var b = e.target.closest('.tab'); if (!b) return;
        state.fam = b.getAttribute('data-fam');
        $$('.tab', tabsBox).forEach(function (t) { t.setAttribute('aria-selected', t === b ? 'true' : 'false'); });
        var u = new URL(location.href);
        if (state.fam === 'Todo') u.searchParams.delete('cat'); else u.searchParams.set('cat', state.fam);
        u.searchParams.delete('tienda');
        history.replaceState(null, '', u);
        paint();
      });
    }
    if (input) input.addEventListener('input', function () { state.q = norm(input.value); paint(); });

    var order = stores.map(function (s, i) { return i; }).sort(function (a, b) {
      return norm(stores[a].name).localeCompare(norm(stores[b].name), 'es');
    });
    function paint() {
      var list = order.filter(function (i) {
        var s = stores[i];
        if (state.fam !== 'Todo' && familia(s.cat) !== state.fam) return false;
        if (state.q && (norm(s.name) + ' ' + norm(s.cat)).indexOf(state.q) === -1) return false;
        return true;
      });
      grid.innerHTML = list.map(function (i) { return cardHTML(stores[i], i); }).join('');
      if (count) count.textContent = list.length === 1 ? '1 tienda' : list.length + ' tiendas';
      var empty = $('#dirEmpty');
      if (empty) empty.hidden = list.length > 0;
    }
    bindCards(grid);
    paint();

    var pT = params.get('tienda');
    if (pT) {
      var s = findStore(pT);
      if (s) openStore(s);
    }
  }

  function findStore(name) {
    var n = norm(name), stores = getStores();
    return stores.filter(function (s) { return norm(s.name) === n; })[0] ||
      stores.filter(function (s) { return norm(s.name).indexOf(n) === 0; })[0] || null;
  }

  /* ---------- Marcas destacadas (portada) ---------- */
  function initFeatured() {
    var box = $('#featuredBrands');
    if (!box) return;
    var stores = getStores();
    var max = +box.getAttribute('data-max') || 12;
    var idx = stores.map(function (s, i) { return i; }).filter(function (i) { return val(stores[i].logo); }).slice(0, max);
    var section = box.closest('[data-featured]');
    if (!idx.length) { if (section) section.hidden = true; return; }
    if (section) section.hidden = false;
    box.innerHTML = idx.map(function (i) { return cardHTML(stores[i], i); }).join('');
    bindCards(box);
  }

  /* Nº de tiendas (si el HTML trae STORES con datos) */
  function initCount() {
    var n = getStores().length;
    if (!n) return;
    $$('[data-cc="tiendas"]').forEach(function (el) { el.textContent = n + ' tiendas'; });
  }

  /* ---------- Modal de tienda ---------- */
  var modal, gal = { imgs: [], i: 0 }, lastFocus;
  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'modal'; modal.id = 'storeModal';
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'mName');
    modal.innerHTML = '<div class="modal__panel"><button type="button" class="modal__close" aria-label="Cerrar"></button>' +
      '<div class="gallery" id="mGallery"></div><div class="modal__info" id="mInfo"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('.modal__close')) closeStore();
      if (e.target.closest('[data-g="prev"]')) stepGallery(-1);
      if (e.target.closest('[data-g="next"]')) stepGallery(1);
    });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeStore();
      if (e.key === 'ArrowLeft') stepGallery(-1);
      if (e.key === 'ArrowRight') stepGallery(1);
    });
  }
  function paintGallery() {
    var g = $('#mGallery');
    if (!gal.imgs.length) {
      var logo = val(gal.store.logo);
      g.className = 'gallery gallery--logo';
      g.innerHTML = logo && !gal.noLogo ? '<img src="' + esc(logo) + '" alt="' + esc(gal.store.name) + '">'
        : '<span class="store-card__txt">' + esc(val(gal.store.name)) + '</span>';
      var li = $('img', g);
      if (li) li.onerror = function () { gal.noLogo = true; paintGallery(); };
      return;
    }
    g.className = 'gallery';
    var multi = gal.imgs.length > 1;
    g.innerHTML = '<img class="gallery__main" src="' + esc(gal.imgs[gal.i]) + '" alt="' + esc(gal.store.name) + '">' +
      (multi ? '<span class="gallery__count">' + (gal.i + 1) + ' / ' + gal.imgs.length + '</span>' +
        '<div class="gallery__nav"><button type="button" class="gallery__btn" data-g="prev" aria-label="Foto anterior">' + ICON.prev +
        '</button><button type="button" class="gallery__btn" data-g="next" aria-label="Foto siguiente">' + ICON.next + '</button></div>' : '');
    // Foto rota → se quita de la galería (sin fotos, queda el logo o el nombre)
    $('.gallery__main', g).onerror = function () {
      gal.imgs.splice(gal.i, 1);
      if (gal.i >= gal.imgs.length) gal.i = 0;
      paintGallery();
    };
  }
  function stepGallery(d) {
    if (gal.imgs.length < 2) return;
    gal.i = (gal.i + d + gal.imgs.length) % gal.imgs.length;
    paintGallery();
  }
  function link(href) { return /^https?:\/\//i.test(href) ? href : 'https://' + href.replace(/^\/+/, ''); }
  function openStore(s, from) {
    if (!s) return;
    if (!modal) buildModal();
    lastFocus = from || document.activeElement;
    var imgs = [];
    (Array.isArray(s.imgs) ? s.imgs : []).concat([s.img]).forEach(function (u) { u = val(u); if (u && imgs.indexOf(u) === -1) imgs.push(u); });
    gal = { imgs: imgs, i: 0, store: s };
    paintGallery();
    var rows = [];
    function row(k, v) { if (v) rows.push('<div class="modal__row"><dt>' + k + '</dt><dd>' + v + '</dd></div>'); }
    var num = val(s.num), loc = val(s.loc), time = val(s.time), tel = val(s.tel), web = val(s.web);
    row('Local', esc(num));
    row('Nivel', esc(loc));
    row('Horario', esc(time));
    if (tel) row('Teléfono', '<a href="tel:' + esc(tel.replace(/[^\d+]/g, '')) + '">' + esc(tel) + '</a>');
    if (web) row('Sitio web', '<a href="' + esc(link(web)) + '" target="_blank" rel="noopener">' + esc(web.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')) + '</a>');
    var soc = '';
    if (val(s.fb)) soc += '<a href="' + esc(link(val(s.fb))) + '" target="_blank" rel="noopener" aria-label="Facebook">' + ICON.fb + '</a>';
    if (val(s.ig)) soc += '<a href="' + esc(link(val(s.ig))) + '" target="_blank" rel="noopener" aria-label="Instagram">' + ICON.ig + '</a>';
    var showLogo = val(s.logo) && imgs.length;
    $('#mInfo').innerHTML =
      (showLogo ? '<img class="modal__logo" src="' + esc(s.logo) + '" alt="">' : '') +
      (val(s.cat) ? '<span class="kicker">' + esc(s.cat) + '</span>' : '') +
      '<h3 class="modal__name" id="mName">' + esc(val(s.name)) + '</h3>' +
      (val(s.desc) ? '<p class="modal__desc">' + esc(s.desc) + '</p>' : '') +
      (rows.length ? '<dl class="modal__rows">' + rows.join('') + '</dl>' : '') +
      (soc ? '<div class="social modal__social">' + soc + '</div>' : '');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setInert(true);
    $('.modal__close', modal).focus();
    var u = new URL(location.href);
    if (u.searchParams.get('tienda') !== s.name && $('#dirGrid')) { u.searchParams.set('tienda', s.name); history.replaceState(null, '', u); }
  }
  function closeStore() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setInert(false);
    var u = new URL(location.href);
    if (u.searchParams.has('tienda')) { u.searchParams.delete('tienda'); history.replaceState(null, '', u); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- Mapa: local → tienda ---------- */
  function initMap() {
    // Pestañas de nivel: <button class="tab" data-level="pb"> ↔ <div class="map-floor" data-level="pb">
    $$('.tab[data-level]').forEach(function (b) {
      b.addEventListener('click', function () {
        var lv = b.getAttribute('data-level');
        $$('.tab[data-level]').forEach(function (t) { t.setAttribute('aria-selected', t === b ? 'true' : 'false'); });
        $$('.map-floor[data-level]').forEach(function (f) { f.hidden = f.getAttribute('data-level') !== lv; });
      });
    });
    var locals = $$('[data-local]');
    if (!locals.length) return;
    var table = (typeof LOCAL_STORE !== 'undefined' && LOCAL_STORE) ? LOCAL_STORE : {};
    locals.forEach(function (el) {
      el.addEventListener('click', function () {
        var f = el.getAttribute('data-floor'), l = el.getAttribute('data-local');
        var name = table[f] && table[f][l];
        if (name) openStore(findStore(name), el);
      });
    });
  }

  /* ---------- Eventos y promociones: lightbox ---------- */
  var lb, lbIndex = 0, lbFocus;
  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<div class="lightbox__stage"><img class="lightbox__img" alt=""></div>' +
      '<div class="lightbox__info"><span class="kicker lightbox__tag"></span><h3 class="lightbox__title"></h3><p class="lightbox__desc"></p></div>' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Anterior">' + ICON.prev + '</button>' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="Siguiente">' + ICON.next + '</button>' +
      '<button type="button" class="lightbox__close" aria-label="Cerrar"></button>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function (e) {
      if (e.target.closest('.lightbox__prev')) return stepPub(-1);
      if (e.target.closest('.lightbox__next')) return stepPub(1);
      if (e.target.closest('.lightbox__close') || e.target === lb || e.target.classList.contains('lightbox__stage')) closePub();
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePub();
      if (e.key === 'ArrowLeft') stepPub(-1);
      if (e.key === 'ArrowRight') stepPub(1);
    });
  }
  function showPub(p) {
    $('.lightbox__img', lb).src = val(p.img);
    $('.lightbox__img', lb).alt = val(p.title);
    $('.lightbox__tag', lb).textContent = val(p.tag);
    $('.lightbox__title', lb).textContent = val(p.title);
    $('.lightbox__desc', lb).textContent = val(p.desc);
    $('.lightbox__tag', lb).hidden = !val(p.tag);
    $('.lightbox__desc', lb).hidden = !val(p.desc);
    var many = getEvents().length > 1;
    $('.lightbox__prev', lb).hidden = !many;
    $('.lightbox__next', lb).hidden = !many;
  }
  function stepPub(d) {
    var ev = getEvents(); if (ev.length < 2) return;
    lbIndex = (lbIndex + d + ev.length) % ev.length;
    showPub(ev[lbIndex]);
  }
  function openPub(title, tag, desc, img, ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (!lb) buildLightbox();
    var list = getEvents();
    var k = -1;
    for (var i = 0; i < list.length; i++) { if (list[i].title === title && list[i].img === img) { k = i; break; } }
    lbIndex = k < 0 ? 0 : k;
    showPub(k < 0 ? { title: title, tag: tag, desc: desc, img: img } : list[k]);
    if (!lb.classList.contains('is-open')) lbFocus = (ev && ev.currentTarget && ev.currentTarget.focus) ? ev.currentTarget : document.activeElement;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setInert(true);
    $('.lightbox__close', lb).focus();
  }
  function closePub() {
    lb.classList.remove('is-open'); document.body.style.overflow = '';
    setInert(false);
    if (lbFocus && lbFocus.focus) lbFocus.focus();
  }

  /* Tarjetas de eventos (marcado del contrato sin href): accesibles con teclado */
  function initPubCards() {
    $$('.e-card').forEach(function (c) {
      if (c.hasAttribute('href')) return;
      c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button');
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); }
      });
    });
  }

  /* Pestañas (directorio y niveles del mapa): roles ARIA y flechas */
  function initTabsA11y() {
    $$('.tabs').forEach(function (box) {
      var tabs = $$('.tab', box);
      if (!tabs.length) return;
      box.setAttribute('role', 'tablist');
      tabs.forEach(function (t) {
        t.setAttribute('role', 'tab');
        var lv = t.getAttribute('data-level');
        if (lv) {
          var f = $('.map-floor[data-level="' + lv + '"]');
          if (f) { if (!f.id) f.id = 'nivel-' + lv; f.setAttribute('role', 'tabpanel'); t.setAttribute('aria-controls', f.id); }
          if (!t.hasAttribute('aria-selected')) t.setAttribute('aria-selected', f && !f.hidden ? 'true' : 'false');
        } else if ($('#dirGrid')) t.setAttribute('aria-controls', 'dirGrid');
      });
      box.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var list = $$('.tab', box), i = list.indexOf(document.activeElement);
        if (i < 0) return;
        var n = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
        n.focus(); n.click();
      });
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* API pública */
  window.norm = norm;
  window.GIRO_FAMILIA = GIRO_FAMILIA;
  window.familiaDe = familia;
  window.openPub = openPub;
  window.openStore = function (s) { openStore(typeof s === 'string' ? findStore(s) : s); };

  function init() { initMenu(); initCount(); initDirectory(); initFeatured(); initMap(); initTabsA11y(); initPubCards(); initReveal(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
