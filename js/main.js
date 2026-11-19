(function () {
  'use strict';
  var C = window.MYM_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var safe = function (fn, name) { try { fn(); } catch (e) { if (window.console) console.warn('[MYM] ' + name, e); } };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var okSrc = function (s) { return /^(assets\/|https:\/\/)/.test(s); };

  document.documentElement.classList.add('js');

  function initNav() {
    var nav = $('#nav'), burger = $('#burger'), prog = $('#progress');
    var links = $$('#menu a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
    function onScroll() {
      var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('solid', y > 40);
      prog.style.width = (h > 0 ? y / h * 100 : 0) + '%';
      var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
      var bg = $('#heroBg'); if (bg && y < innerHeight) bg.style.transform = 'translate3d(0,' + (y * .25) + 'px,0)';
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    function close() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
    burger.addEventListener('click', function () {
      var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : '';
    });
    links.forEach(function (a) { a.addEventListener('click', close); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.05 });
    els.forEach(function (e, i) { e.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 6000);
  }

  function initEffects() {
    var g = $('#glow');
    addEventListener('pointermove', function (e) { g.style.setProperty('--x', e.clientX + 'px'); g.style.setProperty('--y', e.clientY + 'px'); }, { passive: true });
    if (matchMedia('(hover:hover)').matches) {
      $$('[data-magnetic]').forEach(function (b) {
        b.addEventListener('pointermove', function (e) {
          var r = b.getBoundingClientRect();
          b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .25) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)';
        });
        b.addEventListener('pointerleave', function () { b.style.transform = ''; });
      });
    }
  }

  function initHero() {
    if (C.hero && okSrc(C.hero)) {
      var bg = $('#heroBg'); bg.style.backgroundImage = 'url("' + C.hero + '")'; bg.classList.add('has-img');
    }
    if (C.about && okSrc(C.about)) {
      var box = $('#aboutImg'); if (box) box.innerHTML = '<img src="' + esc(C.about) + '" alt="Restaurante M&M" loading="lazy">';
    }
  }

  function initDishes() {
    var box = $('#dishes'); if (!box || !C.dishes || !C.dishes.length) return;
    box.innerHTML = C.dishes.map(function (d) {
      var img = d.img && okSrc(d.img) ? '<img src="' + esc(d.img) + '" alt="' + esc(d.name || '') + '" loading="lazy" width="600" height="450">' : '<div class="ph"><b>M&amp;M</b></div>';
      return '<article class="dish in reveal">' + img + '<h3>' + esc(d.name || '') + '</h3><p>' + esc(d.desc || '') + '</p></article>';
    }).join('');
    var n = $('#gastronomia .note'); if (n) n.hidden = true;
  }

  function initGallery() {
    var box = $('#gallery'); if (!box || !C.gallery || !C.gallery.length) return;
    box.innerHTML = C.gallery.filter(function (g) { return g && okSrc(g.src); }).map(function (g) {
      return '<button type="button" data-src="' + esc(g.src) + '" aria-label="Ampliar: ' + esc(g.alt || 'foto') + '"><img src="' + esc(g.src) + '" alt="' + esc(g.alt || 'Restaurante M&M') + '" loading="lazy"></button>';
    }).join('');
    var n = $('#galeria .note'); if (n) n.hidden = true;
    var lb = $('#lb'), im = $('img', lb);
    function shut() { lb.hidden = true; }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      im.src = b.dataset.src; im.alt = $('img', b).alt; lb.hidden = false;
    });
    lb.addEventListener('click', shut);
    addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  }

  function initContact() {
    var wa = (C.whatsapp || '').replace(/\D/g, '');
    if (wa) {
      var url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hola, quisiera reservar una mesa en Restaurante M&M.');
      $$('.js-wa').forEach(function (a) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('aria-disabled'); });
      $('#waTxt').textContent = C.phone || ('+' + wa);
      $('#fab').hidden = false;
    } else {
      $$('.js-wa').forEach(function (a) { if (a.id === 'waCard') a.addEventListener('click', function (e) { e.preventDefault(); }); });
    }
    var dl = (C.delivery || '').replace(/\D/g, '');
    if (dl) { var d = $('#deliveryCard'); d.href = 'https://wa.me/51' + dl.replace(/^51/, '') + '?text=' + encodeURIComponent('Hola, quisiera pedir delivery.'); d.target = '_blank'; d.rel = 'noopener'; d.removeAttribute('aria-disabled'); $('#delTxt').textContent = 'WhatsApp ' + dl.replace(/(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3'); }
    if (C.phone) {
      var t = $('#telCard'); t.href = 'tel:' + C.phone.replace(/[^\d+]/g, ''); t.removeAttribute('aria-disabled'); $('#telTxt').textContent = C.phone;
    } else { $('#telCard').addEventListener('click', function (e) { e.preventDefault(); }); }
    if (C.address) $('#addr').textContent = C.address + (C.reference ? ' · ' + C.reference : '');
    if (C.hours && C.hours.length) $('#hours').innerHTML = C.hours.map(function (h) { return esc(h.day) + ': ' + esc(h.time); }).join('<br>');
    if (C.mapsLink && /^https:\/\//.test(C.mapsLink)) { var mb = $('#mapBtn'); mb.href = C.mapsLink; mb.textContent = 'Cómo llegar'; }
    if (C.mapsEmbed && /^https:\/\/(www\.)?google\.com\/maps/.test(C.mapsEmbed)) {
      $('#map').innerHTML = '<iframe src="' + esc(C.mapsEmbed) + '" title="Mapa de Restaurante M&M" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
    }
    var s = C.social || {};
    $('#socialAbout').innerHTML = [['Facebook', s.facebook], ['Instagram', s.instagram], ['TikTok', s.tiktok]].filter(function (x) { return x[1]; })
      .map(function (x) { return '<li><a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + x[0] + '</a></li>'; }).join('');
    $('#yr').textContent = new Date().getFullYear();
    var rb = $('.js-reserve'); if (wa) { rb.href = $('#waCard').href; rb.target = '_blank'; rb.rel = 'noopener'; }
  }

  function run() {
    safe(initNav, 'nav'); safe(initHero, 'hero'); safe(initDishes, 'dishes'); safe(initGallery, 'gallery');
    safe(initContact, 'contact'); safe(initReveal, 'reveal'); safe(initEffects, 'effects');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
