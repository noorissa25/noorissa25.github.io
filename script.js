(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Dates ---------- */
  var now = new Date();
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(now.getFullYear());

  /* ---------- Optional photos ---------- */
  // Photo slots show a placeholder until their file exists; drop the <img> if it fails to load.
  document.querySelectorAll('img[data-optional]').forEach(function (img) {
    var drop = function () { img.remove(); };
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop, { once: true });
  });

  /* ---------- Hero typing ---------- */
  // Each line types out after the previous one; CSS does the work, JS sets the timing.
  var lines = document.querySelectorAll('.hero-code .code-line');
  var delay = 0.35;
  lines.forEach(function (line) {
    var n = line.textContent.length + 1;
    var dur = Math.min(1.2, Math.max(0.35, n * 0.02));
    line.style.setProperty('--n', n);
    line.style.setProperty('--dur', dur + 's');
    line.style.setProperty('--delay', delay + 's');
    delay += dur + 0.08;
  });

  /* ---------- Header state + active nav ---------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) io.observe(s); });
  }

  /* ---------- Timeline scroll buttons ---------- */
  var track = document.querySelector('.timeline-track');
  var scrollBtns = Array.prototype.slice.call(document.querySelectorAll('[data-scroll]'));
  scrollBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Step by a regular card; the first one is wider.
      var step = track.querySelector('.commit:nth-child(2)').getBoundingClientRect().width + 20;
      track.scrollBy({ left: Number(btn.dataset.scroll) * step, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  });
  // Disable an arrow when there is nothing further to scroll in its direction.
  var syncScrollBtns = function () {
    var max = track.scrollWidth - track.clientWidth - 1;
    scrollBtns.forEach(function (btn) {
      btn.disabled = Number(btn.dataset.scroll) < 0 ? track.scrollLeft <= 0 : track.scrollLeft >= max;
    });
  };
  track.addEventListener('scroll', syncScrollBtns, { passive: true });
  window.addEventListener('resize', syncScrollBtns);
  syncScrollBtns();

  /* ---------- Tabs (WAI-ARIA tabs pattern) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  });

  /* ---------- Email ---------- */
  // The address is put together here instead of sitting in the HTML, so scrapers that
  // read the page source don't pick it up.
  var EMAIL = ['noorissa2021', 'gmail.com'].join('@');
  var mailto = function (subject, body) {
    var q = [];
    if (subject) q.push('subject=' + encodeURIComponent(subject));
    if (body) q.push('body=' + encodeURIComponent(body));
    return 'mailto:' + EMAIL + (q.length ? '?' + q.join('&') : '');
  };
  document.querySelectorAll('[data-mail-subject]').forEach(function (a) {
    a.href = mailto(a.dataset.mailSubject);
  });

  /* ---------- Theme: lights on / off ---------- */
  var themeLabel = document.querySelector('.theme-label');
  var isDark = function () {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  var syncThemeLabel = function () {
    if (themeLabel) themeLabel.textContent = isDark() ? 'Turn the lights on' : 'Turn the lights off';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = isDark() ? '#14161B' : '#F5F6F3';
  };
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('noor-theme', next); } catch (e) {}
      syncThemeLabel();
    });
  });
  syncThemeLabel();

  /* ---------- Lamp menu ---------- */
  var lamp = document.querySelector('[data-lamp]');
  var lampBtn = lamp.querySelector('.lamp-btn');
  var lampMenu = lamp.querySelector('.lamp-menu');
  var setLamp = function (open) {
    lampMenu.hidden = !open;
    lampBtn.setAttribute('aria-expanded', String(open));
    lampBtn.setAttribute('aria-label', open ? 'Close quick actions' : 'Open quick actions');
  };
  lampBtn.addEventListener('click', function () { setLamp(lampMenu.hidden); });
  document.addEventListener('click', function (e) { if (!lamp.contains(e.target)) setLamp(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lampMenu.hidden) { setLamp(false); lampBtn.focus(); }
  });

  /* ---------- Message dialog ---------- */
  var dialog = document.getElementById('message-dialog');
  var form = dialog.querySelector('form');
  var opener = null;
  var openDialog = function (e) {
    opener = e.currentTarget;
    setLamp(false);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.location.href = mailto();
  };
  document.querySelectorAll('[data-open-message]').forEach(function (b) { b.addEventListener('click', openDialog); });
  dialog.querySelector('[data-close-message]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { if (opener && document.contains(opener)) opener.focus(); });

  var validate = function (field, message) {
    var err = document.getElementById(field.getAttribute('aria-describedby'));
    var ok = field.value.trim().length > 0;
    field.setAttribute('aria-invalid', String(!ok));
    err.textContent = ok ? '' : message;
    return ok;
  };
  var nameField = form.elements.name;
  var bodyField = form.elements.message;
  nameField.addEventListener('blur', function () { if (nameField.getAttribute('aria-invalid')) validate(nameField, 'Add your name so I know who’s writing.'); });
  bodyField.addEventListener('blur', function () { if (bodyField.getAttribute('aria-invalid')) validate(bodyField, 'Write a message before sending.'); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okName = validate(nameField, 'Add your name so I know who’s writing.');
    var okBody = validate(bodyField, 'Write a message before sending.');
    if (!okName) { nameField.focus(); return; }
    if (!okBody) { bodyField.focus(); return; }
    var subject = 'Hello from ' + nameField.value.trim();
    window.location.href = mailto(subject, bodyField.value.trim());
    dialog.close();
    form.reset();
  });
})();
