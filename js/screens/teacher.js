/* 护生之约 · 给老师 (For Teachers) */
(function () {
  'use strict';
  const { h } = HS;

  HS.screens.teacher = {
    enter(root) {
      const t = HS.t;
      const list = (items, ordered) => h(ordered ? 'ol' : 'ul', {}, items.map((x) => h('li', {}, x)));

      const asks = h('ul', { class: 'asks' },
        HS.chapters.map((c) => h('li', {}, h('b', {}, `${HS.pageNo(c.no)} · ${t(c.key + '.title')}：`.replace('：', HS.en() ? ': ' : '：')), t(c.askKey || c.key + '.ask'))));

      // original paintings: which scans are present
      const origList = h('ul', {});
      Object.keys(window.PAINTINGS || {}).forEach((id) => {
        const p = HS.painting(id);
        const status = h('span', { class: 'muted' }, t('teach.checking'));
        origList.appendChild(h('li', {}, h('span', { class: 'brush', lang: 'zh-CN' }, `《${p.title}》`), ' ', HS.en() ? `${p.titleEn} · ` : '', h('code', {}, p.file), ' — ', status));
        HS.hasOriginal(id).then((ok) => {
          status.textContent = ok ? t('teach.found') : t('teach.missing');
          status.style.color = ok ? 'var(--ok)' : 'var(--seal-deep)';
        });
      });

      const easy = h('input', { type: 'checkbox', id: 'hs-easy', class: 'switch' });
      easy.checked = !!HS.state.easy;
      easy.addEventListener('change', () => {
        HS.state.easy = easy.checked;
        HS.save();
        if (easy.checked) HS.toast(t('ui.easyOn'));
      });

      const confirm = h('div', { class: 'confirm', hidden: true },
        h('p', {}, t('teach.resetAsk')),
        h('div', { class: 'toolbar' },
          h('button', { class: 'btn btn-small btn-seal', type: 'button', onclick: () => { HS.reset(); confirm.hidden = true; HS.toast(t('teach.resetDone')); } }, t('teach.resetYes')),
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => { confirm.hidden = true; } }, t('teach.resetNo'))));

      root.appendChild(h('article', { class: 'doc' },
        h('div', { class: 'toolbar' },
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => HS.go('album') }, '‹ ' + t('ui.album')),
          h('button', { class: 'btn btn-small', type: 'button', onclick: () => HS.go('title') }, t('ui.cover')),
          HS.langButton()),
        h('h1', {}, t('teach.title')),
        h('section', {}, h('h2', {}, t('teach.who.t')), h('p', {}, t('teach.who'))),
        h('section', {}, h('h2', {}, t('teach.goals.t')), list(t('teach.goals'), true)),
        h('section', {}, h('h2', {}, t('teach.flow.t')), list(t('teach.flow'), true)),
        h('section', {}, h('h2', {}, t('teach.ask.t')), asks),
        h('section', {}, h('h2', {}, t('teach.orig.t')), h('p', {}, t('teach.orig')), origList, h('p', { class: 'muted', style: 'font-size:.95rem' }, t('teach.rights'))),
        h('section', {}, h('h2', {}, t('teach.about.t')), h('p', {}, t('teach.about'))),
        h('section', {}, h('h2', {}, t('teach.links.t')), h('p', {}, t('teach.links'))),
        h('section', {}, h('h2', {}, t('teach.settings.t')),
          h('label', { class: 'setting', for: 'hs-easy' }, easy, h('span', {}, t('teach.easy')), h('small', {}, t('teach.easyDesc'))),
          h('div', {}, h('button', { class: 'btn btn-small', type: 'button', onclick: () => { confirm.hidden = false; } }, t('teach.reset'))),
          confirm)));
    },
  };
})();
