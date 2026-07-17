/* =======================================================================
   FAROOQ KHAN AYUB KHAN — interactions
   ======================================================================= */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  body.classList.add('loading');

  /* ---------- Preloader ---------- */
  function hidePreloader() {
    var pl = doc.getElementById('preloader');
    if (pl) pl.classList.add('done');
    // small delay so hero intro animations trigger after the curtain lifts
    setTimeout(function () { body.classList.remove('loading'); }, 150);
  }
  window.addEventListener('load', function () { setTimeout(hidePreloader, 350); });
  // safety: never trap the user behind the loader
  setTimeout(hidePreloader, 3500);

  /* ---------- Header scrolled state + scroll progress + back-to-top ---------- */
  var hdr = doc.getElementById('hdr');
  var progress = doc.getElementById('progress');
  var toTop = doc.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY || doc.documentElement.scrollTop;
    if (hdr) hdr.classList.toggle('scrolled', y > 40);
    if (toTop) toTop.classList.toggle('show', y > 600);
    if (progress) {
      var h = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    spy();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Mobile menu + Services dropdown ---------- */
  var burger = doc.getElementById('burger');
  var menu = doc.getElementById('menu');
  var drop = doc.querySelector('.has-drop');
  var dropToggle = doc.querySelector('.drop-toggle');

  function closeDrawer() { if (menu) menu.classList.remove('open'); if (hdr) hdr.classList.remove('menu-open'); }
  function closeDrop() { if (drop) drop.classList.remove('open'); if (dropToggle) dropToggle.setAttribute('aria-expanded', 'false'); }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      menu.classList.toggle('open');
      hdr.classList.toggle('menu-open');
    });
    menu.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      if (a.classList.contains('drop-toggle')) return; // toggled separately, don't close drawer
      closeDrawer();
      closeDrop();
    });
  }

  if (dropToggle && drop) {
    // click/tap opens the categories (works on desktop + mobile; hover also opens on desktop via CSS)
    dropToggle.addEventListener('click', function (e) {
      e.preventDefault();
      var open = drop.classList.toggle('open');
      dropToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close when clicking outside or pressing Escape
    doc.addEventListener('click', function (e) { if (!drop.contains(e.target)) closeDrop(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrop(); });
  }

  /* ---------- Scroll-spy: highlight active nav link ---------- */
  var sections = [].slice.call(doc.querySelectorAll('section[id]'));
  var navLinks = [].slice.call(doc.querySelectorAll('nav a[href^="#"]'));
  var dropTargets = ['services', 'luxury', 'seaters', 'fleet', 'heavy'];
  function spy() {
    var pos = (window.scrollY || doc.documentElement.scrollTop) + 120;
    var current = '';
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= pos) current = sections[i].id;
    }
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
    // keep the Services toggle highlighted whenever any of its categories is in view
    if (dropToggle) dropToggle.classList.toggle('active', dropTargets.indexOf(current) > -1);
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500, start = null;
    var from = target > 100 ? Math.floor(target * 0.85) : 0; // years ramp from near value
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.floor(from + (target - from) * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------- Scroll reveal (with stagger) + counters ---------- */
  var revealEls = [].slice.call(doc.querySelectorAll('.reveal'));
  revealEls.forEach(function (el) {
    var sibs = [].slice.call(el.parentNode.children).filter(function (s) {
      return s.classList.contains('reveal');
    });
    el.style.transitionDelay = (Math.max(0, sibs.indexOf(el)) * 80) + 'ms';
  });

  function revealAll() { revealEls.forEach(function (el) { el.classList.add('in'); }); }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          var counters = en.target.querySelectorAll
            ? en.target.querySelectorAll('[data-count]')
            : [];
          [].forEach.call(counters, function (c) {
            if (!c.dataset.done) { c.dataset.done = '1'; countUp(c); }
          });
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    setTimeout(revealAll, 4500); // safety net
  } else {
    revealAll();
    [].forEach.call(doc.querySelectorAll('[data-count]'), countUp);
  }

  /* ---------- Hero parallax (pointer + scroll) ----------
     Drives the non-animated .mesh glow + the hero content, so it never
     fights the ken-burns / orb-float transform animations. */
  var hero = doc.querySelector('.hero');
  var mesh = doc.querySelector('.hero .mesh');
  var heroInner = doc.querySelector('.hero-inner');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var px = 0, py = 0, sy = 0;

  function applyParallax() {
    if (mesh) mesh.style.transform = 'translate(' + (px * 26) + 'px,' + (py * 26 + sy * 0.25) + 'px)';
    if (heroInner) heroInner.style.transform = 'translate(' + (px * -8) + 'px,' + (py * -8) + 'px)';
  }
  if (!reduce && hero && window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('mousemove', function (e) {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      applyParallax();
    });
  }
  if (!reduce && mesh) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      if (y < window.innerHeight) { sy = y; applyParallax(); }
    }, { passive: true });
  }

  /* ---------- "Who We Are" vehicle slideshow ---------- */
  (function () {
    var slider = doc.getElementById('aboutSlider');
    if (!slider) return;
    var slides = [].slice.call(slider.querySelectorAll('.slide'));
    if (slides.length < 2) return;
    var dotsWrap = doc.getElementById('sliderDots');
    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var d = doc.createElement('i');
        if (i === 0) d.className = 'on';
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove('active');
      if (dots[idx]) dots[idx].classList.remove('on');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
      if (dots[idx]) dots[idx].classList.add('on');
    }, 2200);
  })();

  /* ---------- Per-vehicle WhatsApp enquiry ----------
     Click a vehicle card -> a WhatsApp button appears; clicking it opens a
     chat pre-filled with a message about that specific vehicle. */
  (function () {
    var PHONE = '971569715162';
    var WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.005c6.582 0 11.94-5.335 11.944-11.893a11.821 11.821 0 00-3.473-8.413z"/></svg>';
    var cards = [].slice.call(doc.querySelectorAll('.lux-card'));
    cards.forEach(function (card) {
      var ph = card.querySelector('.ph');
      var nameEl = card.querySelector('.body h3');
      if (!ph || !nameEl) return;
      var name = nameEl.textContent.trim();
      var msg = 'Hello Farooq Khan Ayub Khan Transport, I would like more information about the ' +
                name + ' — availability, rates and booking. Thank you.';
      var url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
      var ov = doc.createElement('div');
      ov.className = 'veh-wa';
      ov.innerHTML = '<a href="' + url + '" target="_blank" rel="noopener" aria-label="Enquire about ' +
                     name.replace(/"/g, '') + ' on WhatsApp">' + WA_ICON + ' Enquire on WhatsApp</a>';
      ph.appendChild(ov);
      card.classList.add('has-wa');
    });
    // reveal on card click; close others / on outside click
    doc.addEventListener('click', function (e) {
      if (e.target.closest('.veh-wa a')) return; // let the WhatsApp link work
      var card = e.target.closest('.lux-card.has-wa');
      cards.forEach(function (c) { if (c !== card) c.classList.remove('wa-open'); });
      if (card) card.classList.toggle('wa-open');
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cards.forEach(function (c) { c.classList.remove('wa-open'); });
    });
  })();

  /* ---------- Footer year ---------- */
  var yr = doc.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* initial paint */
  onScroll();
})();
