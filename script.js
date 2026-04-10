/* ═══════════════════════════════════════════════════════════
   AECS4U GitHub Pages — Interactions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Navigation scroll effect ───
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    if (y > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── Active nav link highlight ───
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    let current = '';

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
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-links');

  toggle.addEventListener('click', function () {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.classList.remove('open');
      menu.classList.remove('open');
    });
  });

  // ─── Animate-in on scroll (Intersection Observer) ───
  var animateEls = document.querySelectorAll('.animate-in');
  var cards = document.querySelectorAll(
    '.highlight-card, .domain-card, .featured-card, .tech-category, .oss-card, .contact-link'
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
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, ms);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animateEls.forEach(function (el, index) {
      // Stagger cards within the same parent
      if (!el.hasAttribute('data-delay') && el.closest('.domains-grid, .featured-grid, .oss-grid, .tech-grid, .about-highlights')) {
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

  if ('IntersectionObserver' in window) {
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
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ─── Initial call ───
  onScroll();
  highlightNav();
})();
