/* 护生之约 · 末页 · 我的护生画 (My Own Painting)
 * A small ink-brush studio: brush, pale colour washes and stickers drawn in
 * the same style as the game. The finished picture is mounted with a title,
 * a poem and the painter's own red seal, ready to save. */
(function () {
  'use strict';
  const A = Art, C = Art.C;
  const { h } = HS;
  const W = 1200, H = 800;

  const COLORS = [
    { id: 'ink', key: 'studio.ink', color: '#211d1a', alpha: 0.95, wash: false },
    { id: 'light', key: 'studio.lightInk', color: '#3b3632', alpha: 0.4, wash: false },
    { id: 'green', key: 'studio.green', color: '#6f9a55', alpha: 0.32, wash: true },
    { id: 'blue', key: 'studio.blue', color: '#4f7c9e', alpha: 0.3, wash: true },
    { id: 'ochre', key: 'studio.ochre', color: '#c08a45', alpha: 0.32, wash: true },
    { id: 'red', key: 'studio.red', color: '#cf5a4c', alpha: 0.3, wash: true },
  ];
  const SIZES = [{ key: 'studio.thin', w: 4 }, { key: 'studio.mid', w: 9 }, { key: 'studio.thick', w: 18 }];

  const STICKERS = {
    cat: () => A.place(A.cat(), { x: 100, y: 190, s: 1.5 }),
    bird: () => A.place(A.bird({ brow: true }), { x: 100, y: 100, s: 3.2 }),
    swallow: () => A.swallow(100, 100, 4.2, -8),
    fish: () => A.place(A.fish('#d9765a'), { x: 104, y: 100, s: 2.5 }),
    ant: () => A.place(A.ant(true), { x: 92, y: 100, s: 6.5 }),
    butterfly: () => A.place(A.butterfly(C.yellow), { x: 100, y: 96, s: 3.4 }),
    chick: () => A.place(A.littleChick(), { x: 94, y: 110, s: 4.4 }),
    crab: () => A.place(A.crab(), { x: 100, y: 120, s: 2.4 }),
    kid: () => A.kid({ x: 100, y: 190, s: 1.4, hair: 'girl', jacket: C.rouge }),
    moon: () => A.moon(100, 100, 60, { glow: false, sw: 2 }),
    flower: () => A.flower(100, 180, 4.2, C.rouge),
    willow: () => A.willowFringe(60, 140, 0, 4, { count: 3, min: 150, max: 190 }),
  };
  const STICKER_ORDER = ['cat', 'bird', 'swallow', 'fish', 'ant', 'butterfly', 'chick', 'crab', 'kid', 'moon', 'flower', 'willow'];
  const stickerMarkup = (key) => A.svg(STICKERS[key](), 200, 200, { defs: true }).replace('<svg ', '<svg width="200" height="200" ');
  const imgCache = {};
  function stickerImage(key) {
    if (!imgCache[key]) imgCache[key] = HS.svgToImage(stickerMarkup(key)).catch(() => null);
    return imgCache[key];
  }

  function hasCJK(s) { return /[㐀-鿿]/.test(s || ''); }

  HS.screens.studio = {
    enter(root) {
      const t = HS.t;
      const draft = HS.loadDraft() || {};
      const canvas = h('canvas', { width: W, height: H, 'aria-label': t('studio.drawHint'), role: 'img' });
      const live = h('canvas', { width: W, height: H, style: 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none' });
      const g = canvas.getContext('2d');
      const lg = live.getContext('2d');
      const wrap = h('div', { class: 'canvas-wrap mount' }, h('div', { class: 'painting', style: 'position:relative' }, canvas, live));
      let tool = COLORS[0], size = SIZES[1], sticker = null, stickerSize = 1, stickerFlip = false;
      let actions = [], base = null;
      const hint = h('p', { class: 'muted', style: 'font-size:.9rem', 'aria-live': 'polite' }, t('studio.drawHint'));

      function paper(ctx2) {
        ctx2.save();
        ctx2.globalAlpha = 1;
        ctx2.globalCompositeOperation = 'source-over';
        HS.paperFill(ctx2, W, H, '#f7f1e4');
        ctx2.restore();
      }

      function drawStrokeTo(ctx2, st, upto) {
        const pts = st.pts;
        const n = upto == null ? pts.length : upto;
        ctx2.fillStyle = st.color;
        for (let i = 0; i < n; i++) {
          const b = pts[i];
          const a = pts[i - 1] || b;
          const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
          const wa = a[2], wb = b[2];
          if (len > 0.01) {
            const nx = -dy / len, ny = dx / len;
            ctx2.beginPath();
            ctx2.moveTo(a[0] + (nx * wa) / 2, a[1] + (ny * wa) / 2);
            ctx2.lineTo(b[0] + (nx * wb) / 2, b[1] + (ny * wb) / 2);
            ctx2.lineTo(b[0] - (nx * wb) / 2, b[1] - (ny * wb) / 2);
            ctx2.lineTo(a[0] - (nx * wa) / 2, a[1] - (ny * wa) / 2);
            ctx2.closePath();
            ctx2.fill();
          }
          ctx2.beginPath();
          ctx2.arc(b[0], b[1], wb / 2, 0, Math.PI * 2);
          ctx2.fill();
        }
      }

      const scratch = document.createElement('canvas');
      scratch.width = W; scratch.height = H;
      const sg = scratch.getContext('2d');
      function commitStroke(st) {
        sg.clearRect(0, 0, W, H);
        drawStrokeTo(sg, st);
        g.save();
        g.globalAlpha = st.alpha;
        if (st.wash) g.globalCompositeOperation = 'multiply';
        g.drawImage(scratch, 0, 0);
        g.restore();
      }

      async function drawSticker(ctx2, a) {
        const img = await stickerImage(a.key);
        if (!img) return;
        const s = 220 * a.size;
        ctx2.save();
        ctx2.translate(a.x, a.y);
        if (a.flip) ctx2.scale(-1, 1);
        ctx2.drawImage(img, -s / 2, -s / 2, s, s);
        ctx2.restore();
      }

      let redrawing = Promise.resolve();
      function redraw() {
        redrawing = (async () => {
          paper(g);
          if (base) g.drawImage(base, 0, 0, W, H);
          for (const a of actions) {
            if (a.type === 'stroke') commitStroke(a);
            else await drawSticker(g, a);
          }
        })();
        return redrawing;
      }

      let saveTimer = null;
      function saveDraft() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          const d = { title: titleIn.value, poem: poemIn.value, seal: sealIn.value };
          try { d.img = canvas.toDataURL('image/jpeg', 0.85); } catch (e) { /* ignore */ }
          if (!HS.saveDraft(d)) { delete d.img; HS.saveDraft(d); }
        }, 700);
      }

      // drawing
      function toCanvas(e) {
        const r = canvas.getBoundingClientRect();
        return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
      }
      let cur = null, lastT = 0, lastW = 0;
      canvas.addEventListener('pointerdown', async (e) => {
        e.preventDefault();
        Sound.unlock();
        const [x, y] = toCanvas(e);
        if (sticker) {
          const a = { type: 'sticker', key: sticker, x, y, size: stickerSize, flip: stickerFlip };
          actions.push(a);
          await drawSticker(g, a);
          Sound.stamp();
          saveDraft();
          return;
        }
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        lastT = performance.now();
        lastW = size.w * (tool.wash ? 2.6 : 1) * (e.pointerType === 'pen' && e.pressure ? 0.5 + e.pressure : 1);
        cur = { type: 'stroke', color: tool.color, alpha: tool.alpha, wash: tool.wash, pts: [[x, y, lastW * 0.6]] };
        live.style.opacity = String(tool.alpha);
        live.style.mixBlendMode = tool.wash ? 'multiply' : 'normal';
        lg.clearRect(0, 0, W, H);
        drawStrokeTo(lg, cur);
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!cur) return;
        const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        for (const ev of events.length ? events : [e]) {
          const [x, y] = toCanvas(ev);
          const prev = cur.pts[cur.pts.length - 1];
          const d = Math.hypot(x - prev[0], y - prev[1]);
          if (d < 1.5) continue;
          const now = performance.now();
          const speed = d / Math.max(1, now - lastT) * 1000;
          lastT = now;
          const baseW = size.w * (tool.wash ? 2.6 : 1) * (ev.pointerType === 'pen' && ev.pressure ? 0.5 + ev.pressure : 1);
          const target = baseW * HS.clamp(1.35 - speed / 1600, 0.45, 1.35);
          lastW = HS.lerp(lastW, target, 0.35);
          cur.pts.push([x, y, lastW]);
          drawStrokeTo(lg, { color: cur.color, pts: cur.pts.slice(-2) }, 2);
        }
      });
      const end = () => {
        if (!cur) return;
        const st = cur;
        cur = null;
        lg.clearRect(0, 0, W, H);
        if (st.pts.length === 1) st.pts.push([st.pts[0][0] + 0.5, st.pts[0][1] + 0.5, st.pts[0][2]]);
        actions.push(st);
        commitStroke(st);
        saveDraft();
      };
      canvas.addEventListener('pointerup', end);
      canvas.addEventListener('pointercancel', end);

      // tool panels
      const colorChips = COLORS.map((c) => {
        const b = h('button', { class: 'chip', type: 'button', 'aria-pressed': c === tool ? 'true' : 'false' }, h('span', { class: 'sw', style: `background:${c.color};opacity:${c.wash ? 0.6 : c.alpha < 0.6 ? 0.55 : 1}` }), t(c.key));
        b.addEventListener('click', () => { tool = c; sticker = null; paint(); Sound.tap(); });
        return b;
      });
      const sizeChips = SIZES.map((sz) => {
        const b = h('button', { class: 'chip', type: 'button', 'aria-pressed': sz === size ? 'true' : 'false' }, h('span', { style: `display:inline-block;width:${Math.max(6, sz.w)}px;height:${Math.max(6, sz.w)}px;border-radius:50%;background:${C.ink}` }), t(sz.key));
        b.addEventListener('click', () => { size = sz; sticker = null; paint(); Sound.tap(); });
        return b;
      });
      const stickerBtns = STICKER_ORDER.map((key) => {
        const b = h('button', { class: 'sticker', type: 'button', 'aria-pressed': 'false', html: A.svg(STICKERS[key](), 200, 200) });
        b.appendChild(h('span', {}, t('studio.sticker.' + key)));
        b.addEventListener('click', () => { sticker = sticker === key ? null : key; paint(); Sound.tap(); });
        return { key, b };
      });
      const sizeRange = h('input', { type: 'range', id: 'hs-sticker-size', min: '0.4', max: '1.8', step: '0.1', value: '1' });
      sizeRange.addEventListener('input', () => { stickerSize = Number(sizeRange.value); });
      const flipBox = h('input', { type: 'checkbox', id: 'hs-sticker-flip', class: 'switch' });
      flipBox.addEventListener('change', () => { stickerFlip = flipBox.checked; });

      function paint() {
        colorChips.forEach((b, i) => b.setAttribute('aria-pressed', !sticker && COLORS[i] === tool ? 'true' : 'false'));
        sizeChips.forEach((b, i) => b.setAttribute('aria-pressed', SIZES[i] === size ? 'true' : 'false'));
        stickerBtns.forEach(({ key, b }) => b.setAttribute('aria-pressed', key === sticker ? 'true' : 'false'));
        wrap.classList.toggle('is-sticker', !!sticker);
        hint.textContent = sticker ? t('studio.stickerHint') : t('studio.drawHint');
      }

      // words
      const titleIn = h('input', { type: 'text', id: 'hs-studio-title', maxlength: '16', placeholder: t('studio.titlePh'), value: draft.title || '' });
      const poemIn = h('textarea', { id: 'hs-studio-poem', rows: '4', maxlength: '80', placeholder: t('studio.poemPh') });
      poemIn.value = draft.poem || '';
      const sealIn = h('input', { type: 'text', id: 'hs-studio-seal', maxlength: '8', placeholder: t('studio.sealPh'), value: draft.seal || HS.playerSealText() });
      [titleIn, poemIn, sealIn].forEach((el) => el.addEventListener('input', saveDraft));
      let insp = -1;
      const inspire = h('button', { class: 'btn btn-small', type: 'button' }, t('studio.inspire'));
      inspire.addEventListener('click', () => { const list = t('studio.inspirations'); insp = (insp + 1) % list.length; poemIn.value = list[insp]; saveDraft(); Sound.soft(); });

      // undo / clear
      const confirmBox = h('div', { class: 'confirm', hidden: true },
        h('p', {}, t('studio.clearAsk')),
        h('div', { class: 'toolbar' },
          h('button', { class: 'btn btn-small btn-seal', type: 'button', onclick: () => { actions = []; base = null; redraw(); confirmBox.hidden = true; saveDraft(); Sound.page(); } }, t('studio.yes')),
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => { confirmBox.hidden = true; } }, t('studio.no'))));
      const undoBtn = h('button', { class: 'btn btn-small', type: 'button', onclick: () => { if (actions.length) { actions.pop(); redraw(); saveDraft(); Sound.tap(); } } }, t('studio.undo'));
      const clearBtn = h('button', { class: 'btn btn-small', type: 'button', onclick: () => { confirmBox.hidden = false; } }, t('studio.clear'));
      const doneBtn = h('button', { class: 'btn btn-seal', type: 'button' }, t('studio.done'));
      doneBtn.addEventListener('click', async () => { await redrawing; mountAndShow(); });

      const onKey = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !/input|textarea/i.test(e.target.tagName)) { e.preventDefault(); undoBtn.click(); }
      };
      document.addEventListener('keydown', onKey);

      const { bar } = HS.hud({ no: 7, key: 'studio' });
      bar.querySelector('.hud-no').textContent = t('album.studio').split(' · ')[0];
      root.appendChild(h('section', {}, bar, h('div', { class: 'studio' },
        h('div', { class: 'card-row' }, h('div', { class: 'guide-cat', html: HS.catSVG() }), h('p', {}, t('studio.intro'))),
        h('div', { class: 'studio-main' },
          h('div', { style: 'display:grid;gap:.6rem' }, wrap, h('div', { class: 'studio-actions' }, undoBtn, clearBtn, hint), confirmBox),
          h('div', { style: 'display:grid;gap:.8rem' },
            h('div', { class: 'panel' }, h('h3', {}, t('studio.brush')), h('div', { class: 'seg', role: 'group', 'aria-label': t('studio.brush') }, sizeChips), h('div', { class: 'seg', role: 'group', 'aria-label': t('studio.colors') }, colorChips)),
            h('div', { class: 'panel' }, h('h3', {}, t('studio.stickers')), h('div', { class: 'stickers' }, stickerBtns.map((s) => s.b)),
              h('div', { class: 'field' }, h('label', { for: 'hs-sticker-size' }, t('studio.size')), sizeRange),
              h('label', { class: 'setting', for: 'hs-sticker-flip' }, flipBox, h('span', {}, t('studio.flip')))),
            h('div', { class: 'panel' }, h('h3', {}, t('studio.words')),
              h('div', { class: 'field' }, h('label', { for: 'hs-studio-title' }, t('studio.titleLabel')), titleIn),
              h('div', { class: 'field' }, h('label', { for: 'hs-studio-poem' }, t('studio.poemLabel')), poemIn, h('div', {}, inspire)),
              h('div', { class: 'field' }, h('label', { for: 'hs-studio-seal' }, t('studio.sealLabel')), sealIn)),
            doneBtn)))));

      // restore the draft, if any
      if (draft.img) {
        const img = new Image();
        img.onload = () => { base = img; redraw(); };
        img.src = draft.img;
      }
      redraw();
      STICKER_ORDER.forEach(stickerImage);

      async function mountAndShow() {
        Sound.page();
        await HS.fontsReady([['64px "Ma Shan Zheng"', '护生画题诗'], ['24px "Noto Serif SC"', '画']]);
        const out = document.createElement('canvas');
        out.width = 1600; out.height = 1000;
        const o = out.getContext('2d');
        o.fillStyle = '#cad4ce';
        o.fillRect(0, 0, 1600, 1000);
        o.strokeStyle = '#a6b6ae'; o.lineWidth = 2; o.strokeRect(1, 1, 1598, 998);
        o.save(); o.translate(40, 40); HS.paperFill(o, 1520, 920, '#f7f1e4'); o.restore();
        o.strokeStyle = 'rgba(38,34,30,.3)'; o.lineWidth = 1.5; o.strokeRect(40, 40, 1520, 920);
        // the painting
        o.drawImage(canvas, 80, 90, 1080, 720);
        o.strokeStyle = 'rgba(38,34,30,.18)'; o.strokeRect(80, 90, 1080, 720);
        const title = (titleIn.value || '').trim() || t('studio.untitled');
        const poemLines = (poemIn.value || '').split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(0, 4);
        const name = (HS.state.name || '').trim();
        const sealText = (sealIn.value || '').trim() || HS.playerSealText();
        o.fillStyle = '#26221e';
        const brush = '"Ma Shan Zheng","STKaiti","KaiTi",serif';
        let sealX = 1430, sealY = 830;
        const d = new Date();
        const dateText = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
        if (hasCJK(title + poemLines.join(''))) {
          o.textAlign = 'center'; o.textBaseline = 'top';
          o.font = `76px ${brush}`;
          HS.verticalText(o, [Array.from(title).slice(0, 8).join('')], 1490, 96, 76, 1.2, 1.06);
          o.font = `44px ${brush}`;
          const cols = [];
          poemLines.forEach((l) => { const ch = Array.from(l); for (let i = 0; i < ch.length; i += 13) cols.push(ch.slice(i, i + 13).join('')); });
          HS.verticalText(o, cols.slice(0, 4), 1396, 120, 44, 1.32, 1.1);
        } else {
          o.textAlign = 'left'; o.textBaseline = 'alphabetic';
          o.font = `58px ${brush}`;
          let y = wrapText(o, title, 1200, 170, 330, 62);
          o.font = `30px "Noto Serif SC", "Songti SC", serif`;
          o.fillStyle = '#3b3632';
          y += 30;
          for (const l of poemLines) y = wrapText(o, l, 1200, y, 330, 40) + 10;
          sealX = 1200; sealY = HS.clamp(y + 20, 620, 830);
        }
        o.textAlign = 'left'; o.textBaseline = 'alphabetic';
        o.font = `24px "Noto Serif SC", "Songti SC", serif`; o.fillStyle = '#5a524a';
        o.fillText([name ? `${name} 画` : '', dateText, '护生之约'].filter(Boolean).join(' · '), 80, 880);
        HS.drawSeal(o, sealText, sealX, sealY, 100);
        HS.showPicture(out, `${title}.png`, { title: t('studio.preview'), alt: title, closeLabel: t('studio.edit') });
      }

      function wrapText(o, text, x, y, maxW, lh) {
        const words = text.split(/\s+/);
        let line = '';
        for (const w of words) {
          const test = line ? line + ' ' + w : w;
          if (o.measureText(test).width > maxW && line) { o.fillText(line, x, y); y += lh; line = w; } else line = test;
        }
        if (line) { o.fillText(line, x, y); y += lh; }
        return y;
      }


      return () => { document.removeEventListener('keydown', onKey); clearTimeout(saveTimer); };
    },
  };
})();
