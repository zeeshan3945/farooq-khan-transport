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

  /* ---------- Mobile menu ---------- */
  var burger = doc.getElementById('burger');
  var menu = doc.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      menu.classList.toggle('open');
      hdr.classList.toggle('menu-open');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        hdr.classList.remove('menu-open');
      }
    });
  }

  /* ---------- Scroll-spy: highlight active nav link ---------- */
  var sections = [].slice.call(doc.querySelectorAll('section[id]'));
  var navLinks = [].slice.call(doc.querySelectorAll('nav a[href^="#"]'));
  function spy() {
    var pos = (window.scrollY || doc.documentElement.scrollTop) + 120;
    var current = '';
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= pos) current = sections[i].id;
    }
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
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

  /* ---------- Footer year ---------- */
  var yr = doc.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* initial paint */
  onScroll();
})();
