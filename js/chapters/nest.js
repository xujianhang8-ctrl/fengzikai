/* 护生之约 · 第四页 · 望母归 (Waiting for Mother)
 * Talk a boy out of shooting a mother bird, then carry a fallen chick
 * back to its nest, slowly enough that it is not frightened. */
(function () {
  'use strict';
  const A = Art, C = Art.C;
  const NEST = { x: 705, y: 196 };
  const GROUND_Y = 572;
  // branches the chick must be carried around: [points, width]
  const BRANCHES = [
    [[[790, 468], [690, 452], [590, 432]], 15],
    [[[775, 336], [700, 318], [628, 300]], 13],
    [[[780, 214], [742, 206], [655, 205]], 11],
    [[[805, 400], [880, 360], [950, 330]], 12],
  ];

  function tree() {
    let s = '';
    A.seed(33);
    s += A.blob(700, 170, 250, 120, C.ochre, 0.3) + A.blob(560, 250, 120, 80, C.rouge, 0.18) + A.blob(880, 230, 120, 110, C.ochre, 0.26) + A.blob(780, 90, 160, 70, '#c9b25b', 0.25);
    s += A.stroke([[800, 640], [790, 520], [772, 380], [778, 240], [766, 60]], 30, { head: 1, tail: 0.5, wob: 0.06 });
    s += A.line([[790, 560], [786, 540]], 1.2, { op: 0.4 }) + A.line([[778, 420], [782, 400]], 1.2, { op: 0.4 });
    for (const [pts, w] of BRANCHES) s += A.stroke(pts, w, { head: 1, tail: 0.35, wob: 0.05 });
    s += A.stroke([[770, 150], [700, 110], [610, 96]], 8, { head: 1, tail: 0.2 }) + A.stroke([[776, 120], [860, 80], [940, 70]], 8, { head: 1, tail: 0.2 });
    for (let i = 0; i < 26; i++) {
      const x = A.rnd(520, 980), y = A.rnd(40, 420);
      if (Math.abs(x - NEST.x) < 60 && Math.abs(y - NEST.y) < 40) continue;
      s += A.place(A.leafShape([C.ochre, '#c26a4a', '#b8b35a', '#a8743f'][i % 4]), { x, y, r: A.rnd(0, 180), s: A.rnd(0.7, 1.1) });
    }
    return s;
  }

  function ground() {
    let s = `<rect width="1000" height="625" fill="#f4ede0"/>`;
    s += A.hills(430, 71, { color: C.indigo, op: 0.12, h: 90 });
    s += A.shape(`M-20 ${GROUND_Y}L1020 ${GROUND_Y - 6} 1020 640-20 640Z`, C.ochre, 0.2, { filter: 'hs-wash' });
    s += A.line([[-10, GROUND_Y], [1010, GROUND_Y - 6]], 1.3, { op: 0.45 });
    s += A.grass(90, GROUND_Y + 8, 1.2, 5) + A.grass(470, GROUND_Y + 6, 1, 6) + A.grass(940, GROUND_Y + 2, 1.1, 7);
    return s;
  }

  const nestChicks = (open) => A.place(A.chickHead(open), { x: NEST.x - 18, y: NEST.y - 10, s: 1.25 }) + A.place(A.chickHead(open), { x: NEST.x + 16, y: NEST.y - 12, s: 1.25, flip: true });

  function boy(aiming) {
    const arms = aiming
      ? { l: [[20, -86], [34, -110]], r: [[22, -88], [40, -116]] }
      : { l: [[-18, -64], [-14, -48]], r: [[18, -62], [16, -46]] };
    let s = A.kid({ x: 250, y: GROUND_Y, s: 1.3, jacket: '#6f8aa4', hair: 'boy', arms });
    s += aiming ? A.place(A.slingshot(), { x: 250 + 40 * 1.3, y: GROUND_Y - 116 * 1.3, s: 1.4, r: 30 }) : A.place(A.slingshot(), { x: 330, y: GROUND_Y + 2, s: 1.2, r: 100 });
    return s;
  }

  function painting() {
    let s = ground() + tree();
    s += A.place(A.nest(), { x: NEST.x, y: NEST.y + 8, s: 1.3 }) + nestChicks(true) + A.place(A.chickHead(true), { x: NEST.x - 2, y: NEST.y - 16, s: 1.2 });
    s += A.place(A.bird({ color: '#8f7b5d', fly: true }), { x: NEST.x - 70, y: NEST.y - 50, s: 1.1, r: 10 });
    s += boy(false);
    s += A.kid({ x: 400, y: GROUND_Y + 2, s: 1.2, jacket: C.rouge, hair: 'girl', arms: { l: [[-18, -66], [-12, -50]], r: [[22, -88], [34, -112]] } });
    return s;
  }

  function pov() {
    let s = `<rect width="1000" height="420" fill="#efe7d6"/>`;
    s += A.place(A.nest(), { x: 820, y: 60, s: 0.8 }) + A.stroke([[1000, 70], [860, 66], [780, 60]], 5);
    A.seed(14);
    for (let i = 0; i < 30; i++) {
      const x = A.rnd(0, 1000), h = A.rnd(180, 380);
      s += A.stroke([[x, 430], [x + A.rnd(-20, 20), 430 - h * 0.5], [x + A.rnd(-50, 50), 430 - h]], A.rnd(10, 18), { color: i % 3 ? '#8aa46d' : '#6f8f55', op: 0.75, head: 1, tail: 0.1 });
    }
    s += A.place(A.fledgling(), { x: 470, y: 380, s: 2.2 });
    return s;
  }

  // distance from a point to a segment
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
    const k = HS.clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
    return Math.hypot(px - (ax + dx * k), py - (ay + dy * k));
  }
  function hitsBranch(x, y, r) {
    for (const [pts, w] of BRANCHES) {
      for (let i = 0; i < pts.length - 1; i++) {
        if (segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) < r + w * 0.45) return true;
      }
    }
    return false;
  }

  HS.chapter({
    id: 'nest', key: 'nest', no: 4,
    painting, pov,
    askKey: 'nest.ask2',
    skipHowto: true,
    play(ctx) {
      return new Promise((resolve) => {
        const t = ctx.t, en = HS.en();
        ctx.add('bg', ground() + tree());
        ctx.add('nest', A.place(A.nest(), { x: NEST.x, y: NEST.y + 8, s: 1.3 }));
        const chicks = ctx.add('chicks', nestChicks(true));
        const mother = ctx.add('mother', A.bird({ color: '#8f7b5d' }));
        HS.setPos(mother, 648, 279, 0, 1.1, true);
        const boyEl = ctx.add('boy', boy(true));
        const leafFx = ctx.layer('leaffx');
        const fx = ctx.layer('carry');

        // chicks cheep now and then
        const stopBob = ctx.loop((dt, now) => {
          chicks.setAttribute('transform', `translate(0 ${(Math.sin(now * 8) * 1.5).toFixed(1)})`);
        });
        let cheepClock = 0;
        const stopCheep = ctx.loop((dt) => { cheepClock += dt; if (cheepClock > 3.5) { cheepClock = 0; Sound.chirp(3, 3200); } });

        const who = en ? 'Boy' : '男孩';
        ctx.dialogue({
          speaker: who, line: t('nest.boy1'), prompt: t('nest.ask'), replier: who,
          options: HS.shuffle([
            { value: 1, label: t('nest.opt1'), reply: t('nest.res1'), hint: t('nest.hint1') },
            { value: 2, label: t('nest.opt2'), reply: t('nest.res2'), correct: true },
            { value: 3, label: t('nest.opt3'), reply: t('nest.res3'), hint: t('nest.hint3') },
          ]),
          onRight: () => {
            boyEl.innerHTML = boy(false);
            Sound.chirp(3, 3000);
          },
          onWrong: () => Sound.oops(),
        }).then(async (res) => {
          const tries = res.tries.length;
          await ctx.card({
            eyebrow: t('nest.poemBy'),
            title: HS.zh('nest.verse'),
            body: [note(t('nest.good')), zhPoem(HS.zh('nest.poem')), en ? t('nest.poemEn') : t('nest.poemGloss')],
            button: t('ui.continue'),
          });
          stopBob(); stopCheep();
          // the mother flies off to find insects
          await flyMother(648, 279, -60, 90, 1.4);
          mother.setAttribute('opacity', '0');
          await wind();
          await ctx.card({ eyebrow: `${HS.pageNo(4)} · ${t('ch.howto')}`, title: t('nest.boy2'), body: [t('nest.howto')], button: t('ui.start') });
          const r = await carry();
          mother.setAttribute('opacity', '1');
          await flyMother(-60, 90, NEST.x - 40, NEST.y - 30, 2.2);
          HS.setPos(mother, NEST.x - 40, NEST.y - 30, 0, 1.1);
          Sound.chirp(4, 3100);
          ctx.say(t('nest.win'), 4200);
          Sound.win();
          await ctx.wait(2600);
          const slips = r.panics + r.bumps + Math.max(0, tries - 1);
          resolve({ seals: slips <= 1 ? 3 : slips <= 4 ? 2 : 1 });
        });

        function note(text) { return HS.h('p', { class: 'muted' }, text); }
        function zhPoem(text) { return HS.h('p', { class: 'poem-zh', lang: 'zh-CN' }, text); }

        function flyMother(x0, y0, x1, y1, dur) {
          return new Promise((res) => {
            const bird = A.bird({ color: '#8f7b5d', fly: true });
            mother.innerHTML = bird;
            let k = 0;
            const flip = x1 < x0;
            const stop = ctx.loop((dt) => {
              k = Math.min(1, k + dt / dur);
              const x = HS.lerp(x0, x1, k), y = HS.lerp(y0, y1, k) - Math.sin(k * Math.PI) * 60;
              HS.setPos(mother, x, y, 0, 1.1, flip);
              if (k >= 1) { stop(); mother.innerHTML = A.bird({ color: '#8f7b5d' }); res(); }
            });
          });
        }

        function wind() {
          return new Promise((res) => {
            ctx.say(t('nest.wind'), 3800);
            Sound.wind();
            const leaves = [];
            for (let i = 0; i < 14; i++) {
              const el = HS.sprite(leafFx, A.leafShape([C.ochre, '#c26a4a', '#b8b35a'][i % 3]));
              leaves.push({ el, x: 520 + Math.random() * 460, y: 40 + Math.random() * 360, vx: -260 - Math.random() * 200, vy: 40 + Math.random() * 60, r: Math.random() * 360 });
            }
            const chick = HS.sprite(fx, A.fledgling());
            let cy = NEST.y - 6, vy = -120, x = NEST.x - 6, landed = false, clock = 0;
            const stop = ctx.loop((dt) => {
              clock += dt;
              for (const l of leaves) { l.x += l.vx * dt; l.y += l.vy * dt; l.r += 300 * dt; HS.setPos(l.el, l.x, l.y, l.r); }
              const sway = clock < 1.4 ? Math.sin(clock * 30) * 3 : 0;
              chicks.setAttribute('transform', `translate(${sway.toFixed(1)} 0)`);
              if (clock > 0.5 && !landed) {
                vy += 900 * dt; cy += vy * dt; x -= 70 * dt;
                const floor = GROUND_Y - 14;
                if (cy >= floor) { cy = floor; if (Math.abs(vy) < 160) { landed = true; } vy = -vy * 0.35; Sound.bump(); }
                HS.setPos(chick, x, cy, clock * 200 % 360 * (landed ? 0 : 1), 1.1);
              }
              if (landed && clock > 2.2) {
                stop();
                leaves.forEach((l) => l.el.remove());
                HS.setPos(chick, x, GROUND_Y - 14, 0, 1.1);
                ctx.chick = { el: chick, x, y: GROUND_Y - 14 };
                res();
              }
            });
          });
        }

        function carry() {
          return new Promise((res) => {
            const c = ctx.chick;
            const hands = HS.sprite(fx, `<path d="M-22 6C-24 18-8 26 0 24 8 26 24 18 22 6C12 12-12 12-22 6Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.4"/>`, { opacity: '0' });
            const meter = ctx.add('meter', `<g transform="translate(40 40)"><text x="0" y="-8" font-size="20" fill="${C.ink2}" font-family="'Ma Shan Zheng','Caveat Brush','KaiTi',serif">${t('nest.fearLabel')}</text><rect x="0" y="0" width="160" height="12" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.2"/><rect class="fear" x="1" y="1" width="0" height="10" fill="${C.seal}"/></g>`);
            const fearBar = meter.querySelector('.fear');
            let held = false, target = null, fear = 0, panic = 0, panics = 0, bumps = 0, bumpCool = 0, lastX = c.x, lastY = c.y, done = false;
            const limit = ctx.easy ? 330 : 240;
            const stat = () => ctx.stat(t('nest.stat', { a: panics, b: bumps }));
            stat();
            const onDown = (e) => {
              if (done) return;
              const p = ctx.point(e);
              if (HS.dist(p.x, p.y, c.x, c.y) < 48 * ctx.reach) {
                held = true; target = p;
                hands.setAttribute('opacity', '1');
                try { ctx.svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
                ctx.svg.classList.add('is-dragging');
                Sound.chirp(1, 3400);
              }
            };
            const onMove = (e) => { if (held) target = ctx.point(e); };
            const onUp = () => { held = false; ctx.svg.classList.remove('is-dragging'); };
            ctx.on(ctx.svg, 'pointerdown', onDown);
            ctx.on(ctx.svg, 'pointermove', onMove);
            ctx.on(ctx.svg, 'pointerup', onUp);
            ctx.on(ctx.svg, 'pointercancel', onUp);
            const stop = ctx.loop((dt, now) => {
              bumpCool = Math.max(0, bumpCool - dt);
              let speed = 0;
              if (panic > 0) {
                panic -= dt;
                if (panic <= 0) { ctx.say(t('nest.calm'), 2200); fear = 0.5; }
              } else if (held && target && !done) {
                const nx = c.x + (target.x - c.x) * Math.min(1, dt * 10);
                const ny = Math.min(GROUND_Y - 14, c.y + (target.y - c.y) * Math.min(1, dt * 10));
                speed = Math.hypot(nx - c.x, ny - c.y) / (dt || 0.016);
                if (hitsBranch(nx, ny, 14)) {
                  if (bumpCool <= 0) { bumps++; bumpCool = 0.9; stat(); Sound.bump(); ctx.float(c.x, c.y - 26, '!', C.seal, 30); ctx.say(t('nest.bump'), 1800); fear = Math.min(1, fear + 0.3); }
                } else { c.x = nx; c.y = ny; }
              }
              if (speed > limit) fear += ((speed - limit) / limit) * dt * 1.8;
              else fear = Math.max(0, fear - dt * 0.45);
              if (fear >= 1 && panic <= 0) {
                panic = 1.6; panics++; fear = 1; stat();
                Sound.chirp(4, 3800);
                ctx.say(t('nest.fast'), 3000);
              }
              fearBar.setAttribute('width', (Math.min(1, fear) * 158).toFixed(1));
              const shake = panic > 0 || fear > 0.6 ? (Math.random() - 0.5) * 3 * Math.min(1, fear + (panic > 0 ? 1 : 0)) : 0;
              HS.setPos(c.el, c.x + shake, c.y, 0, 1.1);
              HS.setPos(hands, c.x, c.y + 4, 0, 1);
              lastX = c.x; lastY = c.y;
              if (!done && HS.dist(c.x, c.y, NEST.x, NEST.y - 4) < 34) {
                done = true;
                held = false;
                stop();
                hands.remove();
                meter.remove();
                c.el.remove();
                chicks.innerHTML = nestChicks(true) + A.place(A.chickHead(true), { x: NEST.x - 2, y: NEST.y - 16, s: 1.2 });
                Sound.good();
                res({ panics, bumps });
              }
            });
          });
        }
      });
    },
  });
})();
