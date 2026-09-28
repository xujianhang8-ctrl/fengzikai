/* 护生之约 · core.js
 * Game state, words, screens and the shared pieces of UI:
 * the cat guide, story cards, seals, the album leaf that appears when a
 * page is finished, and saving pictures. */
(function () {
  'use strict';

  const HS = (window.HS = {});
  const NS = 'http://www.w3.org/2000/svg';
  const KEY = 'husheng-zhiyue:v1';
  const DRAFT_KEY = 'husheng-zhiyue:draft';
  HS.NS = NS;

  /* ---------- state (kept in this browser only) ---------- */
  const fresh = () => ({ name: '', sound: true, easy: false, pages: {}, prologue: false, quiz: { best: 0, passed: false } });

  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
    const s = Object.assign(fresh(), saved && typeof saved === 'object' ? saved : {});
    if (!s.pages || typeof s.pages !== 'object') s.pages = {};
    if (!s.quiz || typeof s.quiz !== 'object') s.quiz = { best: 0, passed: false };
    return s;
  }
  HS.state = load();
  HS.save = () => { try { localStorage.setItem(KEY, JSON.stringify(HS.state)); } catch (e) { /* storage unavailable */ } };
  HS.loadDraft = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (e) { return null; } };
  HS.saveDraft = (d) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); return true; } catch (e) { return false; } };
  /* Start over: clear the album, seals, name, painting draft and quiz.
   * Sound and gentle mode are settings of this device, so they stay. */
  HS.reset = () => {
    const keep = { sound: HS.state.sound, easy: HS.state.easy };
    HS.state = Object.assign(fresh(), keep);
    try { localStorage.removeItem(KEY); localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
    HS.save();
  };

  HS.progress = () => {
    let done = 0, seals = 0;
    for (const c of HS.chapters) {
      const p = HS.state.pages[c.id];
      if (p && p.done) { done++; seals += p.seals || 0; }
    }
    return { done, seals, total: HS.chapters.length };
  };

  /* ---------- words ---------- */
  HS.t = function (key, vars) {
    let v = window.STR.zh[key];
    if (v === undefined) return key;
    if (vars && typeof v === 'string') v = v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    return v;
  };
  HS.zh = (key) => window.STR.zh[key];
  const ZH_NUM = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  HS.pageNo = (n) => HS.t('ui.pageN', { n: ZH_NUM[n] || n });

  HS.applyLang = function () {
    document.documentElement.lang = 'zh-CN';
    document.title = '护生之约';
  };

  /* ---------- DOM helpers ---------- */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) {
      for (const k in props) {
        const v = props[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of kids.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  HS.h = h;

  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  HS.svgEl = svgEl;

  /* Parse SVG markup into a new <g> inside `parent`. */
  HS.sprite = function (parent, markup, attrs) {
    const g = svgEl('g', attrs);
    g.innerHTML = markup;
    parent.appendChild(g);
    return g;
  };

  HS.setPos = function (el, x, y, rot = 0, s = 1, flip = false) {
    el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})${rot ? ` rotate(${rot.toFixed(1)})` : ''}${s !== 1 || flip ? ` scale(${flip ? -s : s} ${s})` : ''}`);
  };

  HS.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  HS.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  HS.lerp = (a, b, t) => a + (b - a) * t;
  HS.dist = (a, b, c, d) => Math.hypot(a - c, b - d);

  HS.reducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  /* ---------- icons ---------- */
  const ICONS = {
    soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5c1.2 1 1.8 2.2 1.8 3.5s-.6 2.5-1.8 3.5M18.6 6c2 1.7 3 3.7 3 6s-1 4.3-3 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };
  HS.icon = (name) => ICONS[name] || '';

  HS.soundButton = function () {
    const b = h('button', { class: 'btn btn-small btn-icon', type: 'button' });
    const paint = () => {
      b.innerHTML = HS.icon(HS.state.sound ? 'soundOn' : 'soundOff');
      b.setAttribute('aria-label', HS.t('ui.sound'));
      b.setAttribute('aria-pressed', HS.state.sound ? 'true' : 'false');
      b.title = HS.t(HS.state.sound ? 'ui.soundOn' : 'ui.soundOff');
    };
    b.addEventListener('click', () => {
      HS.state.sound = !HS.state.sound;
      HS.save();
      Sound.setEnabled(HS.state.sound);
      if (HS.state.sound) Sound.tap();
      paint();
      HS.toast(HS.t(HS.state.sound ? 'ui.soundOn' : 'ui.soundOff'));
    });
    paint();
    return b;
  };

  /* ---------- toast & modal ---------- */
  HS.toast = function (msg) {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const el = h('div', { class: 'toast', role: 'status' }, msg);
    root.appendChild(el);
    setTimeout(() => el.remove(), 2700);
  };

  let modalClose = null;
  HS.modal = function (content, opts = {}) {
    HS.closeModal();
    const root = document.getElementById('modal-root');
    const scrim = h('div', { class: 'scrim', role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.label || '' }, content);
    const onKey = (e) => { if (e.key === 'Escape' && opts.escape !== false) { e.preventDefault(); HS.closeModal(); if (opts.onClose) opts.onClose(); } };
    document.addEventListener('keydown', onKey);
    root.appendChild(scrim);
    const lastFocus = document.activeElement;
    modalClose = () => {
      document.removeEventListener('keydown', onKey);
      scrim.remove();
      modalClose = null;
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    };
    requestAnimationFrame(() => {
      const f = scrim.querySelector('[data-autofocus]') || scrim.querySelector('button, [href], input, textarea');
      if (f) f.focus({ preventScroll: true });
    });
    return HS.closeModal;
  };
  HS.closeModal = () => { if (modalClose) modalClose(); };

  /* Ask before starting over. The question lives in the page, because
   * confirm() dialogs are blocked where the game is embedded. */
  HS.confirmRestart = function () {
    const t = HS.t;
    const box = h('div', { class: 'card', role: 'alertdialog', 'aria-labelledby': 'hs-restart-title', 'aria-describedby': 'hs-restart-text' },
      h('h2', { id: 'hs-restart-title' }, t('restart.title')),
      h('p', { id: 'hs-restart-text' }, t('restart.ask')),
      h('div', { class: 'card-actions' },
        h('button', { class: 'btn', type: 'button', 'data-autofocus': '', onclick: () => HS.closeModal() }, t('restart.no')),
        h('button', { class: 'btn btn-seal', type: 'button', onclick: () => {
          HS.closeModal();
          HS.reset();
          Sound.page();
          HS.go('title');
          HS.toast(t('restart.done'));
        } }, t('restart.yes'))));
    HS.modal(box, { label: t('restart.title') });
  };
  HS.restartButton = () => h('button', { class: 'btn btn-small', type: 'button', onclick: HS.confirmRestart }, HS.t('restart.btn'));

  /* ---------- art helpers ---------- */
  HS.catSVG = (pose) => Art.svg(pose === 'sleep' ? Art.place(Art.cat({ pose: 'sleep' }), { x: 64, y: 90 }) : Art.place(Art.cat(), { x: 60, y: 120, s: 0.98 }), 120, 124);

  HS.sealsRow = function (n, max = 3, text) {
    const row = h('div', { class: 'leaf-seals', 'aria-label': HS.t('ui.sealsN', { n }) });
    for (let i = 0; i < max; i++) {
      if (i < n) row.appendChild(h('span', { html: Art.sealSVG(text || '心', { cls: 'seal-svg' }) }).firstChild);
      else row.appendChild(h('span', { class: 'seal-empty' }));
    }
    return row;
  };

  HS.playerSealText = () => (HS.state.name || '').trim() || '护生';

  /* ---------- screens ---------- */
  HS.screens = {};
  HS.chapters = [];
  let current = null, cleanup = null;
  HS.current = () => current;

  HS.go = function (id, params = {}) {
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    HS.closeModal();
    const scr = HS.screens[id] || HS.screens.title;
    if (!HS.screens[id]) id = 'title';
    current = id;
    const root = document.getElementById('screen');
    root.innerHTML = '';
    document.body.dataset.screen = id;
    document.body.classList.toggle('is-playing', !!scr.fullscreen);
    window.scrollTo(0, 0);
    if (!params.keepHash) {
      try { history.replaceState(null, '', id === 'title' ? location.pathname + location.search : '#' + id); } catch (e) { /* sandboxed */ }
    }
    cleanup = scr.enter(root, params) || null;
    root.focus({ preventScroll: true });
  };

  HS.routeFromHash = function () {
    const id = (location.hash || '').replace(/^#/, '');
    return HS.screens[id] ? id : null;
  };

  /* ---------- saving pictures ---------- */
  let dlPromise = null;
  function downloadsCap() {
    if (!dlPromise) {
      try {
        dlPromise = window.claude && typeof window.claude.use === 'function'
          ? Promise.resolve(window.claude.use('downloads')).catch(() => null)
          : Promise.resolve(null);
      } catch (e) { dlPromise = Promise.resolve(null); }
    }
    return dlPromise;
  }
  HS.warmDownloads = downloadsCap;

  /* Returns 'saved', 'declined' or 'manual' (the viewer saves the image by hand). */
  HS.saveBlob = async function (blob, filename) {
    const dl = await downloadsCap();
    if (dl) {
      try { await dl.save({ filename, data: blob }); return 'saved'; }
      catch (e) { return e && (e.code === 'declined' || e.code === 'rate_limited') ? 'declined' : 'manual'; }
    }
    if (window.claude) return 'manual';
    try {
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: filename });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return 'saved';
    } catch (e) { return 'manual'; }
  };

  /* Show a finished picture (painting or certificate) with a save button. */
  HS.showPicture = function (canvas, filename, opts = {}) {
    const url = canvas.toDataURL('image/png');
    const msg = h('p', { class: 'result-msg', 'aria-live': 'polite' }, HS.t('ui.saveManual'));
    const saveBtn = h('button', { class: 'btn btn-seal', type: 'button', 'data-autofocus': '' }, HS.t('ui.save'));
    saveBtn.addEventListener('click', () => {
      msg.textContent = HS.t('ui.saving');
      canvas.toBlob(async (blob) => {
        if (!blob) { msg.textContent = HS.t('ui.saveManual'); return; }
        const r = await HS.saveBlob(blob, filename);
        msg.textContent = r === 'saved' ? HS.t('ui.saved') : r === 'declined' ? HS.t('ui.saveDeclined') : HS.t('ui.saveManual');
      }, 'image/png');
    });
    const actions = h('div', { class: 'result-actions' }, msg, h('div', { class: 'toolbar' }, opts.extra || null, saveBtn, h('button', { class: 'btn', type: 'button', onclick: () => { HS.closeModal(); if (opts.onClose) opts.onClose(); } }, opts.closeLabel || HS.t('ui.close'))));
    const box = h('div', { class: 'result' }, opts.title ? h('h2', {}, opts.title) : null, h('img', { class: 'result-img', src: url, alt: opts.alt || opts.title || '' }), actions);
    HS.modal(box, { label: opts.title, onClose: opts.onClose });
  };

  /* ---------- the cat guide ---------- */
  function makeGuide() {
    const bubble = h('div', { class: 'bubble', role: 'status', 'aria-live': 'polite' });
    let factIndex = Math.floor(Math.random() * 8);
    const catBtn = h('button', { class: 'guide-cat', type: 'button', 'aria-label': HS.t('ui.catTap'), title: HS.t('ui.catTap'), html: HS.catSVG() });
    const el = h('div', { class: 'guide' }, catBtn, bubble);
    let timer = null;
    function say(text, ms = 3600) {
      bubble.textContent = text;
      bubble.classList.add('is-on');
      clearTimeout(timer);
      if (ms) timer = setTimeout(() => bubble.classList.remove('is-on'), ms);
    }
    catBtn.addEventListener('click', () => {
      const facts = HS.t('cat.facts');
      factIndex = (factIndex + 1) % facts.length;
      Sound.soft();
      say(facts[factIndex], 5200);
    });
    return { el, say, hide() { bubble.classList.remove('is-on'); }, destroy() { clearTimeout(timer); } };
  }
  HS.makeGuide = makeGuide;

  /* ---------- chapters ---------- */
  HS.chapter = function (def) {
    HS.chapters.push(def);
    HS.chapters.sort((a, b) => a.no - b.no);
    HS.screens[def.id] = {
      fullscreen: def.fullscreen !== false,
      enter: (root, params) => (def.enter ? def.enter(root, params) : runChapter(def, root, params)),
    };
  };
  HS.chapterById = (id) => HS.chapters.find((c) => c.id === id);

  function hud(def, extra) {
    const stat = h('p', { class: 'hud-stat', 'aria-live': 'polite' });
    const bar = h('header', { class: 'hud' },
      h('button', { class: 'btn btn-small', type: 'button', onclick: () => { Sound.page(); HS.go('album'); } }, '‹ ' + HS.t('ui.album')),
      h('h1', { class: 'hud-title' }, h('span', { class: 'hud-no' }, HS.pageNo(def.no)), h('span', {}, HS.t(def.key + '.title'))),
      stat,
      extra || HS.soundButton());
    return { bar, stat };
  }
  HS.hud = hud;

  function runChapter(def, root) {
    const t = HS.t;
    const { bar, stat } = hud(def);
    const svg = svgEl('svg', { viewBox: '0 0 1000 625', class: 'stage', role: 'img', 'aria-label': t(def.key + '.title'), preserveAspectRatio: 'xMidYMid meet' });
    const overlay = h('div', { class: 'overlay' });
    const guide = makeGuide();
    const wrap = h('div', { class: 'stage-wrap' }, svg, guide.el, overlay);
    root.appendChild(h('section', { class: 'chapter' }, bar, h('p', { class: 'rotate-hint' }, t('ui.rotate')), wrap));
    const ctx = makeCtx(def, svg, overlay, guide, stat);
    let alive = true;

    (async () => {
      try {
        const preview = ctx.add('preview', `<rect width="1000" height="625" fill="#f4eee1"/>` + def.painting());
        await ctx.card({
          eyebrow: `${HS.pageNo(def.no)} · ${t(def.key + '.season')} · ${t(def.key + '.animal')}`,
          title: t(def.key + '.title'),
          body: [t(def.key + '.intro'), def.skipHowto ? null : h('p', { class: 'muted' }, h('b', {}, t('ch.howto') + '：'), ' ', t(def.key + '.howto'))],
          button: t('ui.start'),
          cat: true,
        });
        if (!alive) return;
        preview.parentNode.remove();
        Sound.unlock();
        const result = await def.play(ctx);
        if (!alive) return;
        await ctx.wait(700);
        if (!alive) return;
        await ctx.card({
          eyebrow: t('ui.pov'),
          title: t(def.key + '.povTitle'),
          art: def.pov ? def.pov() : null,
          body: [t(def.key + '.pov')],
          ask: t(def.askKey || def.key + '.ask'),
          button: t('ui.toPage'),
        });
        if (!alive) return;
        HS.finishPage(def, result && result.seals ? result.seals : 1);
      } catch (e) {
        if (e && e.message !== 'aborted') console.error(e);
      }
    })();

    return () => { alive = false; ctx.destroy(); guide.destroy(); };
  }

  function makeCtx(def, svg, overlay, guide, statEl) {
    const loops = new Set(), timers = new Set(), listeners = [];
    let destroyed = false;
    const layers = {};
    const ctx = {
      svg, overlay, guide, def,
      t: HS.t,
      easy: !!HS.state.easy,
      speed: HS.state.easy ? 0.68 : 1,
      reach: HS.state.easy ? 1.35 : 1,
      get destroyed() { return destroyed; },
      layer(name) {
        if (!layers[name]) { layers[name] = svgEl('g', { class: 'layer-' + name }); svg.appendChild(layers[name]); }
        return layers[name];
      },
      add(layerName, markup, attrs) { return HS.sprite(ctx.layer(layerName), markup, attrs); },
      stat(text) { statEl.textContent = text; },
      say(text, ms) { guide.say(text, ms); },
      loop(fn) {
        let last = performance.now(), raf = 0, on = true;
        const tick = (now) => {
          if (!on || destroyed) return;
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          fn(dt, now / 1000);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        const stop = () => { on = false; cancelAnimationFrame(raf); loops.delete(stop); };
        loops.add(stop);
        return stop;
      },
      after(ms, fn) {
        const id = setTimeout(() => { timers.delete(id); if (!destroyed) fn(); }, ms);
        timers.add(id);
        return id;
      },
      wait(ms) { return new Promise((res, rej) => ctx.after(ms, res)); },
      on(target, type, fn, opts) { target.addEventListener(type, fn, opts); listeners.push([target, type, fn, opts]); },
      point(e) {
        const m = svg.getScreenCTM();
        if (!m) return { x: 0, y: 0 };
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        return { x: p.x, y: p.y };
      },
      float(x, y, text, color, size = 30) {
        const el = svgEl('text', { x: x.toFixed(0), y: y.toFixed(0), 'text-anchor': 'middle', class: 'float-text', 'font-size': size, fill: color || Art.C.seal });
        el.textContent = text;
        ctx.layer('fx').appendChild(el);
        if (el.animate && !HS.reducedMotion()) {
          const a = el.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-46px)', opacity: 0 }], { duration: 1300, easing: 'ease-out' });
          a.onfinish = () => el.remove();
        } else ctx.after(1200, () => el.remove());
      },
      card(o) {
        return new Promise((resolve) => {
          const actions = h('div', { class: 'card-actions' });
          const body = (Array.isArray(o.body) ? o.body : [o.body]).filter(Boolean).map((b) => (typeof b === 'string' ? h('p', {}, b) : b));
          const content = h('div', { style: 'display:grid;gap:.7rem' }, ...body);
          const card = h('div', { class: 'card', role: 'dialog', 'aria-label': o.title || '' },
            o.eyebrow ? h('p', { class: 'eyebrow' }, o.eyebrow) : null,
            o.title ? h('h2', {}, o.title) : null,
            o.art ? h('div', { class: 'pov-art', html: Art.svg(o.art, 1000, 420) }) : null,
            o.cat ? h('div', { class: 'card-row' }, h('div', { class: 'guide-cat', html: HS.catSVG() }), content) : content,
            o.ask ? h('div', { class: 'ask' }, h('b', {}, HS.t('ui.talk')), o.ask) : null,
            actions);
          const done = (v) => { card.remove(); resolve(v); };
          if (o.secondary) actions.appendChild(h('button', { class: 'btn', type: 'button', onclick: () => { Sound.tap(); done('secondary'); } }, o.secondary));
          const primary = h('button', { class: 'btn btn-seal', type: 'button', onclick: () => { Sound.unlock(); Sound.page(); done('primary'); } }, o.button || HS.t('ui.continue'));
          actions.appendChild(primary);
          overlay.appendChild(card);
          guide.hide();
          requestAnimationFrame(() => primary.focus({ preventScroll: true }));
        });
      },
      /* A dialogue with options. `options`: [{label, value, reply, hint, correct}] */
      dialogue(o) {
        return new Promise((resolve) => {
          const list = h('div', { class: 'choice-list' });
          const replyBox = h('div', { 'aria-live': 'polite', style: 'display:grid;gap:.5rem' });
          const card = h('div', { class: 'card' },
            o.eyebrow ? h('p', { class: 'eyebrow' }, o.eyebrow) : null,
            o.speaker ? h('div', { class: 'reply' }, h('span', { class: 'who' }, o.speaker + '：'), o.line) : null,
            o.prompt ? h('h2', {}, o.prompt) : null,
            list, replyBox);
          const tries = [];
          o.options.forEach((opt) => {
            const b = h('button', { class: 'choice', type: 'button' }, opt.label);
            b.addEventListener('click', async () => {
              Sound.tap();
              tries.push(opt.value);
              replyBox.innerHTML = '';
              if (opt.reply) replyBox.appendChild(h('div', { class: 'reply' }, o.replier ? h('span', { class: 'who' }, o.replier + '：') : null, opt.reply));
              if (opt.correct) {
                b.classList.add('is-right');
                list.querySelectorAll('button').forEach((x) => { x.disabled = true; });
                if (o.onRight) o.onRight(opt);
                const next = h('button', { class: 'btn btn-seal', type: 'button', onclick: () => { Sound.page(); card.remove(); resolve({ value: opt.value, tries }); } }, o.nextLabel || HS.t('ui.continue'));
                if (opt.after) replyBox.appendChild(opt.after);
                replyBox.appendChild(h('div', { class: 'card-actions' }, next));
                requestAnimationFrame(() => next.focus({ preventScroll: true }));
              } else {
                b.classList.add('is-wrong');
                b.disabled = true;
                if (opt.hint) replyBox.appendChild(h('p', { class: 'muted' }, opt.hint));
                if (o.onWrong) o.onWrong(opt);
              }
            });
            list.appendChild(b);
          });
          overlay.appendChild(card);
          guide.hide();
        });
      },
      destroy() {
        destroyed = true;
        loops.forEach((s) => s());
        timers.forEach((id) => clearTimeout(id));
        listeners.forEach(([tg, ty, fn, op]) => tg.removeEventListener(ty, fn, op));
      },
    };
    return ctx;
  }
  HS.makeCtx = makeCtx;

  /* ---------- the finished album leaf ---------- */
  HS.finishPage = function (def, seals) {
    seals = HS.clamp(Math.round(seals || 1), 1, 3);
    const prev = HS.state.pages[def.id];
    HS.state.pages[def.id] = { done: true, seals: Math.max(seals, prev && prev.seals ? prev.seals : 0) };
    HS.save();
    showLeaf(def, seals);
  };

  /* Split an inscription into columns at the end of each clause. */
  HS.columns = (text) => {
    const out = [];
    let cur = '';
    for (const ch of Array.from(text || '')) {
      cur += ch;
      if ('；。！？'.indexOf(ch) >= 0) { out.push(cur.trim()); cur = ''; }
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };

  function inscriptionBlock(title, verse, by) {
    return h('div', { class: 'inscription', lang: 'zh-CN' },
      h('div', { class: 'v-title' }, title),
      h('div', { class: 'v-cols' }, HS.columns(verse).map((c) => h('span', { class: 'v-col' }, c))),
      by ? h('div', { class: 'v-by' }, by) : null);
  }
  HS.inscriptionBlock = inscriptionBlock;

  function showLeaf(def, seals) {
    const orig = def.original ? HS.painting(def.original) : null;
    if (!orig) { buildLeaf(def, seals, false); return; }
    let built = false;
    const go = (ok) => { if (!built) { built = true; buildLeaf(def, seals, ok); } };
    HS.hasOriginal(def.original).then(go);
    setTimeout(() => go(false), 1500);
  }

  function buildLeaf(def, seals, showOriginal) {
    const t = HS.t, k = def.key;
    const orig = def.original ? HS.painting(def.original) : null;
    const sealBox = h('div', { class: 'leafpage-seals' });
    let art, inscription, verseLine;
    if (orig && showOriginal) {
      art = h('div', { class: 'leafpage-art is-original' }, HS.original(def.original), sealBox);
      inscription = inscriptionBlock(orig.title, orig.poem, orig.poemBy);
      verseLine = h('div', { class: 'leafpage-orig-note' },
        h('p', { class: 'eyebrow', style: 'color:var(--seal)' }, t('orig.unlocked')));
    } else {
      art = h('div', { class: 'leafpage-art', html: Art.svg(def.painting(), 1000, 625, { label: t(k + '.title') }) }, sealBox);
      inscription = inscriptionBlock(HS.zh(k + '.title'), HS.zh(k + '.verse'), '—— ' + HS.zh(k + '.verseBy'));
      verseLine = h('p', { class: 'muted' }, t(k + '.verseGloss'));
    }
    const top = h('div', { class: 'leafpage-top' }, art, inscription);
    const cards = [];
    if (orig) {
      cards.push(h('div', { class: 'info info-orig' },
        h('h3', {}, `${t('orig.heading')}《${orig.title}》`),
        h('p', { class: 'reveal-sub' }, orig.source),
        showOriginal ? null : h('p', { class: 'poem-zh', lang: 'zh-CN', style: 'font-size:1.15rem' }, orig.poem),
        orig.note ? h('p', {}, orig.note) : null));
    }
    cards.push(h('div', { class: 'info' }, h('h3', {}, t('ui.know')), h('p', {}, t(k + '.know'))));
    cards.push(h('div', { class: 'info' }, h('h3', {}, t(def.bookLabel || 'ui.fromBook')), h('p', {}, t(k + '.book'))));
    if (orig && showOriginal) {
      cards.push(h('div', { class: 'info' }, h('h3', {}, t('leaf.verseCard')),
        h('p', { class: 'poem-zh', lang: 'zh-CN', style: 'font-size:1.15rem' }, HS.zh(k + '.verse')),
        h('p', {}, `${t(k + '.verseGloss')}（${t(k + '.verseBy')}）`)));
    }
    const info = h('div', { class: 'leafpage-info' }, cards);
    const why = t(seals >= 3 ? 'ch.sealWhy3' : seals === 2 ? 'ch.sealWhy2' : 'ch.sealWhy1');
    const foot = h('div', { class: 'leafpage-foot' },
      h('div', { class: 'got' }, HS.sealsRow(seals), h('span', {}, t('ch.sealsGot', { n: seals }) + '。' + why)),
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn', type: 'button', onclick: () => { HS.closeModal(); HS.go(def.id); } }, t('ch.replay')),
        h('button', { class: 'btn btn-seal', type: 'button', 'data-autofocus': '', onclick: () => { HS.closeModal(); Sound.page(); HS.go('album', { highlight: def.id }); } }, t('ui.collect'))));
    const inner = h('div', { class: 'leafpage-inner' }, h('p', { class: 'eyebrow', style: 'color:var(--seal);letter-spacing:.1em;font-size:.9rem' }, `${HS.pageNo(def.no)} · ${t(k + '.title')} · ${t('ch.done')}`), top, verseLine, info, foot);
    HS.modal(h('div', { class: 'leafpage' }, inner), { label: t(k + '.title'), escape: false });
    Sound.win();
    const sealText = HS.playerSealText();
    for (let i = 0; i < seals; i++) {
      setTimeout(() => {
        const s2 = h('span', { class: 'stamp', html: Art.sealSVG(i === 0 ? sealText : '心', { cls: 'seal-svg' }) });
        sealBox.appendChild(s2);
        Sound.stamp();
      }, 700 + i * 380);
    }
  }
  HS.showLeaf = showLeaf;

  /* ---------- Feng Zikai's original paintings ---------- */
  HS.painting = (id) => (window.PAINTINGS || {})[id] || null;
  HS.paintingSrc = (id) => {
    const data = window.PAINTING_DATA && window.PAINTING_DATA[id];
    if (data) return data;
    const p = HS.painting(id);
    return p ? p.file : '';
  };
  const imageState = {};
  /* Resolves true when the scan of a painting can be loaded. */
  HS.hasOriginal = function (id) {
    if (!imageState[id]) {
      imageState[id] = new Promise((resolve) => {
        const src = HS.paintingSrc(id);
        if (!src) return resolve(false);
        const img = new Image();
        img.onload = () => resolve(img.naturalWidth > 0);
        img.onerror = () => resolve(false);
        img.src = src;
      });
    }
    return imageState[id];
  };

  /* A framed original painting with its title, source and inscription.
   * opts.sketch: SVG markup (1000×700) shown when the scan is missing.
   * opts.hideText: show only the picture and caption (used before a riddle is answered). */
  HS.original = function (id, opts = {}) {
    const p = HS.painting(id);
    if (!p) return h('div');
    const frame = h('div', { class: 'original-frame' });
    const badge = h('span', { class: 'original-badge' });
    const caption = h('figcaption', { class: 'original-cap' },
      opts.hideTitle ? null : h('span', { class: 'original-title', lang: 'zh-CN' }, `《${p.title}》`),
      h('span', { class: 'original-src' }, p.source),
      badge);
    const fig = h('figure', { class: 'original' + (opts.compact ? ' is-compact' : '') }, h('div', { class: 'mount' }, frame), caption);
    const showSketch = () => {
      frame.innerHTML = opts.sketch ? Art.svg(opts.sketch, 1000, 700, { label: p.title }) : '';
      frame.classList.add('is-sketch');
      badge.textContent = HS.t('orig.sketch');
      fig.dataset.state = 'sketch';
    };
    const img = h('img', { alt: `${p.title}，${HS.t('orig.by')}`, decoding: 'async' });
    frame.appendChild(img);
    badge.textContent = HS.t('orig.real');
    fig.dataset.state = 'loading';
    img.addEventListener('load', () => { fig.dataset.state = 'real'; });
    img.addEventListener('error', showSketch);
    img.src = HS.paintingSrc(id);
    return fig;
  };

  /* The inscription block for an original painting. */
  HS.originalText = function (id) {
    const p = HS.painting(id);
    if (!p || !p.poem) return null;
    return h('div', { class: 'original-text' },
      h('p', { class: 'poem-zh', lang: 'zh-CN' }, p.poem),
      h('p', { class: 'reveal-sub' }, p.poemBy),
      p.note ? h('p', { class: 'muted', style: 'font-size:.95rem' }, p.note) : null);
  };

  /* ---------- canvas helpers shared by the studio and the certificate ---------- */
  HS.svgToImage = function (svgMarkup) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
    });
  };

  HS.fontsReady = async function (samples) {
    try {
      if (document.fonts && document.fonts.load) {
        await Promise.race([
          Promise.all(samples.map((s) => document.fonts.load(s[0], s[1]))),
          new Promise((r) => setTimeout(r, 2500)),
        ]);
      }
    } catch (e) { /* use fallback fonts */ }
  };

  /* Paint a rice-paper ground onto a canvas. */
  HS.paperFill = function (g, w, h2, base = '#f5efe1') {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h2);
    const rnd = (() => { let a = 1234567; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
    g.save();
    for (let i = 0; i < (w * h2) / 90; i++) {
      g.fillStyle = `rgba(120,100,70,${0.02 + rnd() * 0.05})`;
      g.fillRect(rnd() * w, rnd() * h2, 1 + rnd() * 1.5, 1 + rnd() * 1.5);
    }
    g.strokeStyle = 'rgba(120,100,70,0.07)';
    g.lineWidth = 1;
    for (let i = 0; i < (w * h2) / 9000; i++) {
      const x = rnd() * w, y = rnd() * h2, l = 20 + rnd() * 60, a = rnd() * Math.PI;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 6, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    g.restore();
  };

  /* A red name seal drawn on a canvas. */
  HS.drawSeal = function (o, text, x, y, size) {
    const chars = Art.sealChars(text);
    o.save();
    o.fillStyle = '#b5362c';
    o.beginPath();
    if (o.roundRect) o.roundRect(x, y, size, size, 8); else o.rect(x, y, size, size);
    o.fill();
    o.strokeStyle = 'rgba(248,243,232,.85)'; o.lineWidth = 2.5; o.strokeRect(x + 7, y + 7, size - 14, size - 14);
    o.fillStyle = '#f8f3e8'; o.textAlign = 'center'; o.textBaseline = 'middle';
    const brush = '"Ma Shan Zheng","STKaiti","KaiTi",serif';
    const cell = size / 2;
    const put = (ch, cx, cy, fs) => { o.font = `${fs}px ${brush}`; o.fillText(ch, x + cx, y + cy); };
    if (chars.length === 1) put(chars[0], size / 2, size / 2 + 2, chars[0].length > 1 ? size * 0.42 : size * 0.66);
    else if (chars.length === 2) { put(chars[0], size / 2, cell * 0.58, size * 0.42); put(chars[1], size / 2, cell * 1.45, size * 0.42); }
    else if (chars.length === 3) { put(chars[0], cell * 1.44, size / 2, size * 0.44); put(chars[1], cell * 0.58, cell * 0.58, size * 0.38); put(chars[2], cell * 0.58, cell * 1.45, size * 0.38); }
    else { put(chars[0], cell * 1.44, cell * 0.58, size * 0.38); put(chars[1], cell * 1.44, cell * 1.45, size * 0.38); put(chars[2], cell * 0.58, cell * 0.58, size * 0.38); put(chars[3], cell * 0.58, cell * 1.45, size * 0.38); }
    o.restore();
  };

  /* Write Chinese text in vertical columns, right to left, the way inscriptions are written:
   * punctuation is left out and becomes a short pause. Returns the x of the next free column. */
  HS.verticalText = function (g, lines, xRight, yTop, size, lineGap = 1.35, charGap = 1.12) {
    let x = xRight;
    for (const line of lines) {
      let y = yTop;
      for (const ch of Array.from(line)) {
        if (/[，。、；：！？,.!?;:“”"'‘’（）()《》\s]/.test(ch)) { y += size * 0.35; continue; }
        g.fillText(ch, x, y);
        y += size * charGap;
      }
      x -= size * lineGap;
    }
    return x;
  };
})();
