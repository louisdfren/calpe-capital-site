// Calpe Capital site interactions: sticky nav, mobile menu, stat count-up.
// The scroll reveals, word stagger, mist and parallax were removed on
// 27/07/2026 when the design was calmed for launch. The stat counter
// stays: figures render complete in the markup and animate once when the
// band scrolls into view.

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky nav state */
  var header = document.getElementById('siteHeader');
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* Mobile nav */
  var burger = document.querySelector('.nav-burger');
  var mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      header.classList.toggle('is-open', open);
      mobileNav.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        header.classList.remove('is-open');
        mobileNav.hidden = true;
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Stat count-up: markup carries the final figure, so without JS (or with
     reduced motion) the numbers simply stand. */
  var stats = document.querySelectorAll('.stat-figure[data-count-to]');
  if (stats.length && !reduceMotion && 'IntersectionObserver' in window) {
    function formatStat(el, value) {
      var prefix = el.getAttribute('data-count-prefix') || '';
      var suffix = el.getAttribute('data-count-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      el.textContent = prefix + value.toFixed(decimals) + suffix;
    }
    function runCount(el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      if (isNaN(target)) return;
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        formatStat(el, target * eased);
        if (t < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(function (el) { statIo.observe(el); });
  }

  /* Anchor offset when landing on a hash */
  if (window.location.hash) {
    setTimeout(function () {
      var target = document.querySelector(window.location.hash);
      if (target) {
        var top = target.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: top, behavior: 'auto' });
      }
    }, 0);
  }
})();
