/* ═══════════════════════════════════════════════════════════
   AECS4U GitHub Pages — Interactions & i18n
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── i18n Engine ───
  var i18nAvailable = typeof I18N !== 'undefined' && I18N._supported;
  var currentLang = i18nAvailable ? I18N._fallback : 'en';

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* quota or disabled */ }
  }

  function detectLocale() {
    if (!i18nAvailable) return 'en';
    // 1. Check localStorage for user preference
    var stored = storageGet('aecs4u-lang');
    if (stored && I18N._supported.indexOf(stored) !== -1) return stored;

    // 2. Check browser languages
    var langs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (var i = 0; i < langs.length; i++) {
      var code = langs[i].toLowerCase().split('-')[0];
      if (I18N._supported.indexOf(code) !== -1) return code;
    }

    // 3. Fallback
    return I18N._fallback;
  }

  function applyTranslations(lang) {
    if (!i18nAvailable) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    storageSet('aecs4u-lang', lang);

    // Update text nodes (data-i18n)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (I18N[key] && I18N[key][lang]) {
        el.textContent = I18N[key][lang];
      }
    });

    // Update HTML nodes (data-i18n-html) — for content with inline markup
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (I18N[key] && I18N[key][lang]) {
        el.innerHTML = I18N[key][lang];
      }
    });

    // Update lang switcher display
    var codeEl = document.getElementById('lang-code');
    var flagEl = document.getElementById('lang-flag');
    if (codeEl) codeEl.textContent = lang.toUpperCase();
    if (flagEl) flagEl.textContent = I18N._flags[lang] || '';

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });
  }

  function buildLangDropdown() {
    var dropdown = document.getElementById('lang-dropdown');
    if (!dropdown) return;

    I18N._supported.forEach(function (code) {
      var li = document.createElement('li');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'lang-option';
      button.setAttribute('data-lang', code);
      button.innerHTML = '<span class="lang-flag">' + I18N._flags[code] + '</span> ' + I18N._labels[code];
      button.addEventListener('click', function (e) {
        e.stopPropagation();
        applyTranslations(code);
        closeLangDropdown();
      });
      li.appendChild(button);
      dropdown.appendChild(li);
    });
  }

  function closeLangDropdown() {
    var switcher = document.getElementById('lang-switcher');
    if (switcher) switcher.classList.remove('open');
    if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
  }

  // Toggle dropdown
  var langBtn = document.getElementById('lang-current');
  if (langBtn) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var switcher = document.getElementById('lang-switcher');
      var open = switcher.classList.toggle('open');
      langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', closeLangDropdown);

  // Build and apply
  buildLangDropdown();
  applyTranslations(detectLocale());

  // ─── Navigation scroll effect ───
  var nav = document.getElementById('nav');

  function onScroll() {
    var y = window.scrollY;
    if (y > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── Active nav link highlight ───
  var sections = document.querySelectorAll('.section, .hero');
  var navLinks = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    var scrollPos = window.scrollY + window.innerHeight * 0.35;
    var current = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ─── Mobile menu toggle ───
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-links');

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.classList.remove('open');
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('open');
      menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Close mobile menu on link click
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeLangDropdown();
      closeMenu();
    }
  });

  // ─── Animate-in on scroll (Intersection Observer) ───
  var animateEls = document.querySelectorAll('.animate-in');
  var cards = document.querySelectorAll(
    '.proof-item, .offering-card, .highlight-card, .domain-card, .featured-card, .tech-category, .oss-card, .contact-link'
  );

  // Add animate-in class to cards too
  cards.forEach(function (card) {
    card.classList.add('animate-in');
  });

  // Re-query all animate-in elements after adding to cards
  animateEls = document.querySelectorAll('.animate-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = entry.target.getAttribute('data-delay');
            var ms = delay ? parseInt(delay, 10) * 150 : 0;
            var reveal = function () {
              entry.target.classList.add('visible');
            };
            if (reducedMotion || ms === 0) {
              reveal();
            } else {
              setTimeout(reveal, ms);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animateEls.forEach(function (el) {
      // Stagger cards within the same parent
      if (!el.hasAttribute('data-delay') && el.closest('.proof-grid, .offerings-grid, .domains-grid, .featured-grid, .oss-grid, .tech-grid, .about-highlights')) {
        var siblings = el.parentNode.querySelectorAll('.animate-in');
        var idx = Array.prototype.indexOf.call(siblings, el);
        el.setAttribute('data-delay', idx);
      }
      observer.observe(el);
    });
  } else {
    // Fallback: show everything
    animateEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ─── Counter animation for hero stats ───
  var statNumbers = document.querySelectorAll('.stat-number[data-count]');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  if (reducedMotion) {
    statNumbers.forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
  } else if ('IntersectionObserver' in window) {
    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) {
      statsObserver.observe(el);
    });
  } else {
    statNumbers.forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
  }

  // ─── Smooth scroll for anchor links ───
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // ─── Initial call ───
  onScroll();
  highlightNav();
})();
