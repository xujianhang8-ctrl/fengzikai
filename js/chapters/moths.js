/* 护生之约 · 第三页 · 纱灯 (The Gauze Lamp)
 * Guide the moths away from the flame, put a gauze shade over the lamp,
 * then blow the lamp out and let them fly to the moon. */
(function () {
  'use strict';
  const A = Art, C = Art.C;
  const WIN = { x: 230, y: 235, r: 150 };
  const LAMP = { x: 700, y: 430, s: 0.95 };
  const FLAME = { x: 701, y: 312 };
  const GAUZE_HOME = { x: 522, y: 424 };
  const GAUZE_ON = { x: LAMP.x, y: 340 };
  const GAUZE_S = 0.9;

  function room(o = {}) {
    let s = `<rect width="1000" height="625" fill="#ecebe3"/>`;
    s += `<rect width="1000" height="625" fill="#5b6b86" class="room-tint" fill-opacity="${o.dark ? 0.3 : 0.08}"/>`;
    // round window onto the night
    s += `<circle cx="${WIN.x}" cy="${WIN.y}" r="${WIN.r}" fill="#26324a"/>`;
    A.seed(7);
    for (let i = 0; i < 14; i++) {
      const a = A.rnd(0, 6.28), rr = A.rnd(20, WIN.r - 12);
      s += `<circle cx="${(WIN.x + Math.cos(a) * rr).toFixed(0)}" cy="${(WIN.y + Math.sin(a) * rr).toFixed(0)}" r="${A.rnd(0.8, 1.8).toFixed(1)}" fill="#f5efd6" fill-opacity=".8"/>`;
    }
    s += A.moon(WIN.x + 40, WIN.y - 60, 28, { glow: true, fill: '#f6ebbd' });
    s += A.place(A.willowFringe(-120, 120, 0, 13, { count: 5, min: 60, max: 180 }).replace(new RegExp(C.leaf, 'g'), '#4f6a57').replace(/#2a2521/g, '#17202e'), { x: WIN.x - 20, y: WIN.y - WIN.r + 6 });
    s += `<circle cx="${WIN.x}" cy="${WIN.y}" r="${WIN.r + 9}" fill="none" stroke="${C.brown}" stroke-width="14" stroke-opacity=".8"/><circle cx="${WIN.x}" cy="${WIN.y}" r="${WIN.r}" fill="none" stroke="${C.ink}" stroke-width="2.4"/>`;
    // floor, desk and things on it
    s += A.line([[0, 575], [1000, 580]], 1.4, { op: 0.45 });
    s += A.desk(470, 960, 430, 150);
    s += A.books(612, 430) + A.brushPot(890, 430) + A.paperStack(800, 430, 3);
    s += `<ellipse cx="160" cy="590" rx="80" ry="16" fill="${C.indigo}" fill-opacity=".35"/>`;
    s += A.place(A.cat({ pose: 'sleep' }), { x: 160, y: 584, s: 0.9 });
    return s;
  }

  function painting() {
    let s = room({ dark: true });
    s += `<path d="M150 150L520 560 760 560 300 120Z" fill="#fff6d6" fill-opacity=".22"/>`;
    s += A.place(A.lamp({ unlit: true }), { x: LAMP.x, y: LAMP.y, s: LAMP.s });
    s += A.place(A.gauze(), { x: LAMP.x, y: 340, s: 0.9 });
    [[300, 200, -30], [360, 260, -50], [260, 300, -20]].forEach(([x, y, r]) => { s += A.place(A.moth(), { x, y, r, s: 0.8 }); });
    s += A.kid({ x: 430, y: 578, s: 1.1, jacket: C.rouge, hair: 'boy', arms: { l: [[-18, -66], [-12, -50]], r: [[-4, -84], [-30, -104]] } });
    return s;
  }

  function pov() {
    let s = `<rect width="1000" height="420" fill="#2a3346"/>`;
    s += `<circle cx="600" cy="210" r="230" fill="url(#hs-glow)"/>`;
    for (let i = 1; i <= 4; i++) s += `<circle cx="600" cy="210" r="${i * 42}" fill="none" stroke="#f6d27a" stroke-opacity="${0.4 - i * 0.07}" stroke-width="2"/>`;
    s += `<path d="M600 150C630 175 630 225 600 240 570 225 570 175 600 150Z" fill="url(#hs-flame)"/>`;
    let d = 'M180 380';
    for (let i = 0; i < 40; i++) {
      const a = i * 0.45, r = 250 - i * 5.2;
      d += ` L${(600 + Math.cos(a) * r * 1.3).toFixed(0)} ${(210 + Math.sin(a) * r * 0.7).toFixed(0)}`;
    }
    s += `<path d="${d}" fill="none" stroke="#f5efd6" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="4 7"/>`;
    s += A.place(A.moth(), { x: 250, y: 330, s: 2.2, r: 40 });
    return s;
  }

  HS.chapter({
    id: 'moths', key: 'moth', no: 3,
    painting, pov,
    play(ctx) {
      return new Promise((resolve) => {
        const t = ctx.t;
        ctx.add('bg', room());
        const tint = ctx.svg.querySelector('.room-tint');
        const glow = ctx.add('glow', `<circle cx="${FLAME.x}" cy="${FLAME.y}" r="210" fill="url(#hs-glow)"/>`);
        const beam = ctx.add('beam', `<path d="M150 150L520 560 760 560 300 120Z" fill="#fff6d6" fill-opacity=".22"/>`, { opacity: '0' });
        const lamp = ctx.add('lamp', A.lamp());
        HS.setPos(lamp, LAMP.x, LAMP.y, 0, LAMP.s);
        const flame = lamp.querySelector('.flame');
        const mothLayer = ctx.layer('moths');
        const ghost = ctx.add('ghost', `<g class="blink-soft"><path d="M-30-86L-30 0C-30 7 30 7 30 0L30-86" fill="none" stroke="${C.seal}" stroke-width="2.4" stroke-dasharray="7 6"/><ellipse cx="0" cy="-86" rx="30" ry="7" fill="none" stroke="${C.seal}" stroke-width="2.4" stroke-dasharray="7 6"/></g>`, { opacity: '0', 'pointer-events': 'none' });
        HS.setPos(ghost, GAUZE_ON.x, GAUZE_ON.y, 0, GAUZE_S);
        // outer group holds the position; the inner group pulses (a CSS transform on the outer one would override its position)
        const gauze = ctx.add('gauze', `<g class="gauze-inner">${A.gauze()}</g>`, { opacity: '0', class: 'hit' });
        const gauzeInner = gauze.querySelector('.gauze-inner');

        const total = ctx.easy ? 9 : 12;
        const moths = [];
        let spawned = 0, saved = 0, burned = 0, spawnClock = 1.2, elapsed = 0;
        let gauzeState = 'hidden'; // hidden → offered → dragging → flying → on
        let lampOn = true, ended = false, cueClock = 0, asked = false, onClock = 0;
        let gx = GAUZE_HOME.x, gy = GAUZE_HOME.y;
        const stat = () => ctx.stat(t('moth.stat', { a: saved, b: burned }));
        stat();

        function spawn() {
          const a = Math.random() * Math.PI * 2, rr = Math.random() * (WIN.r - 40);
          const el = HS.sprite(mothLayer, A.moth(), { class: 'hit' });
          moths.push({ el, x: WIN.x + Math.cos(a) * rr, y: WIN.y + Math.sin(a) * rr, vx: 40, vy: 0, state: 'in', clock: 0, dir: Math.random() < 0.5 ? 1 : -1, ph: Math.random() * 6, speed: 60 + Math.random() * 30 });
          spawned++;
        }

        function guide(m) {
          if (m.state === 'out' || m.state === 'gone') return;
          m.state = 'out';
          m.tx = WIN.x + 30 + (Math.random() - 0.5) * 60;
          m.ty = WIN.y - 50 + (Math.random() - 0.5) * 60;
          Sound.soft();
          if (saved === 0) ctx.say(t('moth.saved'), 2400);
        }

        function offerGauze() {
          gauzeState = 'offered';
          gx = GAUZE_HOME.x; gy = GAUZE_HOME.y;
          HS.setPos(gauze, gx, gy, 0, GAUZE_S);
          gauze.setAttribute('opacity', '1');
          ghost.setAttribute('opacity', '1');
          gauzeInner.classList.add('pulse');
          ctx.say(t('moth.gauzeCue'), 5200);
          Sound.good();
        }

        /* Is a scene point on the gauze shade, as drawn right now? */
        function onGauze(p) {
          const pad = 22 * ctx.reach;
          return p.x > gx - 30 * GAUZE_S - pad && p.x < gx + 30 * GAUZE_S + pad && p.y > gy - 92 * GAUZE_S - pad && p.y < gy + 10 * GAUZE_S + pad;
        }

        function putGauzeOn() {
          gauzeState = 'on';
          onClock = 0;
          gx = GAUZE_ON.x; gy = GAUZE_ON.y;
          HS.setPos(gauze, gx, gy, 0, GAUZE_S);
          gauzeInner.classList.remove('pulse');
          ghost.setAttribute('opacity', '0');
          Sound.stamp();
          ctx.say(t('moth.gauzeOn'), 4200);
        }

        /* A tap (or Enter) glides the shade onto the lamp, for anyone who finds dragging hard. */
        function glideGauze() {
          gauzeState = 'flying';
          gauzeInner.classList.remove('pulse');
          const x0 = gx, y0 = gy;
          let k = 0;
          const stop = ctx.loop((dt) => {
            k = Math.min(1, k + dt * 2.2);
            const e = 1 - (1 - k) * (1 - k);
            HS.setPos(gauze, HS.lerp(x0, GAUZE_ON.x, e), HS.lerp(y0, GAUZE_ON.y, e) - Math.sin(k * Math.PI) * 60, 0, GAUZE_S);
            if (k >= 1) { stop(); putGauzeOn(); }
          });
        }

        function lampOut() {
          lampOn = false;
          Sound.blow();
          if (flame) {
            if (flame.animate && !HS.reducedMotion()) flame.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' });
            else flame.style.opacity = '0';
          }
          moths.forEach((m) => { if (m.state !== 'gone') { m.state = 'out'; m.tx = WIN.x + 40 + (Math.random() - 0.5) * 80; m.ty = WIN.y - 60 + (Math.random() - 0.5) * 60; } });
          ctx.after(3200, () => {
            ended = true;
            ctx.say(t('moth.win'), 4200);
            Sound.win();
            ctx.after(2200, () => { stopLoop(); resolve({ seals: burned === 0 ? 3 : burned <= 2 ? 2 : 1 }); });
          });
        }

        // pointer: tap moths; drag (or tap) the gauze shade onto the lamp; tap the flame to blow it out at the end
        let drag = null;
        ctx.on(ctx.svg, 'pointerdown', (e) => {
          if (ended) return;
          e.preventDefault();
          const p = ctx.point(e);
          if (gauzeState === 'offered' && onGauze(p)) {
            gauzeState = 'dragging';
            gauzeInner.classList.remove('pulse');
            drag = { dx: gx - p.x, dy: gy - p.y, x0: p.x, y0: p.y, moved: false };
            try { ctx.svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            ctx.svg.classList.add('is-dragging');
            Sound.tap();
            return;
          }
          const m = moths.filter((q) => q.state === 'in' || q.state === 'circle').sort((a, b) => HS.dist(a.x, a.y, p.x, p.y) - HS.dist(b.x, b.y, p.x, p.y))[0];
          if (m && HS.dist(m.x, m.y, p.x, p.y) < 44 * ctx.reach) { guide(m); return; }
          if (asked && lampOn && HS.dist(p.x, p.y, FLAME.x, FLAME.y) < 60) {
            ctx.overlay.querySelectorAll('.card').forEach((c) => c.remove());
            lampOut();
          }
        });
        ctx.on(ctx.svg, 'pointermove', (e) => {
          if (gauzeState !== 'dragging' || !drag) return;
          const p = ctx.point(e);
          if (HS.dist(p.x, p.y, drag.x0, drag.y0) > 8) drag.moved = true;
          gx = HS.clamp(p.x + drag.dx, 40, 960);
          gy = HS.clamp(p.y + drag.dy, 110, 600);
          HS.setPos(gauze, gx, gy, 0, GAUZE_S);
        });
        const drop = () => {
          if (gauzeState !== 'dragging') return;
          ctx.svg.classList.remove('is-dragging');
          const moved = drag && drag.moved;
          drag = null;
          if (!moved) { glideGauze(); return; }
          if (HS.dist(gx, gy, GAUZE_ON.x, GAUZE_ON.y) < 120) putGauzeOn();
          else {
            gauzeState = 'offered';
            gauzeInner.classList.add('pulse');
          }
        };
        ctx.on(ctx.svg, 'pointerup', drop);
        ctx.on(ctx.svg, 'pointercancel', drop);
        ctx.on(window, 'keydown', (e) => {
          if (gauzeState === 'offered' && (e.key === 'Enter' || e.key === ' ') && !/input|textarea|button/i.test(e.target.tagName)) { e.preventDefault(); glideGauze(); }
        });

        const stopLoop = ctx.loop((dt, now) => {
          elapsed += dt;
          spawnClock -= dt;
          const alive = moths.filter((m) => m.state !== 'gone').length;
          if (lampOn && !asked && spawned < total && spawnClock <= 0 && alive < 4) { spawn(); spawnClock = (ctx.easy ? 4.2 : 3.2) + Math.random(); }
          if (gauzeState === 'hidden' && (saved + burned >= 6 || elapsed > 28)) offerGauze();
          if (gauzeState === 'offered') {
            cueClock += dt;
            if (cueClock > 9) { cueClock = 0; ctx.say(t('moth.gauzeCue'), 4000); }
          }
          if (gauzeState === 'on') onClock += dt;
          if (gauzeState === 'on' && !asked && lampOn && onClock > 3.5) {
            asked = true;
            ctx.card({ body: [t('moth.moonAsk')], button: t('moth.blow') }).then(() => { if (lampOn) lampOut(); });
          }
          // lamp glow and room tint
          const g = lampOn ? 1 : Math.max(0, Number(glow.getAttribute('opacity') || 1) - dt);
          glow.setAttribute('opacity', g.toFixed(2));
          if (!lampOn) {
            tint.setAttribute('fill-opacity', Math.min(0.3, Number(tint.getAttribute('fill-opacity')) + dt * 0.15).toFixed(3));
            beam.setAttribute('opacity', Math.min(1, Number(beam.getAttribute('opacity')) + dt * 0.6).toFixed(2));
          }
          // moths
          for (const m of moths) {
            if (m.state === 'gone') continue;
            m.clock += dt;
            let ax = 0, ay = 0, sp = m.speed * ctx.speed;
            if (m.state === 'in' || m.state === 'circle') {
              const dx = FLAME.x - m.x, dy = FLAME.y - m.y, d = Math.hypot(dx, dy) || 1;
              const guard = gauzeState === 'on' ? 62 : 0;
              if (guard && d < guard + 26) m.state = 'circle';
              const pull = m.state === 'circle' ? (d - guard - 20) / 40 : 0.85;
              ax = (dx / d) * pull + (-dy / d) * 0.65 * m.dir;
              ay = (dy / d) * pull + (dx / d) * 0.65 * m.dir;
              if (!guard && d < 22 && lampOn) {
                burned++;
                stat();
                Sound.hot();
                ctx.float(m.x, m.y - 20, t('moth.hot'), C.seal, 26);
                m.state = 'dazed'; m.clock = 0; m.burned = true;
                m.vx = -m.vx * 0.5; m.vy = 40;
              }
            } else if (m.state === 'dazed') {
              ax = (Math.random() - 0.5) * 0.4; ay = 0.3;
              sp = 30;
              if (m.clock > 1.6) { m.state = 'out'; m.tx = WIN.x + 20; m.ty = WIN.y - 40; }
            } else if (m.state === 'out') {
              const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy) || 1;
              ax = dx / d; ay = dy / d;
              sp = 150;
              if (d < 24) {
                m.state = 'gone';
                if (lampOn && !m.burned) { saved++; stat(); }
                const el = m.el;
                if (el.animate && !HS.reducedMotion()) el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).onfinish = () => el.remove();
                else el.remove();
                continue;
              }
            }
            const flutter = Math.sin(now * 7 + m.ph) * 0.5;
            m.vx += ((ax + flutter * 0.4) * sp - m.vx) * Math.min(1, dt * 3);
            m.vy += ((ay + Math.cos(now * 6 + m.ph) * 0.4) * sp - m.vy) * Math.min(1, dt * 3);
            m.x += m.vx * dt; m.y += m.vy * dt;
            m.x = HS.clamp(m.x, 20, 980); m.y = HS.clamp(m.y, 20, 600);
            HS.setPos(m.el, m.x, m.y, (Math.atan2(m.vy, m.vx) * 180) / Math.PI + 90, 0.9);
          }
        });
      });
    },
  });
})();
