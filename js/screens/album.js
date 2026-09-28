/* 护生之约 · the album: every page of the game in one place */
(function () {
  'use strict';
  const { h } = HS;

  function studioThumb() {
    const A = Art, C = A.C;
    let s = A.blob(500, 380, 520, 60, C.ochre, 0.16);
    s += A.desk(250, 760, 300, 110);
    s += `<rect x="360" y="232" width="250" height="66" fill="${C.white}" stroke="${C.ink}" stroke-width="1.4" transform="rotate(-3 485 265)"/>`;
    s += A.stroke([[395, 272], [430, 258], [470, 266]], 4) + A.place(A.ant(false), { x: 520, y: 262, s: 1.6 }) + A.flower(575, 290, 1.1);
    s += A.brushPot(690, 300);
    s += A.place(A.cat(), { x: 190, y: 404, s: 0.7 });
    s += A.place(A.seal('护生'), { x: 820, y: 120, s: 0.55 });
    return s;
  }

  function quizThumb() {
    const A = Art, C = A.C;
    let s = A.blob(500, 215, 440, 150, C.mount || '#cad4ce', 0.25);
    s += `<rect x="300" y="70" width="400" height="290" fill="${C.white}" stroke="${C.ink}" stroke-width="1.6"/>`;
    s += `<rect x="314" y="84" width="372" height="262" fill="none" stroke="${C.seal}" stroke-width="1.4" stroke-opacity=".7"/>`;
    for (let i = 0; i < 5; i++) s += A.line([[350, 170 + i * 26], [650 - (i === 4 ? 140 : 0), 170 + i * 26]], 2.2, { op: 0.35 });
    s += A.stroke([[400, 130], [600, 128]], 7, { head: 0.9 });
    s += A.place(A.seal('护生'), { x: 585, y: 262, s: 0.62 });
    s += A.place(A.littleChick(), { x: 230, y: 330, s: 2.2 }) + A.place(A.littleChick(), { x: 780, y: 330, s: 2.2, flip: true });
    return s;
  }

  function card(o) {
    const art = h('div', { class: 'painting leaf-art', html: Art.svg(o.art, o.w || 1000, o.hgt || 625) });
    if (o.todo) art.appendChild(h('div', { class: 'leaf-draft' }, h('span', {}, HS.t('album.todo'))));
    const btn = h('button', { class: 'leaf-btn', type: 'button', onclick: () => { Sound.unlock(); Sound.page(); HS.go(o.go); } },
      h('div', { class: 'mount' }, art),
      h('div', { class: 'leaf-meta' },
        h('span', { class: 'leaf-no' }, o.no),
        h('span', { class: 'leaf-title' }, o.title),
        o.seals != null ? HS.sealsRow(o.seals) : o.badge ? h('span', { class: 'leaf-tag', style: 'grid-column:auto;color:var(--seal-deep)' }, o.badge) : h('span', {}),
        h('span', { class: 'leaf-tag' }, o.tag)));
    return h('li', { class: `leaf ${o.todo ? 'is-todo' : 'is-done'}${o.wide ? ' leaf-wide' : ''}`, id: 'leaf-' + o.go }, btn);
  }

  HS.screens.album = {
    enter(root, params) {
      const t = HS.t, P = HS.progress();
      const name = (HS.state.name || '').trim();
      const head = h('header', { class: 'album-head' },
        h('div', {},
          h('h1', { class: 'album-title' }, name ? t('album.titleNamed', { name }) : t('album.title')),
          h('p', { class: 'album-progress' }, t('album.progress', { done: P.done, seals: P.seals }))),
        h('div', { class: 'toolbar' },
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => HS.go('title') }, '‹ ' + t('ui.cover')),
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => HS.go('teacher') }, t('title.teacher')),
          HS.langButton(),
          HS.soundButton()));

      const intro = h('ul', { class: 'album-intro', style: 'margin:0;padding:0' }, h('li', { class: 'leaf leaf-intro is-done', id: 'leaf-prologue' },
        h('button', { class: 'leaf-btn', type: 'button', onclick: () => { Sound.unlock(); Sound.page(); HS.go('prologue'); } },
          h('div', { class: 'mount' }, h('div', { class: 'painting leaf-art', html: Art.svg(HS.prologueThumb ? HS.prologueThumb() : '', 1000, 625) })),
          h('div', { class: 'leaf-meta' },
            h('span', { class: 'leaf-no' }, t('album.prologue').split(' · ')[0] + (HS.state.prologue ? ' · ' + t('album.read') : '')),
            h('span', { class: 'leaf-title' }, t('pro.title')),
            h('span', { class: 'leaf-desc' }, HS.en() ? `${t('album.prologueDesc')}: ${t('pro.p4.gloss')}` : `${t('album.prologueDesc')}：“${HS.zh('pro.p4.quote')}”`)))));
      const grid = h('ol', { class: 'album-grid' });
      for (const def of HS.chapters) {
        const p = HS.state.pages[def.id];
        const done = !!(p && p.done);
        grid.appendChild(card({
          go: def.id, no: HS.pageNo(def.no), title: t(def.key + '.title'),
          tag: `${t(def.key + '.animal')} · ${t(def.key + '.season')}`,
          art: def.painting(), todo: !done, seals: done ? p.seals || 1 : null,
        }));
      }

      const extra = h('ol', { class: 'album-grid album-extra' },
        card({ go: 'studio', no: t('album.studio').split(' · ')[0], title: t('studio.title'), tag: t('album.studioDesc'), art: studioThumb(), hgt: 430, wide: true }),
        card({ go: 'quiz', no: '', title: t('album.quiz'), tag: t('album.quizDesc'), art: quizThumb(), hgt: 430, wide: true, badge: HS.state.quiz.passed ? t('album.quizPassed') : null }));

      const parts = [head];
      if (P.done === P.total) {
        parts.push(h('div', { class: 'finish-banner', role: 'status' }, h('span', { html: Art.sealSVG(HS.playerSealText(), { cls: 'seal-svg' }) }), h('p', {}, t('album.finish'))));
      } else {
        parts.push(h('p', { class: 'album-hint' }, t('album.hint')));
      }
      parts.push(intro, grid, extra);
      root.appendChild(h('section', { class: 'album' }, ...parts));

      if (params.highlight) {
        const el = document.getElementById('leaf-' + params.highlight);
        if (el) {
          el.classList.add('is-new');
          requestAnimationFrame(() => el.scrollIntoView({ block: 'center', behavior: HS.reducedMotion() ? 'auto' : 'smooth' }));
          const b = el.querySelector('button');
          if (b) b.focus({ preventScroll: true });
        }
      }
    },
  };
})();
