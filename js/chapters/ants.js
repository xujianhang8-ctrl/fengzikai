/* 护生之约 · 第一页 · 扫地 (Sweeping Gently)
 * Sweep the willow leaves off the courtyard path without disturbing
 * the line of ants carrying rice home before the rain. */
(function () {
  'use strict';
  const A = Art, C = Art.C;
  const TRAIL = [[70, 420], [210, 386], [380, 440], [560, 394], [730, 446], [880, 420]];
  const LEAF_COLORS = ['#c9a45f', '#b8b35a', '#a8743f', '#c79a55', '#9fae5c'];

  function courtyard(o = {}) {
    let s = `<rect width="1000" height="625" fill="#f4eee1"/>`;
    // whitewashed wall with a moon gate
    s += `<rect x="-10" y="84" width="1020" height="176" fill="#f8f4ec"/>`;
    s += `<circle cx="240" cy="178" r="96" fill="#dfe6d8"/>`;
    A.seed(12);
    for (let i = 0; i < 7; i++) {
      const x = 170 + i * 22 + A.rnd(-4, 4);
      s += A.line([[x, 270], [x + A.rnd(-6, 6), 120]], 2, { color: C.leaf, op: 0.7 });
      s += A.stroke([[x, 150 + i * 9], [x + 16, 142 + i * 9], [x + 26, 146 + i * 9]], 3, { color: C.leaf, op: 0.75, head: 0.8 });
    }
    s += `<circle cx="240" cy="178" r="96" fill="none" stroke="${C.ink}" stroke-width="3"/><circle cx="240" cy="178" r="104" fill="none" stroke="${C.ink}" stroke-width="1.2" stroke-opacity=".5"/>`;
    s += A.wallTop(-20, 1020, 70, 8);
    s += A.line([[-10, 260], [1010, 262]], 1.6, { op: 0.6 });
    // ground and flagstone path
    s += A.shape('M-20 266L1020 266 1020 640-20 640Z', C.ochre, 0.16, { filter: 'hs-wash' });
    A.seed(21);
    [[342, 420], [424, 502]].forEach(([y0, y1], row) => {
      let x = row ? -60 : -20;
      while (x < 1020) {
        const w = A.rnd(100, 160);
        const pts = [[x + 8, y0 + A.rnd(0, 7)], [x + w * 0.5, y0 + A.rnd(-3, 4)], [x + w - 8, y0 + A.rnd(0, 7)], [x + w - 2, (y0 + y1) / 2 + A.rnd(-4, 4)], [x + w - 8, y1 - A.rnd(0, 7)], [x + w * 0.5, y1 + A.rnd(-3, 3)], [x + 8, y1 - A.rnd(0, 7)], [x + 2, (y0 + y1) / 2 + A.rnd(-4, 4)]];
        s += `<path d="${A.smoothD(pts, true)}" fill="#d9d2c3" fill-opacity=".55" stroke="${C.ink}" stroke-width="1.1" stroke-opacity=".45"/>`;
        x += w + A.rnd(6, 12);
      }
    });
    // the ants' nest and the rice they are carrying
    s += A.blob(885, 424, 30, 12, C.brown, 0.35, { filter: false }) + `<ellipse cx="886" cy="422" rx="7" ry="4" fill="${C.ink}"/>`;
    s += `<path d="M52 422C50 410 66 404 78 410 88 414 86 428 74 430 62 432 54 430 52 422Z" fill="#fbf6e6" stroke="${C.ink2}" stroke-width="1.2"/>`;
    s += A.grass(30, 560, 1.2, 2) + A.grass(640, 590, 1, 3) + A.grass(960, 560, 1.2, 4) + A.flower(90, 300, 1, C.rouge) + A.flower(120, 306, 0.8, C.yellow);
    if (!o.noWillow) s += A.willow(890, 330, 0.95, 11, { long: 230 });
    return s;
  }

  function painting() {
    let s = courtyard();
    A.seed(3);
    const S = A.spline(TRAIL, 10);
    for (let i = 8; i < S.length - 4; i += 7) {
      const a = Math.atan2(S[i + 1][1] - S[i][1], S[i + 1][0] - S[i][0]) * 180 / Math.PI;
      s += A.place(A.ant(i % 2 === 0), { x: S[i][0], y: S[i][1], r: a, s: 1.2 });
    }
    s += A.kid({ x: 470, y: 560, s: 1.05, legs: 'crouch', jacket: C.indigo, hair: 'girl', arms: { l: [[-14, -60], [4, -44]], r: [[18, -60], [12, -44]] } });
    s += A.place(A.broom(), { x: 620, y: 300, s: 0.7, r: 12 });
    s += A.swallow(520, 40, 0.9, -8) + A.swallow(600, 28, 0.7, 6);
    return s;
  }

  function pov() {
    let s = `<rect width="1000" height="420" fill="#f1ebdd"/>`;
    s += A.blob(500, 380, 560, 70, C.ochre, 0.25);
    A.seed(9);
    for (let i = 0; i < 24; i++) {
      const x = 170 + i * 28 + A.rnd(-6, 6), top = A.rnd(-40, 30), bottom = 150 + A.rnd(0, 120);
      s += A.stroke([[x, top], [x + A.rnd(-10, 10), bottom * 0.6], [x + A.rnd(-30, 30), bottom]], A.rnd(6, 12), { color: i % 3 ? '#8f7442' : C.ink, op: 0.8, head: 1, tail: 0.2 });
    }
    s += `<path d="M150-10L850-10 820 60 180 60Z" fill="${C.bamboo}" fill-opacity=".35"/>`;
    for (let i = 0; i < 9; i++) s += A.grass(60 + i * 110 + A.rnd(-20, 20), 400, 3, i + 2);
    s += A.place(A.ant(true), { x: 520, y: 368, s: 3.2, r: -4 });
    return s;
  }

  HS.chapter({
    id: 'ants', key: 'ants', no: 1,
    painting, pov,
    play(ctx) {
      return new Promise((resolve) => {
        const t = ctx.t;
        ctx.add('bg', courtyard());
        const leafLayer = ctx.layer('leaves');
        const antLayer = ctx.layer('ants');
        const dim = ctx.add('sky', `<rect width="1000" height="625" fill="#5d6a78" opacity="0"/>`).firstChild;
        const rain = ctx.add('rain', A.rainDrops(1000, 625, 90, 4), { opacity: '0' });
        const broom = ctx.add('tool', A.broom(), { opacity: '0', 'pointer-events': 'none' });

        // trail geometry
        const S = A.spline(TRAIL, 16);
        const cum = [0];
        for (let i = 1; i < S.length; i++) cum.push(cum[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
        const L = cum[cum.length - 1];
        function at(s) {
          s = HS.clamp(s, 0, L);
          let i = 1;
          while (i < cum.length - 1 && cum[i] < s) i++;
          const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
          const x = HS.lerp(S[i - 1][0], S[i][0], f), y = HS.lerp(S[i - 1][1], S[i][1], f);
          const ang = Math.atan2(S[i][1] - S[i - 1][1], S[i][0] - S[i - 1][0]);
          return { x, y, ang };
        }

        // ants: most carry rice to the nest, a few walk back for more
        const ants = [];
        const nOut = ctx.easy ? 8 : 10, nBack = ctx.easy ? 3 : 4;
        for (let i = 0; i < nOut + nBack; i++) {
          const back = i >= nOut;
          const el = HS.sprite(antLayer, A.ant(!back));
          ants.push({
            el, back, crumb: el.querySelector('.crumb'),
            s: back ? ((i - nOut) + 0.5) * (L / nBack) : i * (L / nOut),
            speed: (back ? 34 : 26) * (0.9 + Math.random() * 0.25),
            off: back ? 12 : 0, scare: 0, cool: 0, phase: Math.random() * 6,
          });
        }

        // leaves on the path, several close to the ants
        const leaves = [];
        const total = ctx.easy ? 10 : 14;
        let tries = 0;
        while (leaves.length < total && tries++ < 500) {
          const nearTrail = leaves.length < total * 0.45;
          let x, y;
          if (nearTrail) {
            const p = at(Math.random() * L * 0.9 + L * 0.05);
            const side = Math.random() < 0.5 ? -1 : 1;
            const d = 26 + Math.random() * 20;
            x = p.x - Math.sin(p.ang) * d * side;
            y = p.y + Math.cos(p.ang) * d * side;
          } else {
            x = 60 + Math.random() * 880;
            y = 335 + Math.random() * 175;
          }
          if (leaves.some((l) => HS.dist(l.x, l.y, x, y) < 48)) continue;
          if (x > 840 && y < 450) continue;
          const r = Math.random() * 360;
          const el = HS.sprite(leafLayer, A.leafShape(LEAF_COLORS[leaves.length % LEAF_COLORS.length]), { class: 'hit' });
          HS.setPos(el, x, y, r, 1.25);
          leaves.push({ el, x, y, r, gone: false, vx: 0, vy: 0, life: 0 });
        }

        let swept = 0, startled = 0, rainOn = false, finished = false;
        const stat = () => ctx.stat(t('ants.stat', { a: swept, b: total, c: startled }));
        stat();

        function removeLeaf(l, vx, vy, gentle) {
          if (l.gone) return;
          l.gone = true;
          l.vx = vx; l.vy = vy; l.life = gentle ? 0.9 : 0.55; l.gentle = gentle;
          swept++;
          if (gentle) Sound.soft(); else Sound.swish();
          stat();
          if (!rainOn && swept >= Math.ceil(total / 2)) {
            rainOn = true;
            ctx.say(t('ants.rain'), 4200);
          }
          if (swept === total) finish();
        }

        function startle(a) {
          if (a.cool > 0) return;
          a.scare = 1.1; a.cool = 1.4;
          startled++;
          stat();
          Sound.oops();
          const p = at(a.s);
          ctx.float(p.x, p.y - 18, '!', C.seal, 34);
          if (startled === 1 || startled % 4 === 0) ctx.say(t('ants.oops'), 2600);
          if (a.crumb && !a.back && a.crumb.style.display !== 'none') {
            a.crumb.style.display = 'none';
            const c = ctx.add('fx', `<circle cx="${p.x.toFixed(0)}" cy="${(p.y + 3).toFixed(0)}" r="3" fill="#fbf6e6" stroke="#b8a079" stroke-width=".7"/>`);
            ctx.after(2500, () => c.remove());
          }
        }

        // pointer: drag to sweep, tap to pick up a leaf gently
        const svg = ctx.svg;
        let down = null, last = null, dragging = false;
        const R_LEAF = 40, R_ANT = 24;
        function showBroom(p, tilt) {
          broom.setAttribute('opacity', '1');
          HS.setPos(broom, p.x, p.y + 8, tilt || 0, 0.78);
        }
        function sweepAlong(p0, p1) {
          const dx = p1.x - p0.x, dy = p1.y - p0.y, d = Math.hypot(dx, dy);
          const steps = Math.max(1, Math.ceil(d / 8));
          const ux = d ? dx / d : 0, uy = d ? dy / d : 0;
          for (let k = 1; k <= steps; k++) {
            const qx = p0.x + (dx * k) / steps, qy = p0.y + (dy * k) / steps;
            for (const l of leaves) {
              if (l.gone) continue;
              const ex = (l.x - qx) / R_LEAF, ey = (l.y - qy) / (R_LEAF * 0.6);
              if (ex * ex + ey * ey < 1) removeLeaf(l, ux * 520 + (Math.random() - 0.5) * 80, uy * 520 - 60, false);
            }
            for (const a of ants) {
              const p = at(a.s);
              const ax = p.x - Math.sin(p.ang) * a.off, ay = p.y + Math.cos(p.ang) * a.off;
              if (HS.dist(ax, ay, qx, qy) < R_ANT) startle(a);
            }
          }
        }
        ctx.on(svg, 'pointerdown', (e) => {
          if (finished) return;
          e.preventDefault();
          try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          const p = ctx.point(e);
          down = { x: p.x, y: p.y, time: performance.now() };
          last = p;
          dragging = false;
          showBroom(p, 0);
        });
        ctx.on(svg, 'pointermove', (e) => {
          const p = ctx.point(e);
          if (!down) { if (e.pointerType === 'mouse' && !finished) showBroom(p, 0); return; }
          if (!dragging && HS.dist(p.x, p.y, down.x, down.y) > 7) { dragging = true; svg.classList.add('is-dragging'); }
          if (dragging && !finished) {
            sweepAlong(last, p);
            showBroom(p, HS.clamp((p.x - last.x) * 1.5, -22, 22));
          }
          last = p;
        });
        const up = (e) => {
          if (!down) return;
          const p = ctx.point(e);
          if (!dragging && !finished) {
            const leaf = leaves.filter((l) => !l.gone).sort((a, b) => HS.dist(a.x, a.y, p.x, p.y) - HS.dist(b.x, b.y, p.x, p.y))[0];
            if (leaf && HS.dist(leaf.x, leaf.y, p.x, p.y) < 30 * ctx.reach) {
              removeLeaf(leaf, 0, -160, true);
            } else {
              const ant = ants.find((a) => { const q = at(a.s); return HS.dist(q.x, q.y, p.x, p.y) < 18; });
              if (ant) { ctx.say(t('ants.poke'), 2400); Sound.soft(); }
            }
          }
          down = null;
          dragging = false;
          svg.classList.remove('is-dragging');
          if (e.pointerType !== 'mouse') broom.setAttribute('opacity', '0');
        };
        ctx.on(svg, 'pointerup', up);
        ctx.on(svg, 'pointercancel', up);
        ctx.on(svg, 'pointerleave', (e) => { if (e.pointerType === 'mouse' && !down) broom.setAttribute('opacity', '0'); });

        let dimLevel = 0, rainLevel = 0, homeTimer = 0;
        const stop = ctx.loop((dt, now) => {
          // ants walk the trail
          for (const a of ants) {
            let v = a.speed * ctx.speed * (rainOn ? 1.35 : 1) * (a.scare > 0 ? 2.6 : 1);
            a.cool = Math.max(0, a.cool - dt);
            a.scare = Math.max(0, a.scare - dt);
            a.s += (a.back ? -v : v) * dt;
            if (!finished) {
              if (!a.back && a.s > L) { a.s -= L; if (a.crumb) a.crumb.style.display = ''; }
              if (a.back && a.s < 0) a.s += L;
            }
            const p = at(a.s);
            const jit = a.scare > 0 ? (Math.random() - 0.5) * 4 : 0;
            const wob = Math.sin(now * 9 + a.phase) * 5;
            const x = p.x - Math.sin(p.ang) * a.off + jit, y = p.y + Math.cos(p.ang) * a.off + jit;
            HS.setPos(a.el, x, y, (p.ang * 180) / Math.PI + (a.back ? 180 : 0) + wob, 1.25);
            const edge = Math.min(a.s, L - a.s);
            a.el.setAttribute('opacity', finished && (a.s >= L || a.s <= 0) ? '0' : HS.clamp(edge / 18, 0, 1).toFixed(2));
          }
          // leaves in flight
          for (const l of leaves) {
            if (!l.gone || l.life <= 0) continue;
            l.life -= dt;
            if (l.gentle) { l.y += l.vy * dt; l.r += 90 * dt; }
            else { l.x += l.vx * dt; l.y += l.vy * dt; l.vy += 500 * dt; l.r += 540 * dt; }
            HS.setPos(l.el, l.x, l.y, l.r, 1.25);
            l.el.setAttribute('opacity', HS.clamp(l.life / 0.5, 0, 1).toFixed(2));
            if (l.life <= 0) l.el.remove();
          }
          // rain clouds gather after half the leaves are gone
          if (rainOn) {
            dimLevel = Math.min(0.14, dimLevel + dt * 0.05);
            dim.setAttribute('opacity', dimLevel.toFixed(3));
          }
          if (finished) {
            rainLevel = Math.min(1, rainLevel + dt * 0.8);
            rain.setAttribute('opacity', rainLevel.toFixed(2));
            rain.setAttribute('transform', `translate(${(-(now * 40) % 30).toFixed(1)} ${((now * 260) % 60).toFixed(1)})`);
            homeTimer += dt;
            if (homeTimer > 3.2 && !resolved) done();
          }
        });

        let resolved = false;
        function finish() {
          finished = true;
          broom.setAttribute('opacity', '0');
          // every ant heads for the nest before the rain
          ants.forEach((a) => { a.back = false; a.off = 0; a.speed = 70 + Math.random() * 30; });
        }
        function done() {
          resolved = true;
          ctx.say(t('ants.win'), 4000);
          Sound.win();
          ctx.after(1600, () => {
            stop();
            resolve({ seals: startled <= 1 ? 3 : startled <= 4 ? 2 : 1 });
          });
        }
      });
    },
  });
})();
