/* 护生之约 · main.js: start the game */
(function () {
  'use strict';
  let booted = false;

  function boot(data) {
    if (booted) return;
    booted = true;
    const defs = document.createElementNS(HS.NS, 'svg');
    defs.setAttribute('width', '0');
    defs.setAttribute('height', '0');
    defs.setAttribute('aria-hidden', 'true');
    defs.setAttribute('focusable', 'false');
    defs.style.position = 'absolute';
    defs.innerHTML = '<defs>' + Art.defs() + '</defs>';
    document.body.prepend(defs);

    HS.applyLang();
    Sound.setEnabled(HS.state.sound);
    HS.warmDownloads();

    const wanted = data && data.screen && HS.screens[data.screen] ? data.screen : HS.routeFromHash();
    HS.go(wanted || 'title', { keepHash: true });

    window.addEventListener('hashchange', () => {
      const id = HS.routeFromHash();
      if (id && id !== HS.current()) HS.go(id, { keepHash: true });
    });
    const unlock = () => {
      Sound.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  /* When hosted as a Claude artifact, keep the current screen across live updates. */
  let hot = null;
  try { hot = window.claude && window.claude.hot; } catch (e) { hot = null; }
  if (hot && typeof hot.snapshot === 'function') {
    try { hot.snapshot(() => ({ screen: HS.current() })); } catch (e) { /* optional */ }
  }
  if (hot && typeof hot.ready === 'function') {
    try { hot.ready(boot); } catch (e) { boot({}); }
    setTimeout(() => boot({}), 1500);
  } else {
    boot((hot && hot.data) || {});
  }
})();
