/* =========================================================
   SMARTEASE PROPERTIES
   Shared interaction + animation script
   ---------------------------------------------------------
   Ported from the HNCF template: preloader, nav auto-hide,
   scroll progress, full-screen mobile menu, staggered scroll
   reveal, line-by-line heading reveal, count-up numbers,
   parallax, accordion, back to top. Extended with the
   SmartEase modules: tab groups (unit / path) and the
   spec index.
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── PRELOADER ─────────────────────────────────────── */
  window.addEventListener('load', function () {
    var pre = $('#preloader');
    if (pre) setTimeout(function () { pre.classList.add('done'); }, reduce ? 0 : 450);
  });
  // safety net if load never fires
  setTimeout(function () {
    var pre = $('#preloader');
    if (pre) pre.classList.add('done');
  }, 2600);

  /* ── NAV: shadow, auto-hide, scroll progress ───────── */
  var nav = $('#nav');
  var bar = $('#scroll-progress');
  var toTop = $('#to-top');
  var waFloat = $('.wa-float');
  var lastY = window.scrollY;

  function onScroll() {
    var y = window.scrollY;

    if (nav) {
      nav.classList.toggle('scrolled', y > 30);
      // hide on scroll down, reveal on scroll up (not while the menu is open)
      if (!document.body.classList.contains('menu-open')) {
        if (y > 380 && y > lastY + 6) nav.classList.add('hidden');
        else if (y < lastY - 6) nav.classList.remove('hidden');
      }
    }

    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }

    if (toTop) toTop.classList.toggle('show', y > 620);
    if (waFloat) waFloat.classList.toggle('show', y > 320);

    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── MOBILE MENU ───────────────────────────────────── */
  var burger = $('#burger');
  var menu = $('#mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open && nav) nav.classList.remove('hidden');
      if (!open) closeAllSubmenus();
    });

    // close the menu on any real navigation link (not the submenu toggles)
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.classList.remove('open');
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
        closeAllSubmenus();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) burger.click();
    });
  }

  function closeAllSubmenus() {
    $$('.m-item.open').forEach(function (item) {
      item.classList.remove('open');
      var sub = $('.m-sub', item);
      if (sub) sub.style.maxHeight = null;
      var btn = $('.m-toggle', item);
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  /* mobile submenu accordion */
  $$('.m-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.m-item');
      var sub = $('.m-sub', item);
      var isOpen = item.classList.contains('open');

      $$('.m-item.open').forEach(function (other) {
        if (other === item) return;
        other.classList.remove('open');
        var s = $('.m-sub', other);
        if (s) s.style.maxHeight = null;
        var b = $('.m-toggle', other);
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      if (sub) sub.style.maxHeight = !isOpen ? sub.scrollHeight + 'px' : null;
    });
  });

  /* ── SCROLL REVEAL (staggered) ─────────────────────── */
  /* The inner pages mark blocks with .reveal / .reveal-stagger. Upgrade those
     to the data-reveal API first so one observer covers the whole site. */
  $$('.reveal').forEach(function (el) {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'up');
  });
  $$('.reveal-stagger').forEach(function (group) {
    group.setAttribute('data-stagger', '');
    Array.prototype.slice.call(group.children).forEach(function (child) {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', 'up');
    });
  });

  var revealEls = $$('[data-reveal]');
  if (revealEls.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function () { el.classList.add('in'); }, delay);
          io.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      // auto-stagger direct children of a [data-stagger] container
      $$('[data-stagger]').forEach(function (group) {
        $$('[data-reveal]', group).forEach(function (el, i) {
          if (!el.hasAttribute('data-delay')) el.setAttribute('data-delay', String(i * 110));
        });
      });

      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ── LINE-BY-LINE HEADING REVEAL ───────────────────── */
  var lineBlocks = $$('.reveal-lines');
  if (lineBlocks.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      lineBlocks.forEach(function (el) { el.classList.add('in'); });
    } else {
      var lio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); lio.unobserve(e.target); }
        });
      }, { threshold: 0.25 });
      lineBlocks.forEach(function (el) { lio.observe(el); });
    }
  }

  /* ── COUNT-UP NUMBERS ──────────────────────────────── */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var pad = parseInt(el.getAttribute('data-pad') || '0', 10);
    var dur = 1600;
    var start = null;

    function render(value) {
      var out;
      if (target % 1 === 0) {
        out = Math.round(value).toString();
        while (pad && out.length < pad) out = '0' + out;
        if (!pad) out = Math.round(value).toLocaleString();
      } else {
        out = value.toFixed(1);
      }
      el.textContent = prefix + out + suffix;
    }

    if (reduce) { render(target); return; }

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      render(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = $$('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(countUp);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ── PARALLAX ──────────────────────────────────────── */
  var pxEls = $$('.parallax');
  if (pxEls.length && !reduce) {
    var ticking = false;
    var runParallax = function () {
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-speed') || '0.12');
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = 'translate3d(0,' + (-offset).toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(runParallax); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', runParallax);
    runParallax();
  }

  /* ── ACCORDION ─────────────────────────────────────── */
  $$('.acc-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = head.closest('.acc-item');
      var body = $('.acc-body', item);
      var isOpen = item.classList.contains('open');

      $$('.acc-item.open').forEach(function (other) {
        if (other === item) return;
        other.classList.remove('open');
        $('.acc-body', other).style.maxHeight = null;
        $('.acc-head', other).setAttribute('aria-expanded', 'false');
      });

      item.classList.toggle('open', !isOpen);
      head.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
    });
  });

  /* ── TAB GROUPS (unit tabs, path tabs) ─────────────── */
  /* A [data-tabs="name"] bar drives [data-panels="name"] panels.
     Buttons carry data-tab, panels carry a matching data-panel. */
  $$('[data-tabs]').forEach(function (bar) {
    var name = bar.getAttribute('data-tabs');
    var panelWrap = $('[data-panels="' + name + '"]');
    if (!panelWrap) return;
    var buttons = $$('button', bar);
    var panels = $$('.panel', panelWrap);

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-tab');
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === key);
        });
      });
    });
  });

  /* ── SPEC INDEX ────────────────────────────────────── */
  var specRows = $$('.spec-row');
  var specImgs = $$('.simg');
  if (specRows.length && specImgs.length) {
    var showSpec = function (row) {
      if (row.classList.contains('active')) return;
      specRows.forEach(function (r) { r.classList.remove('active'); });
      row.classList.add('active');
      var idx = row.getAttribute('data-simg');
      specImgs.forEach(function (s) {
        s.classList.toggle('active', s.getAttribute('data-simg') === idx);
      });
    };
    specRows.forEach(function (row) {
      row.addEventListener('click', function () { showSpec(row); });
      row.addEventListener('mouseenter', function () { showSpec(row); });
      row.addEventListener('focus', function () { showSpec(row); });
    });
  }

  /* ── GALLERY FILTER + LIGHTBOX ─────────────────────── */
  var filterBtns = $$('.filter-bar button');
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.getAttribute('data-filter');
        $$('.g-item').forEach(function (item) {
          var match = f === 'all' || item.getAttribute('data-cat') === f;
          item.classList.toggle('hide', !match);
        });
      });
    });
  }

  var lb = $('#lightbox');
  if (lb) {
    var lbImg = $('img', lb);
    var lbCap = $('.lightbox-cap', lb);
    var closeLb = function () {
      lb.classList.remove('open');
      document.body.classList.remove('menu-open');
    };
    $$('.g-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var img = $('img', item);
        if (!img) return;
        lbImg.src = img.getAttribute('src');
        lbImg.alt = img.getAttribute('alt') || '';
        var cap = $('.g-cap strong', item);
        if (lbCap) lbCap.textContent = cap ? cap.textContent : '';
        lb.classList.add('open');
        document.body.classList.add('menu-open');
      });
    });
    var lbClose = $('.lightbox-close', lb);
    if (lbClose) lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLb();
    });
  }

  /* ── FORMS (demo handling, no backend) ─────────────── */
  $$('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('.form-status', form);
      if (!status) return;
      status.textContent = form.getAttribute('data-message') ||
        'Thank you. Your message has been recorded and the team will be in touch.';
      status.classList.add('show');
      form.reset();
      setTimeout(function () { status.classList.remove('show'); }, 7000);
    });
  });

  /* ── BACK TO TOP ───────────────────────────────────── */
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ── FOOTER YEAR ───────────────────────────────────── */
  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

})();
