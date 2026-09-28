/* 护生之约 · 第二页 · 清池 (A Clear Pond)
 * Scoop the rubbish out of the pond without frightening the fish,
 * and free the fish caught in an old fishing line. */
(function () {
  'use strict';
  const A = Art, C = Art.C;
  const POND = { cx: 500, cy: 345, rx: 440, ry: 205 };
  const BASKET = { x: 905, y: 588 };
  const FISH_COLORS = ['#8f9c8a', '#8f9c8a', '#d9765a', '#9aa493', '#e0a24e', '#8f9c8a'];

  const TRASH = {
    bottle: () => `<g transform="rotate(72)"><path d="M-7-14L-7 18Q-7 22-3 22L3 22Q7 22 7 18L7-14Q7-18 4-21L4-26-4-26-4-21Q-7-18-7-14Z" fill="#e3ecef" fill-opacity=".9" stroke="${C.ink}" stroke-width="1.3"/><rect x="-4.5" y="-31" width="9" height="5" fill="#5d8fb8" stroke="${C.ink}" stroke-width=".8"/><rect x="-7" y="-4" width="14" height="9" fill="#d86a5c" fill-opacity=".8"/></g>`,
    bag: () => `<path d="M-21-2C-23 11-12 21 0 21 12 21 23 11 21-2L16-16 9-16 9-6-9-6-9-16-16-16Z" fill="#f7f7f3" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.2" stroke-linejoin="round"/><path d="M-12 4C-8 8-4 6 0 10M6 2C9 6 12 6 14 10" stroke="${C.ink}" stroke-width=".8" fill="none" stroke-opacity=".5"/>`,
    can: () => `<g transform="rotate(-20)"><rect x="-9" y="-15" width="18" height="30" rx="2" fill="#c85a4e" fill-opacity=".9" stroke="${C.ink}" stroke-width="1.2"/><ellipse cx="0" cy="-15" rx="9" ry="3" fill="#d9d4cc" stroke="${C.ink}" stroke-width="1"/><path d="M-9-2L9-2" stroke="#fff" stroke-width="3" stroke-opacity=".7"/></g>`,
    wrapper: () => `<path d="M-17-9L17-9 20-6 17-3 20 0 17 3 20 6 17 9-17 9-20 6-17 3-20 0-17-3-20-6Z" fill="#e8c35a" fill-opacity=".92" stroke="${C.ink}" stroke-width="1.1" stroke-linejoin="round"/><path d="M-10-9L-10 9M10-9L10 9" stroke="#c0503f" stroke-width="3" stroke-opacity=".7"/>`,
    box: () => `<path d="M-20-8L10-14 22-4-8 4Z" fill="#fbfbf7" stroke="${C.ink}" stroke-width="1.1" stroke-linejoin="round"/><path d="M-20-8L-20 2-8 14-8 4ZM-8 4L22-4 22 6-8 14Z" fill="#ecebe4" stroke="${C.ink}" stroke-width="1.1" stroke-linejoin="round"/>`,
  };
  const TRASH_KINDS = ['bag', 'bottle', 'can', 'wrapper', 'box'];

  function pondShape() {
    return 'M60 330C50 220 160 150 300 140 420 132 560 150 690 140 830 130 950 190 950 300 955 420 900 520 760 545 620 570 450 560 300 552 150 545 70 460 60 330Z';
  }

  function lotusLeaf(x, y, rx, ry, r = 0) {
    const a = 0.2;
    const d = `M0 0L${(rx * Math.cos(-a)).toFixed(1)} ${(ry * Math.sin(-a)).toFixed(1)}A${rx} ${ry} 0 1 0 ${(rx * Math.cos(a)).toFixed(1)} ${(ry * Math.sin(a)).toFixed(1)}Z`;
    let s = `<path d="${d}" fill="#7fa36a" fill-opacity=".62" stroke="${C.ink}" stroke-width="1.2"/>`;
    for (let i = 1; i < 8; i++) {
      const ang = a + (i / 8) * (Math.PI * 2 - 2 * a);
      s += `<path d="M0 0L${(rx * 0.85 * Math.cos(ang)).toFixed(1)} ${(ry * 0.85 * Math.sin(ang)).toFixed(1)}" stroke="${C.ink}" stroke-width=".7" stroke-opacity=".4"/>`;
    }
    return A.place(s, { x, y, r });
  }

  function lotusBud(x, y, s = 1) {
    return A.place(A.stroke([[0, 0], [2, -30], [0, -62]], 3.4, { color: C.leaf, head: 1, tail: 0.8 }) +
      `<path d="M0-94C12-82 13-66 0-60-13-66-12-82 0-94Z" fill="#e8a5a0" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.2"/><path d="M0-92C4-80 4-70 0-61" stroke="${C.ink}" stroke-width=".8" fill="none" stroke-opacity=".6"/>`, { x, y, s });
  }

  function reeds(x, y, s = 1, sd = 1) {
    A.seed(sd);
    let r = '';
    for (let i = 0; i < 6; i++) {
      const dx = A.rnd(-18, 18), h = A.rnd(90, 150), lean = A.rnd(-20, 20);
      r += A.stroke([[dx, 0], [dx + lean * 0.4, -h * 0.5], [dx + lean, -h]], 2.6, { color: '#6d7f4c', head: 1, tail: 0.1 });
      if (i % 2) r += `<ellipse cx="${(dx + lean).toFixed(0)}" cy="${(-h - 8).toFixed(0)}" rx="3.2" ry="10" fill="${C.brown}" transform="rotate(${lean.toFixed(0)} ${(dx + lean).toFixed(0)} ${(-h - 8).toFixed(0)})"/>`;
    }
    return A.place(r, { x, y, s });
  }

  function basket() {
    let b = `<path d="M-40-22L40-22 32 12-32 12Z" fill="#b89b62" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
    for (let i = -3; i <= 3; i++) b += `<path d="M${i * 11}-22L${i * 9} 12" stroke="${C.ink}" stroke-width=".8" stroke-opacity=".5"/>`;
    b += `<path d="M-38-12L38-12M-35 0L35 0" stroke="${C.ink}" stroke-width=".8" stroke-opacity=".5"/><ellipse cx="0" cy="-22" rx="40" ry="6" fill="#8d6b46" fill-opacity=".6" stroke="${C.ink}" stroke-width="1.4"/>`;
    return b;
  }

  function banks() {
    let s = `<rect width="1000" height="625" fill="#f2ecdf"/>`;
    s += A.blob(500, 600, 560, 70, C.ochre, 0.22) + A.blob(40, 330, 60, 240, C.green, 0.18) + A.blob(970, 330, 50, 220, C.green, 0.16);
    return s;
  }

  function staticTop() {
    let s = lotusLeaf(165, 245, 58, 26, -8) + lotusLeaf(305, 470, 64, 28, 10) + lotusLeaf(790, 215, 56, 24, 4) + lotusLeaf(835, 455, 62, 27, -6);
    s += lotusBud(185, 250, 1) + lotusBud(820, 460, 0.8);
    s += reeds(70, 560, 1.1, 3) + reeds(960, 420, 0.9, 5);
    s += A.place(basket(), { x: BASKET.x, y: BASKET.y });
    s += A.willowFringe(0, 1000, 0, 5, { count: 11, min: 50, max: 150 });
    return s;
  }

  function tangle() {
    A.seed(61);
    const pts = [];
    for (let i = 0; i < 12; i++) pts.push([A.rnd(-28, 28), A.rnd(-14, 14)]);
    return `<g class="tangle">${A.line(pts, 1, { color: '#6c6660', op: 0.9 })}${A.line([[-24, 4], [-60, 18], [-100, 10], [-130, 26]], 1, { color: '#6c6660', op: 0.7 })}</g>`;
  }

  function painting() {
    let s = banks();
    s += `<path d="${pondShape()}" fill="#98c6c4" fill-opacity=".5" stroke="${C.ink}" stroke-width="1.6" stroke-opacity=".5"/>`;
    s += A.rainDrops(1000, 625, 60, 11);
    A.seed(4);
    [[420, 300], [600, 380], [520, 250]].forEach(([x, y]) => {
      s += `<ellipse cx="${x}" cy="${y}" rx="26" ry="8" fill="none" stroke="${C.ink}" stroke-opacity=".35"/><ellipse cx="${x}" cy="${y}" rx="44" ry="13" fill="none" stroke="${C.ink}" stroke-opacity=".18"/>`;
    });
    s += A.place(A.fish('#d9765a'), { x: 440, y: 330, r: -20, s: 1.2 }) + A.place(A.fish('#8f9c8a'), { x: 600, y: 400, r: 170, s: 1.1 }) + A.place(A.fish('#8f9c8a'), { x: 530, y: 272, r: 20, s: 1 });
    s += staticTop();
    s += A.place(A.dragonfly(), { x: 185, y: 150, s: 1, r: 20 });
    s += A.swallow(600, 120, 1.1, -24) + A.swallow(700, 150, 0.9, -30);
    return s;
  }

  function pov() {
    let s = `<rect width="1000" height="420" fill="#cfe1dd"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="M${150 + i * 140} 0L${110 + i * 150} 420L${170 + i * 150} 420Z" fill="#fff" fill-opacity=".18"/>`;
    s += `<path d="M300 30C260 60 280 150 360 170 450 195 560 160 640 175 720 190 760 120 720 60 690 20 600 40 520 30 440 20 350 10 300 30Z" fill="#3a3f45" fill-opacity=".72"/>`;
    s += `<path d="M430 170L440 230M560 165L555 225" stroke="#3a3f45" stroke-opacity=".6" stroke-width="3"/>`;
    s += A.place(A.fish('#d9765a'), { x: 520, y: 330, s: 1.6, r: -8 });
    s += A.blob(500, 440, 520, 50, '#7a8c6c', 0.4);
    return s;
  }

  HS.chapter({
    id: 'pond', key: 'pond', no: 2,
    painting, pov,
    play(ctx) {
      return new Promise((resolve) => {
        const t = ctx.t;
        ctx.add('bg', banks());
        const water = ctx.add('water', `<path d="${pondShape()}" fill="#9aa37f" fill-opacity=".55" stroke="${C.ink}" stroke-width="1.6" stroke-opacity=".5"/>`).firstChild;
        const fishLayer = ctx.layer('fish');
        ctx.add('top', staticTop());
        const trashLayer = ctx.layer('trash');
        const fxLayer = ctx.layer('fx');

        const inside = (x, y, m = 0.86) => ((x - POND.cx) / POND.rx) ** 2 + ((y - POND.cy) / POND.ry) ** 2 < m * m;

        // fish
        const fishes = [];
        const nFish = 6;
        for (let i = 0; i < nFish; i++) {
          const tangled = i === 2;
          const el = HS.sprite(fishLayer, A.fish(FISH_COLORS[i]) + (tangled ? tangle() : ''));
          const a = Math.random() * Math.PI * 2, rr = Math.random() * 0.6;
          fishes.push({
            el, tangled, x: POND.cx + Math.cos(a) * POND.rx * rr, y: POND.cy + Math.sin(a) * POND.ry * rr,
            th: Math.random() * Math.PI * 2, v: 40 + Math.random() * 25, turn: 0, scare: 0, s: tangled ? 1.15 : 0.85 + Math.random() * 0.35,
          });
        }

        // rubbish drifts in from upstream
        const total = ctx.easy ? 8 : 10;
        const trash = [];
        let spawned = 0;
        function spawnTrash(initial) {
          if (spawned >= total) return;
          const kind = TRASH_KINDS[spawned % TRASH_KINDS.length];
          const el = HS.sprite(trashLayer, TRASH[kind](), { class: 'hit' });
          let x, y;
          if (initial) {
            do { x = 180 + Math.random() * 640; y = 200 + Math.random() * 260; } while (!inside(x, y, 0.8) || trash.some((q) => HS.dist(q.x, q.y, x, y) < 90));
          } else { x = 70; y = 250 + Math.random() * 200; }
          trash.push({ el, x, y, vx: 9 + Math.random() * 9, ph: Math.random() * 6, rot: Math.random() * 40 - 20, state: 'float', f: 0, sx: 0, sy: 0 });
          spawned++;
        }
        for (let i = 0; i < 5; i++) spawnTrash(true);
        let spawnClock = 0;

        let collected = 0, freed = 0, startled = 0, done = false, hintClock = 0;
        const stat = () => ctx.stat(t('pond.stat', { a: collected, b: total, c: freed, d: startled }));
        stat();

        const netMarkup = `<ellipse cx="0" cy="0" rx="30" ry="18" fill="#f5f1e6" fill-opacity=".25" stroke="${C.ink}" stroke-width="2"/><path d="M-26-8L26 8M-26 8L26-8M-14-16L-14 16M0-18L0 18M14-16L14 16" stroke="${C.ink}" stroke-width=".7" stroke-opacity=".6"/><path d="M26-6L90-70" stroke="${C.brown}" stroke-width="4" stroke-linecap="round"/>`;
        function netAt(x, y) {
          const n = HS.sprite(fxLayer, netMarkup);
          HS.setPos(n, x, y);
          if (n.animate && !HS.reducedMotion()) {
            n.animate([{ opacity: 1, transform: `translate(${x}px, ${y}px) scale(.7) rotate(-10deg)` }, { opacity: 0, transform: `translate(${x}px, ${y - 20}px) scale(1.1) rotate(8deg)` }], { duration: 650, easing: 'ease-out' }).onfinish = () => n.remove();
          } else ctx.after(500, () => n.remove());
        }
        function ripple(x, y) {
          const r = HS.sprite(fxLayer, `<ellipse cx="0" cy="0" rx="18" ry="7" fill="none" stroke="${C.ink}" stroke-opacity=".5" stroke-width="1.4"/>`);
          HS.setPos(r, x, y);
          if (r.animate && !HS.reducedMotion()) r.animate([{ opacity: 1, transform: `translate(${x}px, ${y}px) scale(.5)` }, { opacity: 0, transform: `translate(${x}px, ${y}px) scale(2.6)` }], { duration: 800, easing: 'ease-out' }).onfinish = () => r.remove();
          else ctx.after(600, () => r.remove());
        }

        function checkWin() {
          if (done) return;
          if (collected >= total && freed >= 1) {
            done = true;
            ctx.say(t('pond.win'), 4200);
            Sound.win();
            ctx.after(2600, () => { stopLoop(); resolve({ seals: startled === 0 ? 3 : startled <= 2 ? 2 : 1 }); });
          } else if (collected >= total) {
            ctx.say(t('pond.tangledHint'), 4000);
          }
        }

        ctx.on(ctx.svg, 'pointerdown', (e) => {
          if (done) return;
          e.preventDefault();
          const p = ctx.point(e);
          const near = (o, r) => HS.dist(o.x, o.y, p.x, p.y) < r * ctx.reach;
          const tr = trash.filter((q) => q.state === 'float' && near(q, 38)).sort((a, b) => HS.dist(a.x, a.y, p.x, p.y) - HS.dist(b.x, b.y, p.x, p.y))[0];
          if (tr) {
            tr.state = 'fly'; tr.f = 0; tr.sx = tr.x; tr.sy = tr.y;
            netAt(tr.x, tr.y);
            Sound.plop();
            return;
          }
          const tf = fishes.find((f) => f.tangled && near(f, 44));
          if (tf) {
            tf.tangled = false;
            const tg = tf.el.querySelector('.tangle');
            if (tg) {
              if (tg.animate && !HS.reducedMotion()) tg.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(-30px, 10px)' }], { duration: 700 }).onfinish = () => tg.remove();
              else tg.remove();
            }
            freed = 1;
            tf.scare = 0.6;
            stat();
            Sound.good();
            ctx.say(t('pond.freed'), 3200);
            ctx.float(tf.x, tf.y - 30, '♡', C.seal, 30);
            checkWin();
            return;
          }
          const f = fishes.find((q) => near(q, 30));
          if (f) {
            f.scare = 0.9; f.th += Math.PI * (0.6 + Math.random() * 0.8);
            startled++;
            stat();
            Sound.splash();
            ctx.float(f.x, f.y - 24, '!', C.seal, 32);
            if (startled === 1 || startled % 3 === 0) ctx.say(t('pond.oops'), 2600);
            return;
          }
          if (inside(p.x, p.y, 1)) ripple(p.x, p.y);
        });

        let pointer = null;
        ctx.on(ctx.svg, 'pointermove', (e) => { pointer = ctx.point(e); });
        ctx.on(ctx.svg, 'pointerleave', () => { pointer = null; });

        const murky = [154, 163, 127], clear = [143, 196, 198];
        const stopLoop = ctx.loop((dt, now) => {
          // new rubbish every few seconds
          spawnClock += dt;
          if (spawnClock > 3.6 && spawned < total) { spawnClock = 0; spawnTrash(false); }
          if (!done && collected >= total && freed < 1) {
            hintClock += dt;
            if (hintClock > 6) { hintClock = 0; ctx.say(t('pond.tangledHint'), 3600); }
          }
          // fish
          for (const f of fishes) {
            f.turn += (Math.random() - 0.5) * 3 * dt;
            f.turn *= 0.96;
            f.th += f.turn * dt * 2;
            if (!inside(f.x, f.y, 0.78)) {
              const want = Math.atan2(POND.cy - f.y, POND.cx - f.x);
              let d = want - f.th;
              while (d > Math.PI) d -= Math.PI * 2;
              while (d < -Math.PI) d += Math.PI * 2;
              f.th += d * dt * 2.4;
            }
            if (pointer && !f.tangled && HS.dist(pointer.x, pointer.y, f.x, f.y) < 70) {
              const away = Math.atan2(f.y - pointer.y, f.x - pointer.x);
              let d = away - f.th;
              while (d > Math.PI) d -= Math.PI * 2;
              while (d < -Math.PI) d += Math.PI * 2;
              f.th += d * dt * 3;
            }
            f.scare = Math.max(0, f.scare - dt);
            const v = f.v * ctx.speed * (f.tangled ? 0.35 : 1) * (f.scare > 0 ? 3.2 : 1);
            f.x += Math.cos(f.th) * v * dt;
            f.y += Math.sin(f.th) * v * dt;
            const left = Math.cos(f.th) < 0;
            f.el.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${((f.th * 180) / Math.PI).toFixed(1)}) scale(${f.s} ${left ? -f.s : f.s})`);
          }
          // rubbish
          for (const q of trash) {
            if (q.state === 'float') {
              q.x += q.vx * dt * ctx.speed;
              q.y += Math.sin(now * 1.3 + q.ph) * 6 * dt;
              if (q.x > 940) { q.x = 70; q.y = 240 + Math.random() * 220; }
              HS.setPos(q.el, q.x, q.y + Math.sin(now * 2 + q.ph) * 2, q.rot + Math.sin(now + q.ph) * 6, 1.25);
            } else if (q.state === 'fly') {
              q.f = Math.min(1, q.f + dt * 1.6);
              const k = q.f;
              const x = HS.lerp(q.sx, BASKET.x, k), y = HS.lerp(q.sy, BASKET.y - 24, k) - Math.sin(k * Math.PI) * 140;
              HS.setPos(q.el, x, y, q.rot + k * 300, 1.25 * (1 - k * 0.5));
              if (q.f >= 1) {
                q.state = 'done';
                q.el.remove();
                collected++;
                stat();
                Sound.tap();
                checkWin();
              }
            }
          }
          // the water clears as the rubbish comes out
          const k = collected / total;
          const col = murky.map((m, i) => Math.round(HS.lerp(m, clear[i], k)));
          water.setAttribute('fill', `rgb(${col.join(',')})`);
        });
      });
    },
  });
})();
