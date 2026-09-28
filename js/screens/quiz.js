/* 护生之约 · 护生小博士 (The Kindness Quiz) and the certificate */
(function () {
  'use strict';
  const A = Art, C = Art.C;
  const { h } = HS;
  const N = 8, PASS = 6;

  async function certificate() {
    const t = HS.t, en = HS.en();
    await HS.fontsReady([['80px "Ma Shan Zheng"', '护生小画师证书丰子恺'], ['60px "Caveat Brush"', 'Little Painter'], ['30px "Noto Serif SC"', '同学走进了画册'], ['30px "Andika"', 'Aa']]);
    const W = 1600, H = 1130;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = '#cad4ce'; g.fillRect(0, 0, W, H);
    g.save(); g.translate(44, 44); HS.paperFill(g, W - 88, H - 88, '#f8f2e5'); g.restore();
    g.strokeStyle = '#b5362c'; g.lineWidth = 4; g.strokeRect(80, 80, W - 160, H - 160);
    g.lineWidth = 1.5; g.strokeRect(94, 94, W - 188, H - 188);
    // pictures: willow on the left, the cat and chicks at the bottom
    const art = A.svg(A.willow(150, 560, 0.95, 11, { long: 220 }) + A.place(A.cat(), { x: 170, y: 640, s: 0.9 }) + A.place(A.littleChick(), { x: 260, y: 632, s: 1.6 }), 400, 660, { defs: true }).replace('<svg ', '<svg width="400" height="660" ');
    const img = await HS.svgToImage(art).catch(() => null);
    if (img) g.drawImage(img, 100, 380, 400 * 0.95, 660 * 0.95);
    const brush = '"Ma Shan Zheng","STKaiti","KaiTi",serif';
    g.fillStyle = '#26221e'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if (en) {
      g.font = `96px "Caveat Brush", ${brush}`;
      g.fillText(t('cert.title'), W / 2, 250);
      g.font = `40px "Andika", sans-serif`; g.fillStyle = '#8c271f';
      g.fillText(t('cert.word').toUpperCase(), W / 2, 310);
    } else {
      g.font = `118px ${brush}`;
      g.fillText(t('cert.title'), W / 2, 262);
      g.font = `46px ${brush}`; g.fillStyle = '#8c271f';
      g.fillText(t('cert.word'), W / 2, 330);
    }
    const P = HS.progress();
    const name = (HS.state.name || '').trim() || t('cert.anon');
    const body = t('cert.body', { name, pages: P.done, seals: P.seals });
    g.fillStyle = '#26221e';
    g.font = en ? '36px "Andika", "Trebuchet MS", sans-serif' : '38px "Noto Serif SC", "Songti SC", serif';
    g.textAlign = 'left';
    wrap(g, body, 520, 440, 900, en ? 56 : 64, !en);
    g.textAlign = 'center';
    g.font = `52px ${brush}`; g.fillStyle = '#8c271f';
    g.fillText(HS.zh('cert.quote') + '　——' + HS.zh('cert.quoteBy'), W / 2 + 160, 800);
    if (en) { g.font = 'italic 30px "Andika", sans-serif'; g.fillStyle = '#5a524a'; g.fillText(`“${t('cert.quoteEn')}” — ${t('cert.quoteBy')}`, W / 2 + 160, 850); }
    const d = new Date();
    g.font = '28px "Noto Serif SC", "Andika", serif'; g.fillStyle = '#5a524a'; g.textAlign = 'right';
    g.fillText(`${t('cert.issuer')} · ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`, W - 290, H - 150);
    HS.drawSeal(g, HS.playerSealText(), W - 260, H - 250, 120);
    return cv;
  }

  function wrap(g, text, x, y, maxW, lh, cjk) {
    const units = cjk ? Array.from(text) : text.split(/(\s+)/);
    let line = '';
    for (const u of units) {
      const test = line + u;
      if (g.measureText(test).width > maxW && line.trim()) { g.fillText(line.trim(), x, y); y += lh; line = u.trim() ? u : ''; } else line = test;
    }
    if (line.trim()) g.fillText(line.trim(), x, y);
    return y;
  }

  HS.certificate = certificate;

  HS.screens.quiz = {
    enter(root) {
      const t = HS.t, en = HS.en();
      const { bar, stat } = HS.hud({ no: 8, key: 'quiz' });
      bar.querySelector('.hud-no').textContent = '';
      const main = h('div', { class: 'quiz' });
      root.appendChild(h('section', {}, bar, main));

      function showCert() {
        main.querySelectorAll('.btn').forEach((b) => { b.disabled = true; });
        certificate().then((cv) => {
          main.querySelectorAll('.btn').forEach((b) => { b.disabled = false; });
          HS.showPicture(cv, `${t('cert.title')}.png`, { title: t('cert.title'), alt: t('cert.title') });
        });
      }

      function intro() {
        stat.textContent = '';
        main.innerHTML = '';
        main.appendChild(h('div', { class: 'quiz-card' },
          h('div', { class: 'card-row' }, h('div', { class: 'guide-cat', html: HS.catSVG() }), h('p', {}, t('quiz.intro', { n: N, pass: PASS }))),
          h('div', { class: 'card-actions', style: 'justify-content:flex-start' },
            h('button', { class: 'btn btn-seal', type: 'button', onclick: () => { Sound.unlock(); Sound.page(); run(); } }, t('quiz.go')),
            HS.state.quiz.passed ? h('button', { class: 'btn', type: 'button', onclick: showCert }, t('quiz.certBtn')) : null)));
      }

      function run() {
        const qs = HS.shuffle(window.QUIZ).slice(0, N).map((q) => q[en ? 'en' : 'zh']);
        let i = 0, score = 0;
        function ask() {
          const q = qs[i];
          const right = q.a[0];
          stat.textContent = t('quiz.q', { a: i + 1, b: N });
          main.innerHTML = '';
          const list = h('div', { class: 'choice-list' });
          const after = h('div', { 'aria-live': 'polite', style: 'display:grid;gap:.7rem' });
          HS.shuffle(q.a).forEach((label) => {
            const b = h('button', { class: 'choice', type: 'button' }, label);
            b.addEventListener('click', () => {
              list.querySelectorAll('button').forEach((x) => {
                x.disabled = true;
                if (x.textContent === right) x.classList.add('is-right');
              });
              const ok = label === right;
              if (ok) { score++; Sound.good(); } else { b.classList.add('is-wrong'); Sound.oops(); }
              after.append(
                h('p', { class: 'why' + (ok ? '' : ' is-wrong') }, h('b', {}, ok ? t('quiz.right') : t('quiz.wrong', { a: right })), ' ', q.why),
                h('div', { class: 'card-actions', style: 'justify-content:flex-start' },
                  h('button', { class: 'btn btn-seal', type: 'button', 'data-next': '', onclick: () => { Sound.page(); i++; if (i < N) ask(); else result(); } }, i + 1 < N ? t('quiz.next') + ' ›' : t('quiz.finish'))));
              const n = after.querySelector('[data-next]');
              if (n) n.focus({ preventScroll: true });
            });
            list.appendChild(b);
          });
          main.appendChild(h('div', { class: 'quiz-card' },
            h('div', { class: 'quiz-meta' }, h('span', {}, t('quiz.q', { a: i + 1, b: N })), h('span', {}, `✓ ${score}`)),
            h('div', { class: 'bar' }, h('i', { style: `width:${(i / N) * 100}%` })),
            h('h2', {}, q.q), list, after));
        }
        function result() {
          const passed = score >= PASS;
          HS.state.quiz.best = Math.max(HS.state.quiz.best || 0, score);
          if (passed) HS.state.quiz.passed = true;
          HS.save();
          stat.textContent = '';
          main.innerHTML = '';
          if (passed) Sound.win(); else Sound.soft();
          main.appendChild(h('div', { class: 'quiz-card' },
            h('h2', {}, t('quiz.score', { a: score, b: N })),
            h('p', {}, passed ? t('quiz.pass') : t('quiz.fail')),
            h('div', { class: 'card-actions', style: 'justify-content:flex-start' },
              passed ? h('button', { class: 'btn btn-seal', type: 'button', onclick: showCert }, t('quiz.certBtn')) : null,
              h('button', { class: passed ? 'btn' : 'btn btn-seal', type: 'button', onclick: () => { Sound.page(); run(); } }, t('quiz.retry')),
              h('button', { class: 'btn', type: 'button', onclick: () => HS.go('album') }, t('ui.backToAlbum')))));
        }
        ask();
      }

      intro();
    },
  };
})();
