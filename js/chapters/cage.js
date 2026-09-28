/* 护生之约 · 第五页 · 笼门 (The Cage Door)
 * First you are the thrush inside the cage. Then, outside again,
 * you decide what the bird really needs. */
(function () {
  'use strict';
  const A = Art, C = Art.C;
  const BOUNDS = { x0: 96, x1: 904, y0: 132, y1: 540 };
  const PERCH = { x0: 300, x1: 700, y: 430 };
  const TREE_SPOTS = [[790, 250], [860, 205], [735, 330], [900, 300]];

  function winterTree(x, y, s = 1) {
    A.seed(81);
    let t = A.stroke([[0, 0], [6, -120], [-4, -260], [4, -380]], 22, { head: 1, tail: 0.4 });
    const limbs = [[[2, -250], [-70, -300], [-130, -360]], [[4, -300], [70, -350], [120, -410]], [[0, -180], [80, -210], [140, -240]], [[-2, -140], [-60, -160], [-110, -190]], [[4, -360], [-20, -420], [-40, -470]]];
    for (const pts of limbs) {
      t += A.stroke(pts, 7, { head: 1, tail: 0.2 });
      const [ex, ey] = pts[2];
      t += A.line([[ex, ey], [ex + A.rnd(-30, 30), ey - A.rnd(20, 40)]], 1.4) + A.line([[ex, ey], [ex + A.rnd(10, 40), ey + A.rnd(-10, 10)]], 1.2);
      t += `<path d="M${pts[1][0] - 20} ${pts[1][1] - 5}q20-8 40 0" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    }
    return A.place(t, { x, y, s });
  }

  function outsideBg() {
    let s = `<rect width="1000" height="625" fill="#eef0ec"/>`;
    s += A.blob(500, 60, 600, 140, '#c9d6de', 0.35);
    s += A.hills(470, 44, { color: C.indigo, op: 0.13, h: 110 });
    s += A.shape('M-20 540L1020 530 1020 640-20 640Z', '#ffffff', 0.9);
    s += A.line([[-10, 540], [1010, 530]], 1.2, { op: 0.35 });
    s += winterTree(820, 560, 1);
    A.seed(3);
    for (let i = 0; i < 40; i++) s += `<circle cx="${A.rnd(0, 1000).toFixed(0)}" cy="${A.rnd(0, 520).toFixed(0)}" r="${A.rnd(1.2, 2.6).toFixed(1)}" fill="#fff" stroke="${C.ink}" stroke-opacity=".15" stroke-width=".6"/>`;
    return s;
  }

  function bars() {
    const col = '#4a3a28';
    let b = '';
    for (let x = 60; x <= 940; x += 72) {
      const top = 70 + Math.abs(x - 500) * 0.12;
      b += A.stroke([[x, 600], [x + 1, 340], [x, top], [500 + (x - 500) * 0.6, 20]], 5, { color: col, head: 1, tail: 0.6, wob: 0.03 });
    }
    b += `<path d="M40 110C300 80 700 80 960 110" stroke="${col}" stroke-width="7" fill="none"/>`;
    b += `<path d="M20 560C300 575 700 575 980 560L990 625 10 625Z" fill="#8d6b46" fill-opacity=".8" stroke="${C.ink}" stroke-width="2"/>`;
    b += A.stroke([[PERCH.x0 - 30, PERCH.y + 12], [PERCH.x1 + 30, PERCH.y + 12]], 9, { color: '#7a5d3c', head: 1, tail: 1, wob: 0.02 });
    b += `<path d="M150 540L150 510 210 510 210 540Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.6"/><ellipse cx="180" cy="512" rx="30" ry="6" fill="#e5cf8a" stroke="${C.ink}" stroke-width="1"/>`;
    return b;
  }

  function outsideScene() {
    let s = outsideBg();
    s += A.eaves(-20, 640, 60);
    s += A.line([[380, 50], [380, 100]], 2);
    return s;
  }

  function painting() {
    let s = outsideScene();
    s += A.place(A.cage({ door: true }), { x: 380, y: 300, s: 1.05 });
    TREE_SPOTS.forEach(([x, y], i) => { s += A.place(A.bird({ brow: i === 0, color: i === 0 ? '#a47d50' : '#8f8676' }), { x, y, s: 0.9, flip: i % 2 === 1 }); });
    s += A.kid({ x: 540, y: 545, s: 1.15, jacket: C.rouge, hair: 'girl', arms: { l: [[-18, -66], [-12, -50]], r: [[24, -90], [36, -112]] } });
    return s;
  }

  function pov() {
    let s = `<rect width="1000" height="420" fill="#eef0ec"/>`;
    s += A.place(A.cage(), { x: 280, y: 390, s: 1.35 }) + A.place(A.bird({ brow: true }), { x: 280, y: 290, s: 1.1 });
    s += winterTree(760, 420, 0.8);
    s += A.place(A.bird({ brow: true, fly: true }), { x: 700, y: 120, s: 1.2, r: -10 });
    return s;
  }

  HS.chapter({
    id: 'cage', key: 'cage', no: 5,
    painting, pov,
    original: 'qiutu',
    play(ctx) {
      return new Promise((resolve) => {
        const t = ctx.t;
        const bg = ctx.add('bg', outsideBg());
        const freeLayer = ctx.layer('free');
        const barsEl = ctx.add('bars', bars());
        const player = ctx.add('player', A.bird({ brow: true, fly: true }));
        const fade = ctx.add('fade', `<rect width="1000" height="625" fill="#f8f4ea"/>`, { opacity: '0' });

        // free birds outside the cage
        const free = TREE_SPOTS.slice(0, 3).map((p, i) => {
          const el = HS.sprite(freeLayer, A.bird({ color: '#8f8676', fly: true }));
          return { el, cx: p[0] - 60, cy: p[1] - 60, r: 60 + i * 30, ph: i * 2, sp: 0.8 + i * 0.25 };
        });

        ctx.say(t('cage.intro2'), 3800);
        let x = 500, y = PERCH.y - 20, vx = 0, vy = 0, perched = true, bumps = 0, clock = 0, stage = 0, steer = 0, steerClock = 0, over = false;
        const keys = {};
        function flap(dir) {
          if (over) return;
          vy = -330;
          perched = false;
          if (dir) { steer = dir; steerClock = 0.45; }
          Sound.tap();
        }
        ctx.on(ctx.svg, 'pointerdown', (e) => {
          e.preventDefault();
          const p = ctx.point(e);
          flap(p.x < 333 ? -1 : p.x > 667 ? 1 : 0);
        });
        const onKey = (e) => {
          if (e.type === 'keydown') {
            if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); if (!e.repeat) flap(0); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); keys[e.key] = true; if (!e.repeat) flap(e.key === 'ArrowLeft' ? -1 : 1); }
          } else keys[e.key] = false;
        };
        ctx.on(window, 'keydown', onKey);
        ctx.on(window, 'keyup', onKey);

        function bump(nx, ny) {
          bumps++;
          Sound.bump();
          ctx.float(nx, ny - 30, t('cage.bump'), C.seal, 28);
          for (let i = 0; i < 3; i++) {
            const f = HS.sprite(ctx.layer('fx'), `<path d="M0 0C4-6 10-6 12 0 6 2 2 2 0 0Z" fill="#a47d50" stroke="${C.ink}" stroke-width=".6"/>`);
            const fx = nx + (Math.random() - 0.5) * 20, fy = ny + (Math.random() - 0.5) * 20;
            HS.setPos(f, fx, fy, Math.random() * 360);
            if (f.animate && !HS.reducedMotion()) f.animate([{ opacity: 1, transform: `translate(${fx}px, ${fy}px)` }, { opacity: 0, transform: `translate(${fx + (Math.random() - 0.5) * 60}px, ${fy + 70}px) rotate(200deg)` }], { duration: 1100 }).onfinish = () => f.remove();
            else ctx.after(800, () => f.remove());
          }
        }

        const stopA = ctx.loop((dt, now) => {
          clock += dt;
          // free birds loop around the tree and sing
          free.forEach((b, i) => {
            const a = now * b.sp + b.ph;
            HS.setPos(b.el, b.cx + Math.cos(a) * b.r, b.cy + Math.sin(a * 1.3) * b.r * 0.5, 0, 0.7, Math.sin(a) > 0);
          });
          if (Math.random() < dt * 0.6) Sound.chirp(2, 2800 + Math.random() * 600);
          if (over) return;
          // the player's bird
          const want = (keys.ArrowLeft ? -1 : 0) + (keys.ArrowRight ? 1 : 0) || (steerClock > 0 ? steer : 0);
          steerClock -= dt;
          vx += (want * 230 - vx) * Math.min(1, dt * 4);
          if (!perched) vy += 760 * dt;
          let nx = x + vx * dt, ny = y + vy * dt;
          if (nx < BOUNDS.x0) { nx = BOUNDS.x0; if (Math.abs(vx) > 50) bump(nx, ny); vx = Math.abs(vx) * 0.5; steer = 1; }
          if (nx > BOUNDS.x1) { nx = BOUNDS.x1; if (Math.abs(vx) > 50) bump(nx, ny); vx = -Math.abs(vx) * 0.5; steer = -1; }
          if (ny < BOUNDS.y0) { ny = BOUNDS.y0; if (vy < -60) bump(nx, ny); vy = Math.abs(vy) * 0.3; }
          if (vy > 0 && y <= PERCH.y - 20 && ny >= PERCH.y - 20 && nx > PERCH.x0 && nx < PERCH.x1) { ny = PERCH.y - 20; vy = 0; perched = true; }
          if (ny > BOUNDS.y1) { ny = BOUNDS.y1; vy = 0; perched = true; }
          if (perched && (nx < PERCH.x0 || nx > PERCH.x1) && ny < BOUNDS.y1 - 1) perched = false;
          x = nx; y = ny;
          if (perched) vx *= 0.85;
          HS.setPos(player, x, y, HS.clamp(vy * 0.03, -20, 25), 1.6, vx < -10);
          player.querySelectorAll('.wing-up, .wing-down').forEach((w) => { w.style.animationPlayState = perched ? 'paused' : 'running'; });
          // thoughts
          if (stage === 0 && clock > 4) { stage = 1; ctx.say(t('cage.th1'), 3200); }
          if (stage === 1 && (bumps >= 2 || clock > 9)) { stage = 2; ctx.say(t('cage.th2'), 3200); }
          if (stage === 2 && (bumps >= 4 || clock > 14)) {
            stage = 3; ctx.say(t('cage.th3'), 4200);
            ctx.after(4200, partB);
          }
        });

        let fadeK = 0;
        function partB() {
          over = true;
          const stopFade = ctx.loop((dt) => {
            fadeK = Math.min(1, fadeK + dt * 1.5);
            fade.setAttribute('opacity', fadeK.toFixed(2));
            if (fadeK >= 1) {
              stopFade();
              stopA();
              barsEl.remove(); player.remove(); freeLayer.remove();
              bg.innerHTML = outsideScene();
              showOutside();
            }
          });
        }

        function showOutside() {
          const cageEl = ctx.add('cage', A.cage({ door: true }));
          HS.setPos(cageEl, 380, 300, 0, 1.05);
          const bird = ctx.add('bird', A.bird({ brow: true }));
          HS.setPos(bird, 380, 300 - 84 * 1.05, 0, 0.95);
          const treeBirds = ctx.add('treebirds', TREE_SPOTS.slice(1).map(([bx, by], i) => A.place(A.bird({ color: '#8f8676' }), { x: bx, y: by, s: 0.9, flip: i % 2 === 0 })).join(''));
          ctx.add('kid', A.kid({ x: 540, y: 545, s: 1.15, jacket: C.rouge, hair: 'girl', arms: { l: [[-18, -66], [-12, -50]], r: [[22, -86], [30, -104]] } }));
          const warm = ctx.add('warm', `<rect width="1000" height="625" fill="#f6dfa0"/>`, { opacity: '0', 'pointer-events': 'none' });
          ctx.svg.appendChild(fade.parentNode);
          let k = 1;
          const stopIn = ctx.loop((dt) => { k = Math.max(0, k - dt * 1.4); fade.setAttribute('opacity', k.toFixed(2)); if (k <= 0) stopIn(); });

          let flown = null;
          function release() {
            flown = new Promise((res) => {
              const door = cageEl.querySelector('.cage-door');
              let f = 0, phase = 0, pause = 0;
              const start = { x: 380, y: 300 - 84 * 1.05 }, doorPos = { x: 380, y: 300 - 40 }, dest = { x: TREE_SPOTS[0][0], y: TREE_SPOTS[0][1] };
              const stop = ctx.loop((dt) => {
                if (phase === 0) {
                  f = Math.min(1, f + dt * 1.6);
                  if (door) door.setAttribute('transform', `translate(-12 0) rotate(${(-f * 100).toFixed(1)} 0 -46) translate(12 0)`);
                  if (f >= 1) { phase = 1; f = 0; Sound.soft(); }
                } else if (phase === 1) {
                  f = Math.min(1, f + dt * 1.2);
                  HS.setPos(bird, HS.lerp(start.x, doorPos.x, f), HS.lerp(start.y, doorPos.y, f) - Math.sin(f * Math.PI) * 14, 0, 0.95);
                  if (f >= 1) { phase = 2; pause = 0.9; }
                } else if (phase === 2) {
                  pause -= dt;
                  if (pause <= 0) { phase = 3; f = 0; bird.innerHTML = A.bird({ brow: true, fly: true }); Sound.chirp(3, 3000); }
                } else if (phase === 3) {
                  f = Math.min(1, f + dt * 0.55);
                  const bx = HS.lerp(doorPos.x, dest.x, f), by = HS.lerp(doorPos.y, dest.y, f) - Math.sin(f * Math.PI) * 180;
                  HS.setPos(bird, bx, by, -10, 0.95);
                  warm.setAttribute('opacity', (f * 0.18).toFixed(2));
                  if (f >= 1) {
                    phase = 4;
                    bird.innerHTML = A.bird({ brow: true });
                    HS.setPos(bird, dest.x, dest.y, 0, 0.9);
                    Sound.song();
                    stop();
                    res();
                  }
                }
              });
            });
          }

          ctx.after(900, () => {
            ctx.dialogue({
              prompt: t('cage.outside'),
              options: [
                { value: 1, label: t('cage.opt1'), reply: t('cage.res1') },
                { value: 2, label: t('cage.opt2'), reply: t('cage.res2') },
                { value: 3, label: t('cage.opt3'), reply: t('cage.res3'), correct: true },
              ],
              onRight: release,
              onWrong: () => Sound.soft(),
            }).then(async () => {
              if (flown) await flown;
              treeBirds.setAttribute('opacity', '1');
              await ctx.wait(800);
              resolve({ seals: 3 });
            });
          });
        }
      });
    },
  });
})();
