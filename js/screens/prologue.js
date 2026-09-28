/* 护生之约 · prologue: the story of a promise, as a picture book */
(function () {
  'use strict';
  const { h } = HS;
  const A = Art, C = Art.C;

  const floor = (y = 600) => A.blob(500, y + 40, 520, 60, C.ochre, 0.16) + A.line([[40, y], [960, y + 4]], 1.3, { op: 0.45 });

  function artStudent() {
    let s = floor();
    // a window with willow twigs outside
    s += `<rect x="110" y="110" width="230" height="210" fill="#e5ece6" fill-opacity=".7" stroke="${C.brown}" stroke-width="6" stroke-opacity=".75"/>`;
    s += A.line([[225, 110], [225, 320]], 2.4, { color: C.brown, op: 0.8 }) + A.line([[110, 215], [340, 215]], 2.4, { color: C.brown, op: 0.8 });
    A.seed(4);
    for (let i = 0; i < 6; i++) {
      const x = 130 + i * 36;
      s += A.line([[x, 112], [x + 6, 170], [x + 2, 230 + A.rnd(0, 60)]], 1.1, { op: 0.7 });
      for (let k = 0; k < 4; k++) s += A.stroke([[x + 4, 135 + k * 30], [x + 9, 141 + k * 30], [x + 10, 148 + k * 30]], 2.4, { color: C.leaf, op: 0.8, head: 0.7 });
    }
    // an organ: the teacher taught music too
    s += `<rect x="800" y="470" width="120" height="100" fill="#8d6b46" fill-opacity=".7" stroke="${C.ink}" stroke-width="1.6"/><rect x="806" y="500" width="108" height="12" fill="${C.white}" stroke="${C.ink}" stroke-width="1"/>`;
    for (let i = 0; i < 9; i++) s += `<rect x="${812 + i * 11}" y="500" width="5" height="7" fill="${C.ink}"/>`;
    s += A.stroke([[808, 570], [806, 600]], 5) + A.stroke([[912, 570], [914, 600]], 5);
    // easel with a still-life on it
    s += A.place(A.easel() + A.line([[-12, -64], [-14, -92], [0, -110], [14, -92], [12, -64]], 1.6) + A.line([[-12, -64], [12, -64]], 1.4), { x: 420, y: 600, s: 1.35 });
    s += A.adult({ x: 545, y: 600, flip: true, robe: '#7f97aa', arms: { l: [[-20, -112], [-16, -86]], r: [[34, -128], [62, -150]] } });
    s += A.adult({ x: 700, y: 602, flip: true, s: 1.04, robe: '#5b6570', arms: { l: [[-16, -110], [-4, -92]], r: [[16, -110], [4, -92]] } });
    return s;
  }

  function pine(x, y, s = 1) {
    let p = A.stroke([[0, 0], [4, -60], [-2, -130]], 7, { head: 0.9, tail: 0.3 });
    [[-100, 60], [-80, 70], [-58, 54], [-36, 40]].forEach(([yy, w], i) => {
      p += A.blob(i % 2 ? 10 : -8, yy, w, 12, C.leaf, 0.45);
      p += A.stroke([[-w * 0.8 + (i % 2 ? 14 : -10), yy + 4], [w * 0.8 + (i % 2 ? 14 : -10), yy]], 2.4, { color: C.ink, op: 0.8 });
    });
    return A.place(p, { x, y, s });
  }

  function artMonk() {
    let s = A.hills(430, 12, { color: C.indigo, op: 0.2, h: 170 }) + A.hills(470, 40, { color: C.green, op: 0.16, h: 90 });
    // temple roof on the hill
    s += A.place(`<path d="M-90 0C-60 -6-30-26 0-30 30-26 60-6 90 0L70 4-70 4Z" fill="#4b4d52" fill-opacity=".8"/>` + A.stroke([[-94, 2], [-40, -14], [0, -30], [40, -14], [94, 2]], 3) +
      `<rect x="-60" y="4" width="120" height="44" fill="#d9cfbd" stroke="${C.ink}" stroke-width="1.4"/><rect x="-14" y="16" width="28" height="32" fill="#8d6b46" fill-opacity=".7" stroke="${C.ink}" stroke-width="1.2"/>`, { x: 760, y: 250 });
    s += pine(640, 330, 0.9) + pine(900, 320, 0.8);
    // mountain path
    s += A.shape('M120 690C260 620 330 560 520 520 620 500 700 470 760 400L790 405C740 480 660 520 560 546 380 590 300 640 230 690Z', '#d8c8a6', 0.6, { filter: 'hs-wash' });
    s += A.adult({ x: 480, y: 552, s: 0.92, robe: '#8e8b82', hair: 'bald', arms: { l: [[-18, -112], [-10, -92]], r: [[18, -112], [10, -90]] } });
    A.seed(8);
    for (let i = 0; i < 5; i++) s += A.place(A.leafShape(i % 2 ? C.ochre : '#b8b35a'), { x: A.rnd(200, 900), y: A.rnd(120, 420), r: A.rnd(0, 180), s: 0.8 });
    s += A.grass(300, 650, 1.2, 5) + A.grass(620, 540, 1, 6);
    return s;
  }

  function artFifty() {
    let s = floor(612);
    s += A.line([[70, 110], [500, 138], [930, 112]], 1.6, { op: 0.8 });
    const hang = [
      [150, 116, -4, A.place(A.bird({ brow: false, color: C.ochre }), { x: 0, y: 70, s: 0.9 })],
      [320, 128, 2, A.place(A.fish('#d9765a'), { x: 0, y: 72, s: 0.9 })],
      [500, 136, -2, A.place(A.ant(true), { x: 0, y: 72, s: 2.2 })],
      [680, 128, 3, A.flower(0, 104, 1.6)],
      [850, 116, -3, A.place(A.butterfly(), { x: 0, y: 66, s: 1.3 })],
    ];
    hang.forEach(([x, y, r, inner]) => {
      s += A.place(`<rect x="-55" y="0" width="110" height="140" fill="${C.white}" stroke="${C.ink}" stroke-width="1.3"/>` + inner + `<rect x="-6" y="-8" width="12" height="16" fill="${C.bamboo}" stroke="${C.ink}" stroke-width="1"/>`, { x, y, r });
    });
    s += A.desk(420, 860, 470, 140);
    s += A.paperStack(560, 470, 8) + A.brushPot(800, 470);
    s += `<ellipse cx="690" cy="462" rx="30" ry="8" fill="${C.ink2}" stroke="${C.ink}" stroke-width="1.2"/>`;
    s += A.adult({ x: 330, y: 612, robe: '#7f97aa', arms: { l: [[-20, -112], [-14, -86]], r: [[40, -124], [100, -150]] } });
    s += A.line([[430, -0 + 462], [462, 440]], 2.2);
    return s;
  }

  function artLetter() {
    let s = A.blob(500, 380, 470, 250, C.ochre, 0.12);
    // letter paper with red columns
    s += A.place(
      `<rect x="0" y="0" width="330" height="420" fill="${C.white}" stroke="${C.ink}" stroke-width="1.4"/>` +
      Array.from({ length: 9 }, (_, i) => `<line x1="${30 + i * 34}" y1="24" x2="${30 + i * 34}" y2="396" stroke="${C.seal}" stroke-opacity=".45" stroke-width="1.2"/>`).join('') +
      Array.from({ length: 7 }, (_, i) => {
        A.seed(20 + i);
        let col = '';
        let y = 44;
        const x = 280 - i * 34 - 17;
        while (y < 340 - (i === 6 ? 150 : 0)) {
          const len = A.rnd(10, 22);
          col += A.stroke([[x - 5, y], [x + 4, y + len * 0.5], [x - 2, y + len]], 3.2, { head: 0.9, tail: 0.2 });
          y += len + A.rnd(8, 14);
        }
        return col;
      }).join(''),
      { x: 190, y: 120, r: -4 });
    // envelope
    s += A.place(`<rect x="0" y="0" width="180" height="300" fill="#efe3c6" stroke="${C.ink}" stroke-width="1.4"/><rect x="54" y="40" width="72" height="210" fill="none" stroke="${C.seal}" stroke-width="3" stroke-opacity=".75"/><rect x="128" y="12" width="40" height="46" fill="${C.indigo}" fill-opacity=".45" stroke="${C.ink}" stroke-width="1"/>` +
      A.stroke([[90, 70], [92, 110]], 5) + A.stroke([[88, 130], [92, 170]], 5) + A.stroke([[90, 190], [90, 222]], 5), { x: 620, y: 200, r: 6 });
    s += A.stroke([[260, 590], [520, 560]], 6, { color: C.brown, head: 1, tail: 0.8 }) + `<path d="M520 560L560 552 522 570Z" fill="${C.ink}"/>`;
    return s;
  }

  function artNight() {
    let s = `<rect x="0" y="0" width="1000" height="690" fill="${C.night}" fill-opacity=".16"/>`;
    s += `<rect x="90" y="90" width="260" height="230" fill="${C.night}" fill-opacity=".75" stroke="${C.brown}" stroke-width="7"/>`;
    s += A.moon(250, 170, 26, { glow: false, fill: '#f6ebbd' });
    s += A.line([[220, 90], [220, 320]], 2.4, { color: C.brown }) + A.line([[90, 205], [350, 205]], 2.4, { color: C.brown });
    s += floor(612);
    s += `<circle cx="640" cy="370" r="200" fill="url(#hs-glow)"/>`;
    s += A.desk(440, 900, 470, 140);
    s += A.place(A.lamp(), { x: 640, y: 470, s: 0.95 });
    s += A.paperStack(780, 470, 14) + A.paperStack(520, 470, 5);
    s += A.adult({ x: 360, y: 612, robe: '#6f8193', arms: { l: [[-18, -112], [-12, -86]], r: [[40, -120], [104, -146]] } });
    s += A.place(A.cat({ pose: 'sleep' }), { x: 700, y: 606, s: 0.8 });
    return s;
  }

  function artStacks() {
    let s = floor(600);
    const counts = [50, 60, 70, 80, 90, 100];
    const years = ['1929', '1940', '1949', '1960', '1965', '1973'];
    const cols = ['#6d8ea8', '#b58a52', '#7c9a68', '#6f6a8f', '#a45a4f', '#57606b'];
    counts.forEach((n, i) => {
      const x = 170 + i * 132, hgt = n * 3.4, top = 600 - hgt;
      let st = `<rect x="${x - 44}" y="${top}" width="88" height="${hgt}" fill="${C.white}" stroke="${C.ink}" stroke-width="1.4"/>`;
      for (let yy = top + 8; yy < 600; yy += 8) st += `<line x1="${x - 44}" y1="${yy}" x2="${x + 44}" y2="${yy}" stroke="${C.ink}" stroke-opacity=".18" stroke-width="1"/>`;
      st += `<rect x="${x - 44}" y="${top}" width="88" height="10" fill="${cols[i]}" fill-opacity=".85"/>`;
      st += `<text x="${x}" y="${top - 16}" text-anchor="middle" font-size="30" font-family="'Ma Shan Zheng','KaiTi',serif" fill="${C.ink}">${n}</text>`;
      st += `<text x="${x}" y="636" text-anchor="middle" font-size="22" fill="${C.ink2}" font-family="serif">${years[i]}</text>`;
      s += st;
    });
    s += A.place(A.cat(), { x: 930, y: 604, s: 0.55 });
    return s;
  }

  function artYourTurn() {
    let s = A.willowFringe(40, 960, 0, 9, { count: 10, min: 60, max: 170 });
    s += A.blob(500, 560, 480, 80, C.ochre, 0.16);
    s += A.desk(170, 830, 470, 150);
    // the blank album, open
    s += `<path d="M260 468L300 330 500 350 500 470Z" fill="${C.white}" stroke="${C.ink}" stroke-width="1.5"/><path d="M740 468L700 330 500 350 500 470Z" fill="${C.white}" stroke="${C.ink}" stroke-width="1.5"/>`;
    s += `<path d="M260 468L500 470 740 468" fill="none" stroke="${C.mount || '#a6b6ae'}" stroke-width="6"/>`;
    s += A.line([[500, 350], [500, 470]], 1.2, { op: 0.6 });
    s += A.line([[320, 380], [470, 392]], 1, { op: 0.2 }) + A.line([[312, 410], [468, 420]], 1, { op: 0.2 });
    s += A.stroke([[560, 458], [690, 430]], 5, { color: C.brown, head: 1, tail: 0.8 }) + `<path d="M690 430L716 424 692 438Z" fill="${C.ink}"/>`;
    s += A.place(A.cat(), { x: 880, y: 618, s: 0.9 });
    s += A.place(A.seal('护生'), { x: 640, y: 380, s: 0.45 });
    return s;
  }

  const PANELS = [
    { key: 'p1', art: artStudent },
    { key: 'p2', art: artMonk },
    { key: 'p3', art: artFifty },
    { key: 'p4', art: artLetter },
    { key: 'p5', art: artNight },
    { key: 'p6', art: artStacks },
    { key: 'p7', art: artYourTurn },
  ];
  const VOL_COLORS = ['#6d8ea8', '#b58a52', '#7c9a68', '#6f6a8f', '#a45a4f', '#57606b'];

  HS.prologueThumb = () => `<g transform="scale(1 ${625 / 690})">${artLetter()}</g>`;

  function shelf() {
    const vols = HS.t('pro.vol');
    const info = h('div', { class: 'vol-info', 'aria-live': 'polite' }, HS.t('pro.shelfHint'));
    const row = h('div', { class: 'shelf', role: 'group', 'aria-label': HS.t('pro.p6.t') });
    vols.forEach((v, i) => {
      const b = h('button', { class: 'vol', type: 'button', 'aria-pressed': 'false', style: `--i:${i};--c:${VOL_COLORS[i]}` }, HS.en() ? v.year : v.n);
      b.addEventListener('click', () => {
        row.querySelectorAll('.vol').forEach((x) => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        Sound.pluck ? null : null;
        Sound.soft();
        info.innerHTML = '';
        info.append(h('b', {}, `${v.n} · ${v.year}`), ' ', h('span', {}, `${v.count} · ${v.by}`), v.note ? h('div', { class: 'muted' }, v.note) : null);
      });
      row.appendChild(b);
    });
    return h('div', { style: 'display:grid;gap:.6rem' }, row, info);
  }

  HS.screens.prologue = {
    enter(root) {
      const t = HS.t;
      let i = 0;
      const pageBox = h('div');
      const dots = h('div', { class: 'dots', 'aria-hidden': 'true' }, PANELS.map(() => h('span')));
      const prev = h('button', { class: 'btn', type: 'button' }, '‹ ' + t('ui.prev'));
      const next = h('button', { class: 'btn btn-seal', type: 'button' }, t('ui.next') + ' ›');
      const status = h('span', { class: 'sr-only', 'aria-live': 'polite' });

      function finish() {
        HS.state.prologue = true;
        HS.save();
        Sound.page();
        HS.go('album');
      }

      function render() {
        const p = PANELS[i];
        const text = h('div', { class: 'book-text' },
          h('p', { class: 'eyebrow', style: 'color:var(--seal);letter-spacing:.1em;font-size:.9rem' }, `${t('album.prologue')} · ${i + 1} / ${PANELS.length}`),
          h('h2', {}, t(`pro.${p.key}.t`)),
          h('p', {}, t(`pro.${p.key}`)));
        if (p.key === 'p4') {
          text.append(h('p', { class: 'big-quote', lang: 'zh-CN' }, HS.zh('pro.p4.quote')), h('p', { class: 'muted' }, t('pro.p4.gloss')));
        }
        if (p.key === 'p6') text.append(shelf());
        if (p.key === 'p7') {
          text.append(h('p', { class: 'big-quote', lang: 'zh-CN', style: 'font-size:clamp(1.6rem,3.6vw,2.3rem)' }, '护生者，护心也。'));
          text.append(h('div', { class: 'card-row' }, h('div', { class: 'guide-cat', html: HS.catSVG() }), h('p', { class: 'reply' }, h('span', { class: 'who' }, t('ui.catName') + (HS.en() ? ':' : '：')), t('pro.p7.cat'))));
        }
        pageBox.innerHTML = '';
        pageBox.appendChild(h('div', { class: 'book-page' },
          h('div', { class: 'mount' }, h('div', { class: 'painting', html: A.svg(p.art(), 1000, 690, { label: t(`pro.${p.key}.t`) }) })),
          text));
        [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
        prev.disabled = i === 0;
        next.textContent = i === PANELS.length - 1 ? t('pro.open') : t('ui.next') + ' ›';
        status.textContent = `${i + 1} / ${PANELS.length}`;
        if (p.key === 'p4') Sound.promise();
      }

      prev.addEventListener('click', () => { if (i > 0) { i--; Sound.page(); render(); } });
      next.addEventListener('click', () => {
        if (i < PANELS.length - 1) { i++; Sound.page(); render(); window.scrollTo({ top: 0 }); } else finish();
      });
      const onKey = (e) => {
        if (e.target && /input|textarea/i.test(e.target.tagName)) return;
        if (e.key === 'ArrowRight') next.click();
        if (e.key === 'ArrowLeft') prev.click();
      };
      document.addEventListener('keydown', onKey);

      root.appendChild(h('section', { class: 'book' },
        h('div', { class: 'book-head' },
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => HS.go(HS.state.prologue ? 'album' : 'title') }, '‹ ' + (HS.state.prologue ? t('ui.album') : t('ui.cover'))),
          h('h1', { style: 'font-size:clamp(1.6rem,3vw,2.1rem)' }, t('album.prologue')),
          h('button', { class: 'btn btn-small', type: 'button', onclick: finish }, t('ch.skipIntro'))),
        pageBox,
        h('div', { class: 'book-nav' }, prev, dots, next, status)));
      render();
      return () => document.removeEventListener('keydown', onKey);
    },
  };
})();
