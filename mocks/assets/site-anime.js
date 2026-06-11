/* =========================================================================
   Calpe Capital — anime.js mock
   Layered on top of site.js. Keeps the existing nav, parallax, smooth
   anchor handling. Replaces the reveal mechanism for selected elements
   and adds: hero word-split, logo line-draw, scroll-linked curves,
   practice-list stagger, eyebrow rule grow.
   ========================================================================= */

(function () {
  'use strict';

  if (!window.anime) {
    console.warn('[calpe-anime] anime.js not loaded; mock animations skipped.');
    return;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var anime = window.anime;
  var animate = anime.animate;
  var stagger = anime.stagger;
  var onScroll = anime.onScroll;
  var createDrawable = anime.svg ? anime.svg.createDrawable : anime.createDrawable;

  /* ---------- 1. Hero headline split-reveal ---------------------------- */
  // Split the H1 into words while preserving the <br> and the
  // <span class="italic"> inside it.
  function splitWords(node) {
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      var parts = tn.nodeValue.split(/(\s+)/);
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
        } else {
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = p;
          frag.appendChild(span);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  var hero = document.getElementById('hero-title');
  if (hero) {
    splitWords(hero);
    animate(hero.querySelectorAll('.word'), {
      opacity: [0, 1],
      translateY: ['40%', '0%'],
      duration: 900,
      delay: stagger(55, { start: 120 }),
      ease: 'out(3)'
    });
  }

  /* ---------- 2. Logo line-draw on load -------------------------------- */
  var header = document.getElementById('siteHeader');
  var headerSvg = header && header.querySelector('.nav-icon svg');
  if (headerSvg && createDrawable) {
    var strokes = headerSvg.querySelectorAll('.col, .accent');
    var drawables = createDrawable(strokes);
    animate(drawables, {
      draw: ['0 0', '0 1'],
      duration: 1100,
      delay: stagger(40),
      ease: 'inOut(2)',
      onComplete: function () { header.classList.add('logo-drawn'); }
    });
  } else if (headerSvg) {
    // Fallback: just mark drawn so fills appear.
    header.classList.add('logo-drawn');
  }

  /* ---------- 3. Scroll-linked hero curves ----------------------------- */
  var heroLines = document.querySelectorAll('.hero-lines path');
  if (heroLines.length) {
    heroLines.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.setProperty('--len', len);
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });

    // Tie dashoffset to scroll progress through the hero section.
    var heroSection = document.querySelector('.hero');
    function tick() {
      if (!heroSection) return;
      var rect = heroSection.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      // 0 when hero top is at viewport top, 1 when hero is fully scrolled past.
      var progress = Math.min(1, Math.max(0, -rect.top / (rect.height - vh * 0.4)));
      heroLines.forEach(function (p, i) {
        var len = parseFloat(p.style.getPropertyValue('--len')) || 2400;
        var offset = len * (1 - Math.min(1, progress + i * 0.05));
        p.style.strokeDashoffset = offset;
      });
    }
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  }

  /* ---------- 5. Practice list stagger --------------------------------- */
  var practiceItems = document.querySelectorAll('.practice-item');
  if (practiceItems.length) {
    practiceItems.forEach(function (el) { el.classList.add('anime-init'); });

    var practiceObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        // Animate the whole batch when the first item enters; we observe
        // the list container by observing each item but only trigger once.
        animate(practiceItems, {
          opacity: [0, 1],
          translateY: [32, 0],
          duration: 800,
          delay: stagger(140),
          ease: 'out(3)'
        });
        animate(document.querySelectorAll('.practice-item .practice-num'), {
          opacity: [0, 1],
          translateX: [-18, 0],
          duration: 800,
          delay: stagger(140, { start: 60 }),
          ease: 'out(3)'
        });
        // No need to keep observing the rest.
        practiceItems.forEach(function (el) { practiceObserver.unobserve(el); });
      });
    }, { threshold: 0.2 });
    practiceItems.forEach(function (el) { practiceObserver.observe(el); });
  }

  /* ---------- 7. Eyebrow underline grow -------------------------------- */
  // The eyebrow ::before is a small horizontal rule. We animate its
  // scaleX from 0 to 1 when its parent section enters view.
  var eyebrows = document.querySelectorAll('.eyebrow');
  eyebrows.forEach(function (eb) { eb.classList.add('anime-rule'); });

  // We can't transition a pseudo-element directly with anime.js without
  // a CSS variable trick. Use a CSS custom property and let CSS read it.
  var eyebrowStyle = document.createElement('style');
  eyebrowStyle.textContent =
    '.eyebrow.anime-rule::before { transform: scaleX(var(--rule, 0)); }';
  document.head.appendChild(eyebrowStyle);

  var ebObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      var target = entry.target;
      // Animate a JS object and write its value to the element style.
      animate({ v: 0 }, {
        v: 1,
        duration: 700,
        ease: 'inOut(2)',
        onUpdate: function (anim) {
          target.style.setProperty('--rule', anim.targets[0].v);
        }
      });
    });
  }, { threshold: 0.4 });
  eyebrows.forEach(function (eb) { ebObserver.observe(eb); });

})();
