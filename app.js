/* =================================================================
   The Cloister — app.js
   - Smooth scroll for in-page nav (graceful fallback)
   - Lightbox: ESC + click-outside + focus trap, no library
   - Renders rooms / materials / code / numbers from JSON on load
   ================================================================= */
(function () {
  'use strict';

  // -----------------------------------------------------------------
  // Smooth scroll (CSS already handles it; this adds offset for sticky
  // masthead and fallback behavior for older browsers).
  // -----------------------------------------------------------------
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update hash without forcing a jump
        if (history.replaceState) history.replaceState(null, '', href);
      });
    });
  }

  // -----------------------------------------------------------------
  // Lightbox
  // -----------------------------------------------------------------
  var lightbox = {
    el: null,
    img: null,
    cap: null,
    closeBtn: null,
    lastFocus: null,
    isOpen: false,

    init: function () {
      this.el = document.getElementById('lightbox');
      if (!this.el) return;
      this.img = this.el.querySelector('.lightbox__image');
      this.cap = this.el.querySelector('.lightbox__caption');
      this.closeBtn = this.el.querySelector('.lightbox__close');

      var self = this;

      this.closeBtn.addEventListener('click', function () { self.close(); });

      this.el.addEventListener('click', function (e) {
        // Click outside the figure (i.e. on the backdrop) closes
        if (e.target === self.el) self.close();
      });

      document.addEventListener('keydown', function (e) {
        if (!self.isOpen) return;
        if (e.key === 'Escape' || e.key === 'Esc') {
          e.preventDefault();
          self.close();
        } else if (e.key === 'Tab') {
          // Trap focus on the close button (only focusable element)
          e.preventDefault();
          self.closeBtn.focus();
        }
      });

      // Bind any lightbox-trigger images, including those rendered later
      document.addEventListener('click', function (e) {
        var t = e.target;
        if (!(t instanceof Element)) return;
        var trigger = t.closest('.lightbox-trigger');
        if (!trigger) return;
        if (trigger.tagName !== 'IMG') return;
        e.preventDefault();
        var src = trigger.getAttribute('src') || '';
        var caption = trigger.getAttribute('data-caption')
          || trigger.getAttribute('alt')
          || '';
        self.open(src, caption, trigger.getAttribute('alt') || '');
      });
    },

    open: function (src, caption, alt) {
      if (!this.el || !src) return;
      this.lastFocus = document.activeElement;
      this.img.src = src;
      this.img.alt = alt || '';
      this.cap.textContent = caption || '';
      this.el.classList.add('is-open');
      this.el.setAttribute('aria-hidden', 'false');
      this.isOpen = true;
      // Defer focus so transition completes
      var btn = this.closeBtn;
      requestAnimationFrame(function () { btn.focus(); });
      document.body.style.overflow = 'hidden';
    },

    close: function () {
      if (!this.el) return;
      this.el.classList.remove('is-open');
      this.el.setAttribute('aria-hidden', 'true');
      this.img.src = '';
      this.img.alt = '';
      this.cap.textContent = '';
      this.isOpen = false;
      document.body.style.overflow = '';
      if (this.lastFocus && typeof this.lastFocus.focus === 'function') {
        this.lastFocus.focus();
      }
    }
  };

  // -----------------------------------------------------------------
  // JSON loaders + renderers
  // -----------------------------------------------------------------
  function safeFetchJSON(url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
        return r.json();
      })
      .catch(function (err) {
        // Don't pollute console with failures — return null and let UI fall back.
        console.warn('[Cloister] could not load ' + url + ':', err.message);
        return null;
      });
  }

  function escapeHTML(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function show(el) { if (el) el.classList.add('is-shown'); }
  function hide(el) { if (el) el.classList.remove('is-shown'); }

  // Accept either a top-level array OR an object with a named array key.
  function asArray(data, keys) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      for (var i = 0; i < keys.length; i++) {
        if (Array.isArray(data[keys[i]])) return data[keys[i]];
      }
    }
    return [];
  }

  // Image guess: data may not include an explicit image path.
  function guessImage(obj, fallbackBase) {
    if (obj && obj.image) return obj.image;
    if (obj && obj.id) return fallbackBase + '/' + obj.id + '.jpg';
    if (obj && obj.name) {
      var slug = String(obj.name).toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return fallbackBase + '/' + slug + '.jpg';
    }
    return '';
  }

  function formatPrice(v) {
    if (v == null || v === '') return '';
    if (typeof v === 'number') return '$' + v + ' / night';
    return String(v);
  }

  // ---- Rooms (data/program.json) ----
  function renderRooms(data) {
    var grid = document.getElementById('rooms-grid');
    var empty = document.getElementById('rooms-empty');
    if (!grid) return;

    var rooms = asArray(data, ['rooms', 'program']);
    if (!rooms.length) { show(empty); return; }
    hide(empty);

    grid.innerHTML = rooms.map(function (r) {
      var name = r.name || '';
      var type = r.type || '';
      // Choose the right unit for this program type.
      // Sleeping rooms: show explicit `beds` if set, else infer.
      // Non-sleeping spaces: show capacity as occupants/seats.
      var isSleeping = r.price_per_night != null;
      var bedsToken = '';
      if (isSleeping) {
        if (r.beds != null) {
          var bn = Number(r.beds);
          bedsToken = (!isNaN(bn) ? (bn + (bn === 1 ? ' bed' : ' beds')) : (r.beds + ' beds'));
        } else if (r.capacity != null) {
          var cn = Number(r.capacity);
          bedsToken = (!isNaN(cn) ? ('sleeps ' + cn) : ('sleeps ' + r.capacity));
        }
      } else if (r.capacity != null) {
        bedsToken = (r.capacity_unit ? r.capacity + ' ' + r.capacity_unit : 'seats ' + r.capacity);
      }
      var size = r.size || (r.sqft != null ? (r.sqft + ' sq ft') : '');
      var price = r.price || formatPrice(r.price_per_night);
      var description = r.short_desc || r.description || '';

      var meta = [];
      if (type) meta.push('<span>' + escapeHTML(type) + '</span>');
      if (bedsToken) meta.push('<span>' + escapeHTML(bedsToken) + '</span>');
      if (size) meta.push('<span>' + escapeHTML(size) + '</span>');

      var img = guessImage(r, 'images');
      var alt = name || 'Room';
      var caption = name + (description ? ' — ' + description : '');

      return ''
        + '<article class="room-card">'
        +   (img ? '<img src="' + escapeHTML(img) + '" alt="' + escapeHTML(alt) + '" class="room-card__image lightbox-trigger" data-caption="' + escapeHTML(caption) + '" loading="lazy" />' : '')
        +   '<h3 class="room-card__name"><em>' + escapeHTML(name) + '</em></h3>'
        +   (meta.length ? '<p class="room-card__meta">' + meta.join('') + '</p>' : '')
        +   (description ? '<p class="room-card__desc">' + escapeHTML(description) + '</p>' : '')
        +   (price ? '<p class="room-card__price">' + escapeHTML(price) + '</p>' : '')
        + '</article>';
    }).join('');
  }

  // ---- Materials (data/materials.json) ----
  function renderMaterials(data) {
    var grid = document.getElementById('materials-grid');
    var empty = document.getElementById('materials-empty');
    if (!grid) return;

    var mats = asArray(data, ['materials']);
    if (!mats.length) { show(empty); return; }
    hide(empty);

    grid.innerHTML = mats.map(function (m) {
      var name = m.name || '';
      var origin = m.origin || '';
      var lifespan = m.lifespan
        || (m.lifespan_years != null ? (m.lifespan_years + '-yr lifespan') : '');
      var repair = m.repairability || '';
      var description = m.spec || m.description || '';

      var meta = [];
      if (lifespan) meta.push('<span>' + escapeHTML(lifespan) + '</span>');
      if (repair)   meta.push('<span>' + escapeHTML(repair) + '</span>');

      // Use a CSS swatch (not a photo) — more elegant for a designer's palette.
      var slug = (m.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      var swatch = '<div class="material-card__swatch" data-mat="' + escapeHTML(slug) + '" aria-hidden="true"></div>';

      return ''
        + '<article class="material-card">'
        +   swatch
        +   '<h3 class="material-card__name"><em>' + escapeHTML(name) + '</em></h3>'
        +   (origin ? '<p class="material-card__meta"><span>' + escapeHTML(origin) + '</span></p>' : '')
        +   (meta.length ? '<p class="material-card__meta">' + meta.join('') + '</p>' : '')
        +   (description ? '<p class="material-card__desc">' + escapeHTML(description) + '</p>' : '')
        + '</article>';
    }).join('');
  }

  function renderSectionIntro(elemId, text, italic) {
    var host = document.getElementById(elemId);
    if (!host || !text) return;
    var p = document.createElement('p');
    p.className = 'section__data-intro' + (italic ? ' section__data-intro--italic' : '');
    p.textContent = text;
    host.parentNode.insertBefore(p, host);
  }

  // ---- Code (data/code.json#items) ----
  function renderCode(data) {
    var grid = document.getElementById('code-grid');
    var empty = document.getElementById('code-empty');
    if (!grid) return;

    var items = (data && Array.isArray(data.items)) ? data.items : [];
    if (!items.length) { show(empty); return; }
    hide(empty);

    grid.innerHTML = items.map(function (it) {
      var status = it.status ? String(it.status).toLowerCase() : '';
      return ''
        + '<div class="code-item">'
        +   '<div class="code-item__cite">' + escapeHTML(it.cite || '') + '</div>'
        +   '<div class="code-item__body">'
        +     '<h3>' + escapeHTML(it.title || '') + '</h3>'
        +     (it.note ? '<p>' + escapeHTML(it.note) + '</p>' : '')
        +     (it.status ? '<p class="code-item__status" data-status="' + escapeHTML(status) + '">' + escapeHTML(it.status) + '</p>' : '')
        +   '</div>'
        + '</div>';
    }).join('');
  }

  // ---- Numbers (data/code.json#numbers) ----
  function renderNumbers(data) {
    var tbody = document.getElementById('numbers-tbody');
    var empty = document.getElementById('numbers-empty');
    var table = document.getElementById('numbers-table');
    if (!tbody) return;

    var n = (data && data.numbers) ? data.numbers : null;
    var rows = (n && Array.isArray(n.breakdown)) ? n.breakdown : [];

    if (!rows.length) {
      if (table) table.style.display = 'none';
      show(empty);
      return;
    }
    hide(empty);
    if (table) table.style.display = '';

    tbody.innerHTML = rows.map(function (row) {
      return ''
        + '<tr>'
        +   '<td><em>' + escapeHTML(row.program || '') + '</em></td>'
        +   '<td>' + escapeHTML(row.beds != null ? row.beds : '') + '</td>'
        +   '<td>' + escapeHTML(row.sqft != null ? row.sqft : '') + '</td>'
        +   '<td>' + escapeHTML(row.rate || '') + '</td>'
        + '</tr>';
    }).join('');
  }

  // -----------------------------------------------------------------
  // Boot
  // -----------------------------------------------------------------
  function init() {
    initSmoothScroll();
    lightbox.init();

    safeFetchJSON('data/program.json').then(renderRooms);
    safeFetchJSON('data/materials.json').then(renderMaterials);
    safeFetchJSON('data/code.json').then(function (data) {
      if (data && data.intro) renderSectionIntro('code-grid', data.intro, false);
      if (data && data.numbers_intro) renderSectionIntro('numbers-wrap', data.numbers_intro, true);
      renderCode(data);
      renderNumbers(data);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
