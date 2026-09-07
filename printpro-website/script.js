// PrintPro site interactions — mobile nav, header scroll state, hero spotlight,
// animated stat counters, and GSAP ScrollTrigger reveals. No dependencies beyond
// GSAP + ScrollTrigger (loaded via CDN in index.html). Everything here degrades
// gracefully if GSAP fails to load — content stays visible (see .reveal in
// styles.css, which defaults to visible unless JS adds .js-reveal-ready).

document.addEventListener('DOMContentLoaded', function () {

  // ---------- Mobile nav toggle ----------
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Header scroll state ----------
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Hero cursor spotlight ----------
  var hero = document.getElementById('hero');
  var spotlight = document.getElementById('hero-spotlight');
  if (hero && spotlight && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--x', x + '%');
      hero.style.setProperty('--y', y + '%');
    });
  }

  // ---------- Floating product cloud (cursor parallax) ----------
  // Idle bob animation runs via pure CSS on .float-card-bob regardless of JS/GSAP,
  // so the cloud still animates even if this fails. This block only adds the extra
  // cursor-follow parallax layer on top, on hover-capable devices with GSAP loaded.
  var floatCanvas = document.getElementById('float-canvas');
  if (floatCanvas && window.matchMedia('(hover: hover)').matches && typeof window.gsap !== 'undefined') {
    var floatCards = floatCanvas.querySelectorAll('.float-card');
    var xTo = [], yTo = [];
    floatCards.forEach(function (card, i) {
      xTo[i] = gsap.quickTo(card, 'x', { duration: 0.9, ease: 'power3.out' });
      yTo[i] = gsap.quickTo(card, 'y', { duration: 0.9, ease: 'power3.out' });
    });
    floatCanvas.addEventListener('mousemove', function (e) {
      var rect = floatCanvas.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      floatCards.forEach(function (card, i) {
        var depth = parseFloat(card.getAttribute('data-depth')) || 1;
        xTo[i](relX * 32 * depth);
        yTo[i](relY * 22 * depth);
      });
    });
    floatCanvas.addEventListener('mouseleave', function () {
      floatCards.forEach(function (card, i) {
        xTo[i](0);
        yTo[i](0);
      });
    });
  }

  // ---------- Animated stat counters ----------
  var counters = document.querySelectorAll('.stat-num[data-count]');
  var animateCount = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    var start = 0;
    var duration = 1200;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('js-reveal-ready');

    // Hero entrance
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to('.hero .reveal.eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 0.1)
      .to('.hero h1.reveal', { opacity: 1, y: 0, duration: 0.8 }, 0.2)
      .to('.hero .hero-sub.reveal', { opacity: 1, y: 0, duration: 0.7 }, 0.4)
      .to('.hero .hero-actions.reveal', { opacity: 1, y: 0, duration: 0.7 }, 0.55);

    // Generic scroll-reveal for repeating card/row elements
    var groups = ['.stat', '.flow-card', '.category-card', '.showcase-item', '.print-card', '.sustain-card', '.reason'];
    groups.forEach(function (selector) {
      var items = gsap.utils.toArray(selector);
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: 'top 88%',
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' });
        },
        once: true
      });
    });

    // Section headings — small fade/slide on scroll
    gsap.utils.toArray('.section h2').forEach(function (h) {
      gsap.fromTo(h, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: h, start: 'top 85%' }
      });
    });

    // Counters, triggered on scroll into view
    counters.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () { animateCount(el); }
      });
    });
  } else {
    // No GSAP (e.g. offline preview) — just run the counters immediately,
    // content is already visible via the .reveal default in CSS.
    counters.forEach(animateCount);
  }
});
