/* 护生之约 · the album cover */
(function () {
  'use strict';
  const { h } = HS;

  /* An evening under the willow: a child points out the new moon to the cat. */
  HS.coverArt = function () {
    const A = Art, C = A.C;
    let s = '';
    s += A.hills(560, 21, { color: C.indigo, op: 0.13, h: 120 });
    s += A.hills(590, 34, { color: C.green, op: 0.12, h: 60 });
    s += A.moon(470, 160, 34, { glow: true });
    s += A.blob(560, 660, 600, 70, C.ochre, 0.2);
    s += A.willow(170, 670, 1.38, 11);
    // a low stone step
    s += A.shape('M470 612C520 598 640 598 700 610L706 640C640 650 520 650 466 640Z', '#b9b2a2', 0.55, { filter: 'hs-wash' });
    s += A.stroke([[468, 612], [540, 601], [640, 600], [702, 610]], 3.2, { head: 0.8 });
    s += A.line([[466, 640], [600, 648], [706, 640]], 1.3, { op: 0.6 });
    s += A.kid({ x: 586, y: 612, s: 1.25, flip: true, legs: 'sit', jacket: C.rouge, arms: { l: [[-16, -62], [-4, -50]], r: [[26, -86], [40, -112]] } });
    s += A.place(A.cat(), { x: 676, y: 604, s: 0.62 });
    // fireflies
    A.seed(5);
    for (let i = 0; i < 9; i++) {
      const x = A.rnd(250, 460), y = A.rnd(360, 560);
      s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="9" fill="#f4ec9a" fill-opacity=".35" filter="url(#hs-blur)"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="2.6" fill="#f2e27a"/>`;
    }
    s += A.grass(430, 620, 1.3, 3) + A.grass(760, 632, 1.1, 4) + A.grass(820, 640, 0.9, 6);
    return s;
  };

  HS.screens.title = {
    enter(root) {
      const t = HS.t;
      const P = HS.progress();
      const started = P.done > 0 || HS.state.prologue;
      const seal = h('div', { class: 'cover-seal', html: Art.sealSVG(HS.playerSealText(), { cls: 'seal-svg' }) });
      const input = h('input', { type: 'text', id: 'hs-name', maxlength: '12', autocomplete: 'off', placeholder: t('title.namePh'), value: HS.state.name || '' });
      input.addEventListener('input', () => {
        HS.state.name = input.value.trim().slice(0, 12);
        HS.save();
        seal.innerHTML = Art.sealSVG(HS.playerSealText(), { cls: 'seal-svg' });
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); begin(); } });

      function begin() {
        Sound.unlock();
        Sound.page();
        HS.go(HS.state.prologue ? 'album' : 'prologue');
      }

      const actions = h('div', { class: 'cover-actions' },
        h('button', { class: 'btn btn-seal', type: 'button', onclick: begin }, started ? t('title.continue') : t('title.start')),
        started ? h('button', { class: 'btn', type: 'button', onclick: () => { Sound.page(); HS.go('prologue'); } }, t('album.prologue')) : null);

      root.appendChild(h('section', { class: 'cover' },
        h('div', { class: 'cover-frame mount' },
          h('div', { class: 'painting', html: Art.svg(HS.coverArt(), 1000, 700, { label: t('app.name') }) }),
          h('div', { class: 'cover-ins' }, h('h1', { class: 'cover-title', lang: 'zh-CN' }, '护生之约'), seal)),
        h('div', { class: 'cover-body' },
          h('p', { class: 'cover-sub' }, t('app.sub')),
          h('p', { class: 'cover-lede' }, t('app.lede')),
          h('div', { class: 'cover-name' },
            h('label', { for: 'hs-name' }, t('title.nameLabel')),
            input,
            h('small', {}, t('title.nameHint'))),
          actions,
          h('div', { class: 'toolbar' },
            h('button', { class: 'btn btn-small', type: 'button', onclick: () => HS.go('teacher') }, t('title.teacher')),
            HS.soundButton()),
          h('p', { class: 'cover-credit' }, t('app.credit')))));
    },
  };
})();
