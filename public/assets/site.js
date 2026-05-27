// Calpe Capital — site interactions
// Sticky nav, scroll-reveal, mobile menu, hero parallax.

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav state ---------- */
  var header = document.getElementById('siteHeader');
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
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

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Stats counter ---------- */
  var stats = document.querySelectorAll('.stat-figure[data-count-to]');
  if (stats.length) {
    function formatStat(el, value) {
      var prefix = el.getAttribute('data-count-prefix') || '';
      var suffix = el.getAttribute('data-count-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      el.textContent = prefix + value.toFixed(decimals) + suffix;
    }
    function runCount(el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      if (isNaN(target)) return;
      if (reduceMotion) { formatStat(el, target); return; }
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
    if (!('IntersectionObserver' in window)) {
      stats.forEach(function (el) { runCount(el); });
    } else {
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
  }

  /* ---------- Hero parallax (light) ---------- */
  if (!reduceMotion) {
    var glowA = document.querySelector('.hero-glow--a');
    var glowB = document.querySelector('.hero-glow--b');
    var lines = document.querySelector('.hero-lines');
    var ticking = false;

    function applyParallax() {
      var y = window.scrollY;
      if (glowA) glowA.style.transform = 'translate3d(0,' + (y * 0.15) + 'px,0)';
      if (glowB) glowB.style.transform = 'translate3d(0,' + (y * -0.10) + 'px,0)';
      if (lines) lines.style.transform = 'translate3d(0,' + (y * 0.05) + 'px,0)';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Smooth anchor scroll offset for sticky nav ----------
     CSS scroll-padding handles most of this; the fix below catches the
     case where the user lands on a hash on initial load. */
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
