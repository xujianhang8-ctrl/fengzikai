/* 护生之约 · 第六页 · 读画 (Reading Paintings)
 * Three picture riddles built on Feng Zikai's own paintings.
 * When a scan of the original is in images/paintings/, it is shown;
 * otherwise a redrawn sketch that follows the original's composition. */
(function () {
  'use strict';
  const A = Art, C = Art.C;
  const { h } = HS;

  const floor = (y) => A.blob(500, y + 50, 520, 70, C.ochre, 0.18) + A.line([[60, y], [940, y + 3]], 1.3, { op: 0.45 });

  function sketchAbao() {
    let s = floor(560);
    s += A.place(A.stool(), { x: 600, y: 560, s: 2.4 });
    // the stool wears shoes on its feet
    [[504, 556], [696, 556], [548, 548]].forEach(([x, y], i) => { s += A.place(A.shoe(i === 2 ? C.indigo : C.rouge), { x, y, s: 1.5 }); });
    s += A.kid({ x: 330, y: 560, s: 1.7, legs: 'crouch', hair: 'girl', jacket: '#d98c7e', arms: { l: [[14, -58], [40, -40]], r: [[24, -62], [58, -46]] } });
    s += A.place(A.shoe(C.indigo), { x: 422, y: 488, s: 1.3, r: -20 });
    return s;
  }

  function sketchFeathers() {
    let s = floor(540);
    s += A.place(A.featherDuster(), { x: 520, y: 470, s: 2.2, r: -6 });
    [[330, 500, false], [420, 560, false], [700, 540, true], [640, 590, true]].forEach(([x, y, flip]) => { s += A.place(A.littleChick(), { x, y, s: 2.3, flip }); });
    return s;
  }

  function sketchCrabs() {
    let s = A.blob(500, 600, 560, 110, '#d8c8a6', 0.45);
    s += `<path d="M760 560C760 430 830 360 930 350L1000 350 1000 600Z" fill="#8f877a" fill-opacity=".45" stroke="${C.ink}" stroke-width="2"/><path d="M800 560C810 480 860 440 920 440L920 560Z" fill="#3a3530" fill-opacity=".75"/>`;
    s += A.place(A.crab(), { x: 400, y: 470, s: 2.6, r: -6 });
    s += A.place(A.crab(), { x: 560, y: 430, s: 2.5, r: 14 });
    s += A.place(A.crab(), { x: 590, y: 540, s: 2.6, r: -10 });
    A.seed(2);
    for (let i = 0; i < 18; i++) s += `<circle cx="${A.rnd(80, 900).toFixed(0)}" cy="${A.rnd(560, 660).toFixed(0)}" r="${A.rnd(1.5, 3.5).toFixed(1)}" fill="${C.ink}" fill-opacity=".25"/>`;
    return s;
  }

  const RIDDLES = [
    { id: 'abao', key: 'read.r1', sketch: sketchAbao },
    { id: 'muzhiyu', key: 'read.r2', sketch: sketchFeathers },
    { id: 'fuchi', key: 'read.r3', sketch: sketchCrabs },
  ];

  function painting() {
    let s = `<rect width="1000" height="625" fill="#f3ede1"/>`;
    s += A.blob(500, 580, 520, 60, C.ochre, 0.18);
    const frames = [[190, sketchAbao], [500, sketchFeathers], [810, sketchCrabs]];
    frames.forEach(([x, fn], i) => {
      s += A.line([[x, 40], [x, 90]], 1.4, { op: 0.6 });
      s += `<g transform="translate(${x - 125} 90)"><rect width="250" height="200" fill="#cad4ce" stroke="#a6b6ae"/><rect x="10" y="10" width="230" height="180" fill="#f7f2e7" stroke="${C.ink}" stroke-opacity=".3"/><g transform="translate(10 10) scale(.23 .257)">${fn()}</g></g>`;
      s += `<rect x="${x - 125}" y="${i === 1 ? 300 : 298}" width="250" height="12" fill="#8d6b46" fill-opacity=".7"/>`;
    });
    s += A.place(A.cat(), { x: 500, y: 560, s: 1.05 });
    return s;
  }

  function tipArt(i) {
    if (i === 0) return A.svg(A.swallow(80, 40, 1.6, -10) + A.swallow(150, 62, 1.1, 6) + A.line([[10, 80], [230, 84]], 1.4, { op: 0.6 }), 240, 100);
    if (i === 1) return A.svg(A.kid({ x: 120, y: 98, s: 0.72, jacket: C.rouge, hair: 'girl' }), 240, 100);
    return A.svg(`<rect x="30" y="10" width="150" height="84" fill="#f7f2e7" stroke="${C.ink}" stroke-opacity=".4"/>` + A.place(A.cat(), { x: 90, y: 88, s: 0.52 }) + [0, 1, 2, 3, 4].map((k) => A.stroke([[160, 20 + k * 13], [161, 28 + k * 13]], 3)).join('') + `<rect x="150" y="80" width="10" height="10" fill="${C.seal}"/>`, 240, 100);
  }

  const def = {
    id: 'reading', key: 'read', no: 6, fullscreen: false,
    painting,
    enter(root) {
      const t = HS.t;
      const { bar, stat } = HS.hud(def);
      const main = h('div', { class: 'reading' });
      root.appendChild(h('section', {}, bar, main));
      let firstTry = 0;

      function intro() {
        main.innerHTML = '';
        main.append(
          h('div', { class: 'card-row' }, h('div', { class: 'guide-cat', html: HS.catSVG() }), h('p', { style: 'font-size:1.1rem' }, t('read.intro'))),
          h('h2', { style: 'font-size:1.6rem' }, t('read.tipsTitle')),
          h('div', { class: 'tips' }, [0, 1, 2].map((i) => h('div', { class: 'tip' }, h('div', { class: 'tip-art', html: tipArt(i) }), h('b', {}, t(`read.tip${i + 1}t`)), h('p', { class: 'muted', style: 'font-size:.98rem' }, t(`read.tip${i + 1}`))))),
          h('p', { class: 'note' }, t('read.note')),
          h('div', { class: 'card-actions', style: 'justify-content:flex-start' }, h('button', { class: 'btn btn-seal', type: 'button', onclick: () => { Sound.unlock(); Sound.page(); riddle(0); } }, t('read.begin'))));
        stat.textContent = '';
      }

      function riddle(i) {
        const r = RIDDLES[i];
        const p = HS.painting(r.id);
        stat.textContent = t('read.stat', { a: i + 1, b: RIDDLES.length });
        main.innerHTML = '';
        window.scrollTo({ top: 0 });
        const answers = t(r.key + '.a');
        const correct = answers[0];
        const list = h('div', { class: 'choice-list' });
        const reveal = h('div', { 'aria-live': 'polite' });
        let tries = 0, solved = false;
        HS.shuffle(answers).forEach((label) => {
          const b = h('button', { class: 'choice', type: 'button' }, label);
          b.addEventListener('click', () => {
            if (solved) return;
            tries++;
            if (label === correct) {
              solved = true;
              if (tries === 1) firstTry++;
              b.classList.add('is-right');
              list.querySelectorAll('button').forEach((x) => { x.disabled = true; });
              Sound.good();
              showReveal();
            } else {
              b.classList.add('is-wrong');
              b.disabled = true;
              Sound.oops();
              reveal.innerHTML = '';
              reveal.appendChild(h('p', { class: 'muted' }, t('read.wrong')));
            }
          });
          list.appendChild(b);
        });
        function showReveal() {
          reveal.innerHTML = '';
          const block = h('div', { class: 'reveal-block' },
            h('p', { class: 'eyebrow', style: 'color:var(--ok)' }, t('read.right')),
            h('p', { class: 'reveal-title', lang: 'zh-CN' }, `《${p.title}》`),
            h('p', { class: 'reveal-sub' }, p.source),
            h('p', {}, t(r.key + '.text')),
            p.poem ? HS.originalText(r.id) : null,
            r.id === 'abao' ? h('p', { class: 'quote' }, `“${t('read.r1.quote')}” ——${t('read.r1.quoteBy')}`) : null,
            h('div', { class: 'card-actions', style: 'justify-content:flex-start' },
              h('button', { class: 'btn btn-seal', type: 'button', onclick: () => { Sound.page(); if (i + 1 < RIDDLES.length) riddle(i + 1); else finish(); } }, i + 1 < RIDDLES.length ? t('read.nextPic') + ' ›' : t('ui.continue'))));
          reveal.appendChild(block);
          const btn = block.querySelector('.btn-seal');
          if (btn) btn.focus({ preventScroll: true });
        }
        main.appendChild(h('div', { class: 'riddle' },
          HS.original(r.id, { sketch: r.sketch(), hideTitle: true }),
          h('div', { class: 'riddle-side' },
            h('p', { class: 'eyebrow', style: 'color:var(--seal);letter-spacing:.1em;font-size:.9rem' }, `${t('read.look')} · ${i + 1} / ${RIDDLES.length}`),
            h('h2', {}, t(r.key + '.q')),
            list, reveal)));
      }

      function finish() {
        main.innerHTML = '';
        stat.textContent = '';
        const ctxLike = h('div', { class: 'card', style: 'margin:0 auto' },
          h('p', { class: 'eyebrow' }, t('ui.pov')),
          h('h2', {}, t('read.povTitle')),
          h('p', {}, t('read.pov')),
          h('p', {}, t('read.win')),
          h('div', { class: 'ask' }, h('b', {}, t('ui.talk')), t('read.ask')),
          h('div', { class: 'card-actions' }, h('button', { class: 'btn btn-seal', type: 'button', onclick: () => { Sound.page(); HS.finishPage(def, Math.max(1, firstTry)); } }, t('ui.toPage'))));
        main.appendChild(ctxLike);
      }

      intro();
    },
  };

  HS.chapter(def);
  HS.readingSketches = { abao: sketchAbao, muzhiyu: sketchFeathers, fuchi: sketchCrabs };
})();
