/* 护生之约 · art.js
 * A small brush-and-wash SVG drawing kit.
 * Every picture in the game is an original drawing made in the spirit of
 * Feng Zikai's style (a few ink strokes, faceless figures, pale colour
 * washes). None of them is a copy of one of his paintings.
 * All functions return SVG markup strings; scenes compose them. */
(function () {
  'use strict';

  const C = {
    ink: '#2a2521', ink2: '#5a524a', ink3: '#8c847a',
    paper: '#f6f1e5', paperShade: '#e6dcc6', white: '#fbf8f1',
    willow: '#a3bf86', leaf: '#6f8f55', green: '#8aa874', moss: '#b5c48f',
    indigo: '#6d8ea8', sky: '#cddde2', water: '#9fc3bf',
    ochre: '#c59a5c', brown: '#8d6b46', bamboo: '#b89b62',
    rouge: '#cf7f73', pink: '#e8b1a8', seal: '#b5362c',
    yellow: '#ebcb73', gray: '#9b968d', night: '#27344a', lamp: '#f6d27a',
  };

  /* ---------- seeded randomness keeps every drawing identical between loads ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let R = mulberry32(7);
  const seed = (s) => { R = mulberry32(s); };
  const rnd = (a = 0, b = 1) => a + (b - a) * R();

  const n1 = (v) => Math.round(v * 10) / 10;
  const P = (p) => n1(p[0]) + ' ' + n1(p[1]);

  /* ---------- geometry ---------- */
  function spline(pts, seg = 7) {
    if (pts.length < 2) return pts.slice();
    const out = [];
    const n = pts.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      for (let j = 0; j < seg; j++) {
        const t = j / seg, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
        ]);
      }
    }
    out.push(pts[n - 1]);
    return out;
  }

  /* Smooth path through points (Catmull-Rom as cubic Béziers). */
  function smoothD(pts, closed) {
    const n = pts.length;
    if (n < 2) return '';
    if (n === 2 && !closed) return 'M' + P(pts[0]) + 'L' + P(pts[1]);
    const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    let d = 'M' + P(pts[0]);
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += 'C' + P(c1) + ' ' + P(c2) + ' ' + P(p2);
    }
    return d + (closed ? 'Z' : '');
  }

  /* ---------- the brush ---------- */
  /* A tapered brush stroke: pressed at the start, full in the middle, lifted at the end. */
  function stroke(pts, w = 4, o = {}) {
    const S = spline(pts, o.seg || 7);
    const n = S.length;
    if (n < 2) return '';
    const L = [0];
    for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
    const T = L[n - 1] || 1;
    const head = o.head ?? 0.4, tail = o.tail ?? 0.1, wob = o.wob ?? 0.14, ph = rnd(0, 6.28);
    const lft = [], rgt = [], hw = [];
    const tan = (i) => {
      const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)];
      const x = b[0] - a[0], y = b[1] - a[1], l = Math.hypot(x, y) || 1;
      return [x / l, y / l];
    };
    for (let i = 0; i < n; i++) {
      const t = L[i] / T;
      let k = t < 0.18 ? head + (1 - head) * Math.sin((t / 0.18) * Math.PI / 2)
        : t > 0.6 ? tail + (1 - tail) * Math.cos(((t - 0.6) / 0.4) * Math.PI / 2)
          : 1;
      k *= 1 + wob * Math.sin(t * 7 + ph);
      const h = Math.max(0.25, (w * k) / 2);
      hw.push(h);
      const [tx, ty] = tan(i);
      lft.push([S[i][0] - ty * h, S[i][1] + tx * h]);
      rgt.push([S[i][0] + ty * h, S[i][1] - tx * h]);
    }
    const [ex, ey] = tan(n - 1), [sx, sy] = tan(0);
    let d = 'M' + P(lft[0]);
    for (let i = 1; i < n; i++) d += 'L' + P(lft[i]);
    d += 'Q' + P([S[n - 1][0] + ex * hw[n - 1] * 1.3, S[n - 1][1] + ey * hw[n - 1] * 1.3]) + ' ' + P(rgt[n - 1]);
    for (let i = n - 2; i >= 0; i--) d += 'L' + P(rgt[i]);
    d += 'Q' + P([S[0][0] - sx * hw[0] * 1.3, S[0][1] - sy * hw[0] * 1.3]) + ' ' + P(lft[0]) + 'Z';
    return `<path d="${d}" fill="${o.color || C.ink}"${o.op != null ? ` fill-opacity="${o.op}"` : ''}${o.cls ? ` class="${o.cls}"` : ''}/>`;
  }

  /* An even line, for hairlines and small details. */
  function line(pts, w = 1.2, o = {}) {
    return `<path d="${smoothD(pts, false)}" fill="none" stroke="${o.color || C.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o.op != null ? ` stroke-opacity="${o.op}"` : ''}${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
  }

  /* A soft colour wash with a wet, irregular edge. */
  function blob(cx, cy, rx, ry, color, op = 0.5, o = {}) {
    const n = o.n || 9, jag = o.jag ?? 0.22, pts = [], a0 = rnd(0, 6.28);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2, j = 1 + rnd(-jag, jag);
      pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
    }
    return `<path d="${smoothD(pts, true)}" fill="${color}" fill-opacity="${op}"${o.filter === false ? '' : ' filter="url(#hs-wash)"'}/>`;
  }

  function shape(d, fill, op = 1, o = {}) {
    return `<path d="${d}" fill="${fill}"${op !== 1 ? ` fill-opacity="${op}"` : ''}${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1.2}" stroke-linejoin="round"` : ''}${o.cls ? ` class="${o.cls}"` : ''}${o.filter ? ` filter="url(#${o.filter})"` : ''}/>`;
  }

  function place(markup, o = {}) {
    const x = o.x || 0, y = o.y || 0, s = o.s || 1, r = o.r || 0;
    const sx = o.flip ? -s : s;
    let tf = `translate(${n1(x)} ${n1(y)})`;
    if (r) tf += ` rotate(${n1(r)})`;
    if (s !== 1 || o.flip) tf += ` scale(${sx} ${s})`;
    return `<g transform="${tf}"${o.cls ? ` class="${o.cls}"` : ''}${o.id ? ` id="${o.id}"` : ''}${o.attrs || ''}>${markup}</g>`;
  }

  /* Shared filters and gradients. Inserted once into the page. */
  function defs() {
    return `
<filter id="hs-wash" x="-25%" y="-25%" width="150%" height="150%">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="1.1"/>
</filter>
<filter id="hs-rough" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="hs-seal" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="9" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feComponentTransfer in="n" result="speck"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 1 1"/></feComponentTransfer>
  <feComposite in="d" in2="speck" operator="out"/>
</filter>
<filter id="hs-blur"><feGaussianBlur stdDeviation="8"/></filter>
<radialGradient id="hs-glow">
  <stop offset="0" stop-color="#fff2c2" stop-opacity=".95"/>
  <stop offset=".35" stop-color="#f8d98a" stop-opacity=".55"/>
  <stop offset="1" stop-color="#f3c96b" stop-opacity="0"/>
</radialGradient>
<radialGradient id="hs-moonglow">
  <stop offset="0" stop-color="#fbf3d0" stop-opacity=".7"/>
  <stop offset="1" stop-color="#fbf3d0" stop-opacity="0"/>
</radialGradient>
<linearGradient id="hs-flame" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#e98a2f"/>
  <stop offset=".55" stop-color="#f6c24f"/>
  <stop offset="1" stop-color="#fff1b8"/>
</linearGradient>
<pattern id="hs-gauze" width="6" height="6" patternUnits="userSpaceOnUse">
  <path d="M0 0L6 6M6 0L0 6" stroke="#6c6258" stroke-width=".6" stroke-opacity=".55"/>
</pattern>`;
  }

  /* ---------- sky, plants, weather ---------- */
  function moon(x, y, r = 30, o = {}) {
    const k = o.thin ?? 0.62;
    const d = `M${x} ${y - r}A${r} ${r} 0 1 1 ${x} ${y + r}A${n1(r * k)} ${r} 0 1 0 ${x} ${y - r}Z`;
    return (o.glow ? `<circle cx="${x + r * 0.3}" cy="${y}" r="${r * 3}" fill="url(#hs-moonglow)"/>` : '') +
      `<path d="${d}" fill="${o.fill || '#f3e7b8'}" stroke="${C.ink}" stroke-width="${o.sw ?? 1.3}" stroke-opacity=".8"/>`;
  }

  function swallow(x, y, s = 1, r = 0) {
    return place(
      `<path d="M0 0C-5-6-13-9-25-5C-14-3-7 0-2 3L-7 11-1 7 3 12 3 4C9 1 15-1 25-7 14-10 6-6 0 0Z" fill="${C.ink}"/>`,
      { x, y, s, r });
  }

  function willow(x, y, s = 1, sd = 11, o = {}) {
    seed(sd);
    const count = o.count || 15;
    let crown = blob(-5, -245, 150, 62, C.willow, 0.24) + blob(-95, -175, 70, 95, C.willow, 0.17) + blob(90, -175, 70, 95, C.willow, 0.17);
    let trunk = '';
    trunk += stroke([[0, 0], [5, -60], [15, -128], [9, -172]], 18, { head: 0.95, tail: 0.5 });
    trunk += stroke([[10, -158], [-18, -212], [-70, -252]], 9, { head: 0.9, tail: 0.2 });
    trunk += stroke([[12, -165], [42, -222], [86, -258]], 8, { head: 0.9, tail: 0.2 });
    trunk += stroke([[9, -170], [7, -228], [-3, -283]], 6, { head: 0.9, tail: 0.15 });
    trunk += stroke([[-38, -232], [-92, -228], [-126, -212]], 3.6, { head: 0.9, tail: 0.1 });
    trunk += stroke([[52, -236], [104, -232], [132, -212]], 3.6, { head: 0.9, tail: 0.1 });
    trunk += line([[-2, -40], [0, -28]], 1, { op: 0.5 }) + line([[8, -100], [10, -88]], 1, { op: 0.5 });
    let branches = '';
    for (let i = 0; i < count; i++) {
      const a = Math.PI * (1.06 + (i / (count - 1)) * 0.88);
      const ax = Math.cos(a) * 136 + rnd(-8, 8), ay = -212 + Math.sin(a) * 74 + rnd(-6, 6);
      const dir = ax < 0 ? -1 : 1;
      const len = rnd(150, o.long || 270) * (1 - Math.abs(ax) / 420);
      const pts = [[ax, ay], [ax + dir * rnd(6, 16), ay - rnd(4, 12)], [ax + dir * rnd(14, 26), ay + len * 0.4], [ax + dir * rnd(16, 34), ay + len]];
      let b = line(pts, 1.2, { op: 0.8 });
      const S = spline(pts, 7);
      for (let k = 5; k < S.length - 1; k += 2) {
        const [px, py] = S[k], side = k % 4 === 1 ? 1 : -1;
        b += stroke([[px, py], [px + side * 5, py + 5], [px + side * 6, py + 11]], 2.6, { head: 0.7, tail: 0.1, color: C.leaf, op: 0.85 });
      }
      branches += `<g class="willow-branch" style="--d:${(i % 5) * 0.4}s">${b}</g>`;
    }
    return place(crown + trunk + branches, { x, y, s, flip: o.flip, cls: 'willow' });
  }

  /* Willow branches hanging down from the top edge of a picture. */
  function willowFringe(x0, x1, y = 0, sd = 3, o = {}) {
    seed(sd);
    let out = '';
    const count = o.count || 9;
    for (let i = 0; i < count; i++) {
      const ax = x0 + ((x1 - x0) * (i + rnd(0, 0.8))) / count;
      const len = rnd(o.min || 80, o.max || 210);
      const sway = rnd(-24, 24);
      const pts = [[ax, y - 5], [ax + sway * 0.3, y + len * 0.4], [ax + sway, y + len]];
      let b = line(pts, 1.2, { op: 0.8 });
      const S = spline(pts, 8);
      for (let k = 3; k < S.length - 1; k += 2) {
        const [px, py] = S[k], side = k % 4 === 1 ? 1 : -1;
        b += stroke([[px, py], [px + side * 5, py + 5], [px + side * 6, py + 11]], 2.6, { head: 0.7, tail: 0.1, color: C.leaf, op: 0.85 });
      }
      out += `<g class="willow-branch" style="--d:${(i % 5) * 0.35}s">${b}</g>`;
    }
    return out;
  }

  function grass(x, y, s = 1, sd = 1, color = C.leaf) {
    seed(sd);
    let g = '';
    for (let i = 0; i < 5; i++) {
      const dx = rnd(-10, 10), h = rnd(14, 30), lean = rnd(-9, 9);
      g += stroke([[dx, 0], [dx + lean * 0.4, -h * 0.5], [dx + lean, -h]], 2.4, { head: 1, tail: 0.1, color, op: 0.85 });
    }
    return place(g, { x, y, s });
  }

  function flower(x, y, s = 1, color = C.rouge) {
    let f = line([[0, 0], [1, -14], [0, -28]], 1.3, { color: C.leaf });
    f += stroke([[0, -8], [-8, -14], [-12, -13]], 3, { color: C.leaf, op: 0.8, head: 1 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      f += `<ellipse cx="${n1(Math.cos(a) * 5)}" cy="${n1(-30 + Math.sin(a) * 5)}" rx="4" ry="3" transform="rotate(${n1((a * 180) / Math.PI)} ${n1(Math.cos(a) * 5)} ${n1(-30 + Math.sin(a) * 5)})" fill="${color}" fill-opacity=".8"/>`;
    }
    f += `<circle cx="0" cy="-30" r="2.4" fill="${C.yellow}"/>`;
    return place(f, { x, y, s });
  }

  function butterfly(color = C.yellow) {
    return `<g class="bf-wings"><path d="M0 0C-6-12-20-16-22-6-22 2-10 4 0 2Z" fill="${color}" fill-opacity=".85" stroke="${C.ink}" stroke-width="1"/><path d="M0 2C-8 4-16 10-12 15-6 17-2 10 0 4Z" fill="${color}" fill-opacity=".75" stroke="${C.ink}" stroke-width="1"/><path d="M0 0C6-12 20-16 22-6 22 2 10 4 0 2Z" fill="${color}" fill-opacity=".85" stroke="${C.ink}" stroke-width="1"/><path d="M0 2C8 4 16 10 12 15 6 17 2 10 0 4Z" fill="${color}" fill-opacity=".75" stroke="${C.ink}" stroke-width="1"/></g><ellipse cx="0" cy="3" rx="1.6" ry="7" fill="${C.ink}"/><path d="M-1-3C-3-9-5-11-7-12M1-3C3-9 5-11 7-12" stroke="${C.ink}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  }

  function dragonfly() {
    return `<path d="M0-2L0 30" stroke="${C.indigo}" stroke-width="3" stroke-linecap="round"/>` +
      `<g fill="#e9f0f2" fill-opacity=".75" stroke="${C.ink}" stroke-width=".8"><ellipse cx="-14" cy="2" rx="14" ry="4" transform="rotate(-8 -14 2)"/><ellipse cx="14" cy="2" rx="14" ry="4" transform="rotate(8 14 2)"/><ellipse cx="-12" cy="9" rx="12" ry="3.5" transform="rotate(10 -12 9)"/><ellipse cx="12" cy="9" rx="12" ry="3.5" transform="rotate(-10 12 9)"/></g>` +
      `<circle cx="0" cy="-4" r="3.5" fill="${C.indigo}" stroke="${C.ink}" stroke-width=".8"/>`;
  }

  function cloud(x, y, s = 1) {
    return place(line([[-40, 6], [-30, -6], [-12, -10], [0, -18], [16, -12], [28, -14], [40, 0], [44, 8]], 1.3, { op: 0.55 }) + line([[-46, 10], [48, 10]], 1.1, { op: 0.4 }), { x, y, s });
  }

  function hills(y = 300, sd = 21, o = {}) {
    seed(sd);
    const w = o.w || 1000, hmax = o.h || 110;
    let out = '';
    let x = -60;
    while (x < w + 40) {
      const width = rnd(220, 380), peak = rnd(hmax * 0.45, hmax), cx = x + width / 2;
      const d = `M${n1(x)} ${y}C${n1(x + width * 0.25)} ${n1(y - peak * 0.35)} ${n1(cx - width * 0.18)} ${n1(y - peak)} ${n1(cx)} ${n1(y - peak)}C${n1(cx + width * 0.2)} ${n1(y - peak)} ${n1(x + width * 0.75)} ${n1(y - peak * 0.3)} ${n1(x + width)} ${y}Z`;
      out += shape(d, o.color || C.indigo, (o.op || 0.2) * rnd(0.7, 1.1), { filter: 'hs-wash' });
      x += width * rnd(0.55, 0.8);
    }
    return out;
  }

  function rainDrops(w = 1000, h = 625, count = 70, sd = 4) {
    seed(sd);
    let r = '';
    for (let i = 0; i < count; i++) {
      const x = rnd(0, w), y = rnd(0, h), l = rnd(10, 22);
      r += `<path d="M${n1(x)} ${n1(y)}l-3 ${n1(l)}" stroke="${C.indigo}" stroke-width="1.2" stroke-linecap="round" stroke-opacity=".55"/>`;
    }
    return r;
  }

  /* ---------- small creatures ---------- */
  function ant(crumb) {
    return `<g class="ant-legs" stroke="${C.ink}" stroke-width="1.15" fill="none" stroke-linecap="round"><path class="lg1" d="M-1 0L-5-6M2 0L2-7M4 0L8-5"/><path class="lg2" d="M-1 0L-5 6M2 0L2 7M4 0L8 5"/></g>` +
      `<ellipse cx="-5.5" cy="0" rx="4.4" ry="3.3" fill="${C.ink}"/><ellipse cx="1.4" cy="0" rx="2.8" ry="2" fill="${C.ink}"/><circle cx="6.6" cy="0" r="2.5" fill="${C.ink}"/>` +
      `<path d="M8-1C10-5 12-6 14-5M8 1C10 5 12 6 14 5" stroke="${C.ink}" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
      (crumb ? `<g class="crumb"><ellipse cx="11" cy="0" rx="2.6" ry="2.1" fill="#f6efd8" stroke="#a58d63" stroke-width=".6"/></g>` : '');
  }

  function leafShape(color) {
    return `<path d="M-14 0C-6-6 6-6 14 0 6 6-6 6-14 0Z" fill="${color}" fill-opacity=".9"/><path d="M-13 0L12 0" stroke="#6d5330" stroke-width=".9" stroke-opacity=".8"/>`;
  }

  function broom() {
    seed(31);
    let b = shape('M-11-36C-24-18-38-4-44 6 0 10 0 10 44 6 38-4 24-18 11-36Z', C.bamboo, 0.55);
    for (let i = -6; i <= 6; i++) b += line([[i * 1.4, -36], [i * 4, -15], [i * 6.8 + rnd(-2, 2), 6]], 1.3, { color: '#6e5330', op: 0.85 });
    b += stroke([[0, -38], [30, -122], [62, -208]], 7, { head: 1, tail: 0.8, wob: 0.05, color: '#a58550' });
    b += line([[3, -46], [8, -48]], 1.2) + line([[26, -114], [31, -116]], 1.2) + line([[48, -172], [53, -174]], 1.2);
    b += stroke([[-12, -35], [12, -35]], 4, { head: 1, tail: 1, wob: 0 }) + stroke([[-9, -41], [9, -41]], 3.4, { head: 1, tail: 1, wob: 0 });
    return b;
  }

  function fish(color = '#8f9c8a') {
    return `<g class="fish-tail"><path d="M-23 0C-30-6-36-12-41-12-37-4-37 4-41 12-36 12-30 6-23 0Z" fill="${color}" fill-opacity=".65" stroke="${C.ink}" stroke-width="1.1" stroke-linejoin="round"/></g>` +
      `<path d="M28 0C22-11 6-15-8-12-16-10-22-5-24 0-22 5-16 10-8 12 6 15 22 11 28 0Z" fill="${color}" fill-opacity=".8" stroke="${C.ink}" stroke-width="1.4"/>` +
      `<path d="M-3-12C1-19 10-18 12-11" fill="${color}" fill-opacity=".5" stroke="${C.ink}" stroke-width="1.1"/>` +
      `<path d="M12-7C14-3 14 3 12 7" fill="none" stroke="${C.ink}" stroke-width=".9"/><circle cx="19" cy="-3" r="1.9" fill="${C.ink}"/>`;
  }

  function moth() {
    const wing = 'fill="#dcd2c0" fill-opacity=".95" stroke="' + C.ink + '" stroke-width=".9"';
    return `<g class="moth-wings"><path d="M0-2C-8-14-22-18-26-10-26-2-14 2 0 2Z" ${wing}/><path d="M0 2C-8 4-18 8-18 14-12 18-4 12 0 6Z" ${wing}/><path d="M0-2C8-14 22-18 26-10 26-2 14 2 0 2Z" ${wing}/><path d="M0 2C8 4 18 8 18 14 12 18 4 12 0 6Z" ${wing}/><circle cx="-15" cy="-8" r="2" fill="${C.ink}" fill-opacity=".45"/><circle cx="15" cy="-8" r="2" fill="${C.ink}" fill-opacity=".45"/></g>` +
      `<ellipse cx="0" cy="2" rx="2.3" ry="7.5" fill="${C.ink2}"/><path d="M-1-5C-4-11-7-14-10-15M1-5C4-11 7-14 10-15" stroke="${C.ink}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  }

  function bird(o = {}) {
    const col = o.color || '#a47d50';
    const body = `<path d="M-18 4C-16-6-6-11 4-11 8-18 20-19 23-11L31-9 23-6C22 2 16 10 4 12-6 13-14 10-18 4Z" fill="${col}" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M-17 3L-35-5-32 4-37 11-15 8Z" fill="${col}" fill-opacity=".75" stroke="${C.ink}" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<circle cx="17.5" cy="-12" r="1.8" fill="${C.ink}"/>` +
      (o.brow ? `<path d="M20-15C15-18 9-17 3-13" stroke="#fffdf6" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="17.5" cy="-12" r="3.3" fill="none" stroke="#fffdf6" stroke-width="1.4"/>` : '') +
      (o.belly ? `<path d="M0 10C8 10 16 4 20-2" stroke="${o.belly}" stroke-width="4" fill="none" stroke-opacity=".6" stroke-linecap="round"/>` : '');
    const wingDown = `<path d="M-10-5C-2-9 8-5 12 2 2 5-6 4-13 5Z" fill="${col}" fill-opacity=".6" stroke="${C.ink}" stroke-width="1.2" stroke-linejoin="round"/>`;
    const wingUp = `<path d="M-6-7C-12-24-2-36 8-33 6-22 4-14 3-8Z" fill="${col}" fill-opacity=".7" stroke="${C.ink}" stroke-width="1.2" stroke-linejoin="round"/>`;
    const legs = o.fly ? '' : `<path d="M-3 11L-5 20M-8 21L-2 21M4 11L5 20M1 21L8 21" stroke="${C.ink}" stroke-width="1.2" stroke-linecap="round" fill="none"/>`;
    if (o.fly) return legs + `<g class="wing-up">${wingUp}</g>` + body + `<g class="wing-down">${wingDown}</g>`;
    return legs + body + wingDown;
  }

  function chickHead(open = true) {
    return `<circle cx="0" cy="0" r="8" fill="#d8c69e" stroke="${C.ink}" stroke-width="1.2"/>` +
      (open ? `<path d="M5-3L16-8 9 0 16 5 5 3Z" fill="#f2c44a" stroke="${C.ink}" stroke-width=".9" stroke-linejoin="round"/>` : `<path d="M6-2L13 0 6 2Z" fill="#f2c44a" stroke="${C.ink}" stroke-width=".9"/>`) +
      `<circle cx="2" cy="-3" r="1.4" fill="${C.ink}"/>`;
  }

  function fledgling() {
    let f = `<ellipse cx="0" cy="0" rx="14" ry="12" fill="#d3c29c" stroke="${C.ink}" stroke-width="1.3"/>`;
    f += `<path d="M-13-3C-16-8-14-12-10-12M-6-11C-6-15-2-16 0-13M4-12C6-16 10-15 10-11" stroke="${C.ink}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    f += `<path d="M-6 0C-2 2 2 3 6 2" stroke="${C.ink}" stroke-width="1.1" fill="none"/>`;
    f += `<path d="M11-4L20-6 12 0Z" fill="#f2c44a" stroke="${C.ink}" stroke-width=".9" stroke-linejoin="round"/><circle cx="7" cy="-5" r="1.6" fill="${C.ink}"/>`;
    f += `<path d="M-3 11L-4 16M3 11L4 16" stroke="${C.ink}" stroke-width="1.1" stroke-linecap="round"/>`;
    return f;
  }

  function nest() {
    seed(55);
    let n = `<path d="M-38 0C-33 18 33 18 38 0 22 7-22 7-38 0Z" fill="#9c7b4d" fill-opacity=".75"/>`;
    for (let i = 0; i < 16; i++) {
      const x = rnd(-36, 30), y = rnd(-2, 12);
      n += line([[x, y], [x + rnd(6, 14), y + rnd(-3, 5)]], 1.1, { color: C.ink, op: 0.75 });
    }
    n += line([[-40, -1], [-20, 4], [0, 5], [20, 4], [40, -1]], 1.5);
    return n;
  }

  function littleChick(o = {}) {
    const c = o.color || '#f0d27a';
    return `<path d="M-2 11L-3 17M3 11L4 17" stroke="${C.ink}" stroke-width="1.1" stroke-linecap="round"/>` +
      `<ellipse cx="0" cy="3" rx="11" ry="9" fill="${c}" fill-opacity=".95" stroke="${C.ink}" stroke-width="1.2"/>` +
      `<circle cx="8" cy="-6" r="6.5" fill="${c}" stroke="${C.ink}" stroke-width="1.2"/>` +
      `<path d="M14-7L19-5 14-4Z" fill="#e39a3a" stroke="${C.ink}" stroke-width=".7"/><circle cx="10" cy="-8" r="1.2" fill="${C.ink}"/>` +
      `<path d="M-6 1C-2 5 3 5 5 3" stroke="${C.ink}" stroke-width=".9" fill="none"/>`;
  }

  function crab(o = {}) {
    const c = o.color || '#c9745a';
    let k = '';
    const legs = [[-18, 2], [-14, 5], [-9, 7]];
    legs.forEach(([x, y], i) => {
      k += line([[x, y], [x - 12, y - 4 + i * 3], [x - 18, y + 8 + i * 2]], 1.8);
      k += line([[-x, y], [-x + 12, y - 4 + i * 3], [-x + 18, y + 8 + i * 2]], 1.8);
    });
    k += line([[-14, -6], [-22, -16], [-26, -22]], 2.2) + line([[14, -6], [22, -16], [26, -22]], 2.2);
    k += `<path d="M-26-22C-34-24-36-34-28-36-26-32-23-30-22-27Z" fill="${c}" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.2"/><path d="M26-22C34-24 36-34 28-36 26-32 23-30 22-27Z" fill="${c}" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.2"/>`;
    k += `<path d="M-22 0C-22-13 22-13 22 0 22 9-22 9-22 0Z" fill="${c}" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.5"/>`;
    k += line([[-5, -9], [-6, -16]], 1.3) + line([[5, -9], [6, -16]], 1.3) + `<circle cx="-6" cy="-17" r="1.8" fill="${C.ink}"/><circle cx="6" cy="-17" r="1.8" fill="${C.ink}"/>`;
    k += line([[-10, -2], [0, 1], [10, -2]], 1, { op: 0.6 });
    return k;
  }

  /* ---------- the white cat, Baixiang ---------- */
  function cat(o = {}) {
    const W = C.white;
    if (o.pose === 'sleep') {
      return `<path d="M-52 0C-54-26-22-40 8-36 38-32 56-16 52 0Z" fill="${W}"/>` +
        stroke([[-50, -4], [-44, -26], [-14, -38], [20, -35], [46, -20], [52, -2]], 2.8, { head: 0.6, tail: 0.3 }) +
        `<path d="M-60-2C-62-18-50-28-36-24-26-22-22-10-26 0Z" fill="${W}"/>` +
        stroke([[-58, -4], [-60, -16], [-50, -26], [-36, -24]], 2.4, { head: 0.6, tail: 0.3 }) +
        `<path d="M-54-20L-58-34-44-26Z M-40-25L-34-38-30-24Z" fill="${W}" stroke="${C.ink}" stroke-width="1.8" stroke-linejoin="round"/>` +
        `<path d="M-51-13C-49-11-46-11-44-13M-40-13C-38-11-35-11-33-13" stroke="${C.ink}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
        stroke([[52, -2], [40, 4], [0, 6], [-40, 4]], 3, { head: 0.8, tail: 0.3 }) +
        line([[-54, 0], [58, 1]], 1.2, { op: 0.35 });
    }
    // sitting, facing the viewer, tail curled around the front paws
    let s = '';
    s += `<path d="M-30-6C-38-30-30-58-16-62L16-62C30-58 38-30 30-6Z" fill="${W}"/>`;
    s += `<path d="M28-4C44-6 52-18 46-30 42-36 36-34 38-28 42-20 34-12 22-10Z" fill="${W}"/>`;
    s += stroke([[-16, -62], [-30, -44], [-34, -22], [-30, -4]], 3, { head: 0.8, tail: 0.3 });
    s += stroke([[16, -62], [30, -44], [34, -22], [30, -6]], 3, { head: 0.8, tail: 0.3 });
    s += stroke([[22, -9], [40, -10], [48, -24], [42, -32], [37, -28]], 3, { head: 0.8, tail: 0.3 });
    s += stroke([[-22, -2], [-10, 0], [2, -1]], 2.2, { head: 0.6, tail: 0.3 }) + stroke([[4, -1], [16, 0], [26, -3]], 2.2, { head: 0.6, tail: 0.3 });
    s += line([[-4, -44], [-6, -24]], 1.1, { op: 0.45 }) + line([[4, -44], [6, -24]], 1.1, { op: 0.45 });
    s += `<ellipse cx="0" cy="-80" rx="25" ry="21" fill="${W}"/>`;
    s += `<path d="M-21-90L-22-111-4-98Z M21-90L22-111 4-98Z" fill="${W}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="M-17-94L-18-104-9-97Z M17-94L18-104 9-97Z" fill="${C.pink}" fill-opacity=".7"/>`;
    s += stroke([[-6, -100], [-20, -94], [-26, -80], [-20, -64], [-6, -59]], 2.6, { head: 0.6, tail: 0.3 });
    s += stroke([[6, -100], [20, -94], [26, -80], [20, -64], [6, -59]], 2.6, { head: 0.6, tail: 0.3 });
    s += `<g class="cat-eyes"><ellipse cx="-9" cy="-82" rx="4.4" ry="3.6" fill="#86b3dd" stroke="${C.ink}" stroke-width="1.1"/><ellipse cx="9" cy="-82" rx="4.4" ry="3.6" fill="#e4b64c" stroke="${C.ink}" stroke-width="1.1"/><ellipse cx="-9" cy="-82" rx="1.3" ry="3" fill="${C.ink}"/><ellipse cx="9" cy="-82" rx="1.3" ry="3" fill="${C.ink}"/></g>`;
    s += `<path d="M-2.6-75L2.6-75 0-72Z" fill="#d98c8c"/><path d="M0-72C-1-69-4-68-6-69M0-72C1-69 4-68 6-69" stroke="${C.ink}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M-12-73L-30-76M-12-71L-29-68M12-73L30-76M12-71L29-68" stroke="${C.ink}" stroke-width=".8" stroke-opacity=".55" stroke-linecap="round"/>`;
    return s;
  }

  /* ---------- people (faceless, as in Feng Zikai's paintings) ---------- */
  function hand(p) { return `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="3.3" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.2"/>`; }

  function arm(sh, el, hd, color, w = 7) {
    return stroke([sh, el, hd], w, { color, op: 0.9, head: 1, tail: 0.75, wob: 0.05 }) + line([sh, el, hd], 1.3, { op: 0.9 }) + hand(hd);
  }

  function hairOf(kind, cx, cy, rx, ry) {
    const t = cy - ry, l = cx - rx, r = cx + rx;
    if (kind === 'boy') return `<path d="M${l} ${cy}C${l - 1} ${t - 2} ${cx + 2} ${t - 5} ${r - 1} ${t + 6}C${r} ${t + 9} ${r - 2} ${t + 8} ${cx + 4} ${t + 7}C${cx - 4} ${t + 6} ${l + 4} ${cy - 4} ${l} ${cy + 2}Z" fill="${C.ink}"/>`;
    if (kind === 'girl') return `<path d="M${l - 1} ${cy + 6}C${l - 3} ${t - 2} ${cx + 2} ${t - 5} ${r} ${t + 5}C${r + 1} ${t + 9} ${r} ${t + 11} ${r - 1} ${t + 12}C${r - 5} ${t + 6} ${cx - 2} ${t + 4} ${l + 5} ${cy - 2}C${l + 3} ${cy + 2} ${l + 2} ${cy + 6} ${l - 1} ${cy + 6}Z" fill="${C.ink}"/><circle cx="${l - 2}" cy="${cy + 8}" r="4" fill="${C.ink}"/>`;
    if (kind === 'man') return `<path d="M${l} ${cy - 1}C${l} ${t - 3} ${r} ${t - 3} ${r} ${cy - 3}C${r - 4} ${t + 3} ${l + 4} ${t + 3} ${l} ${cy - 1}Z" fill="${C.ink}"/>`;
    if (kind === 'bald') return `<path d="M${l + 3} ${cy - 5}C${l + 6} ${t + 1} ${r - 6} ${t + 1} ${r - 3} ${cy - 5}" stroke="${C.ink}" stroke-width=".8" stroke-opacity=".35" fill="none"/>`;
    return '';
  }

  /* A child. Origin at the feet. Arms given as [elbow, hand] for left and right. */
  function kid(o = {}) {
    const jacket = o.jacket || C.rouge, pants = o.pants || '#56647a';
    const arms = o.arms || { l: [[-17, -62], [-15, -45]], r: [[17, -62], [16, -45]] };
    let s = '';
    const legs = o.legs || 'stand';
    if (legs === 'stand') {
      s += shape('M-13-46L-12-7-4-7-1-35 2-35 5-7 13-7 14-46Z', pants, 0.85);
      s += `<ellipse cx="-8" cy="-4" rx="7" ry="3.8" fill="${C.ink}"/><ellipse cx="9" cy="-4" rx="7" ry="3.8" fill="${C.ink}"/>`;
    } else if (legs === 'walk') {
      s += shape('M-12-46L-20-8-12-6-3-34 2-34 10-6 18-8 13-46Z', pants, 0.85);
      s += `<ellipse cx="-17" cy="-4" rx="7" ry="3.8" fill="${C.ink}"/><ellipse cx="15" cy="-4" rx="7" ry="3.8" fill="${C.ink}"/>`;
    } else if (legs === 'crouch') {
      s += shape('M-14-44C-20-30-18-14-12-8L-2-8C-6-18-4-28 0-34 4-26 6-18 8-8L18-8C20-18 16-32 14-44Z', pants, 0.85);
      s += `<ellipse cx="-8" cy="-4" rx="7" ry="3.8" fill="${C.ink}"/><ellipse cx="12" cy="-4" rx="7" ry="3.8" fill="${C.ink}"/>`;
    } else if (legs === 'sit') {
      s += shape('M-14-44C-16-30-10-26 6-26L22-24 24-8 32-8 30-34C18-38 8-40 14-44Z', pants, 0.85);
      s += `<ellipse cx="30" cy="-4" rx="7" ry="3.8" fill="${C.ink}"/>`;
    }
    const top = legs === 'crouch' ? 12 : legs === 'sit' ? 8 : 0;
    const Y = (v) => v + top;
    s += `<g transform="translate(0 ${top})">`;
    s += shape('M-10-84C-15-80-17-64-19-46C-8-43 8-43 19-46C17-64 15-80 10-84C4-86-4-86-10-84Z', jacket, 0.82);
    s += stroke([[-10, -84], [-16, -66], [-19, -46]], 2.4, { head: 0.7 }) + stroke([[10, -84], [16, -66], [19, -46]], 2.4, { head: 0.7 });
    s += stroke([[-19, -46], [0, -43], [19, -46]], 1.6, { head: 0.6, tail: 0.4 }) + line([[0, -84], [1, -60]], 1, { op: 0.5 });
    s += `</g>`;
    s += arm([-11, Y(-79)], arms.l[0], arms.l[1], jacket) + arm([11, Y(-79)], arms.r[0], arms.r[1], jacket);
    const hx = o.headX || 1, hy = Y(-99);
    s += `<ellipse cx="${hx}" cy="${hy}" rx="14" ry="15.5" fill="${C.paper}" stroke="${C.ink}" stroke-width="2"/>`;
    s += hairOf(o.hair || 'boy', hx, hy, 14, 15.5);
    return place(s, o);
  }

  /* An adult in a long gown. Origin at the feet. */
  function adult(o = {}) {
    const robe = o.robe || '#8c9aa4';
    const arms = o.arms || { l: [[-20, -112], [-18, -84]], r: [[20, -112], [18, -84]] };
    let s = '';
    s += `<ellipse cx="-7" cy="-4" rx="8" ry="4" fill="${C.ink}"/><ellipse cx="9" cy="-4" rx="8" ry="4" fill="${C.ink}"/>`;
    s += shape('M-12-152C-18-140-22-90-26-9C-8-5 8-5 26-9 22-90 18-140 12-152 5-155-5-155-12-152Z', robe, 0.8);
    s += stroke([[-12, -152], [-19, -110], [-23, -60], [-26, -9]], 2.6, { head: 0.7 }) + stroke([[12, -152], [19, -110], [23, -60], [26, -9]], 2.6, { head: 0.7 });
    s += stroke([[-26, -9], [0, -5], [26, -9]], 1.8, { head: 0.6, tail: 0.4 }) + line([[2, -150], [4, -12]], 1, { op: 0.4 });
    s += line([[-12, -152], [-2, -140], [4, -152]], 1.2, { op: 0.7 });
    s += arm([-13, -147], arms.l[0], arms.l[1], robe, 8) + arm([13, -147], arms.r[0], arms.r[1], robe, 8);
    const hy = -168;
    s += `<ellipse cx="1" cy="${hy}" rx="12.5" ry="15" fill="${C.paper}" stroke="${C.ink}" stroke-width="2"/>`;
    s += hairOf(o.hair || 'man', 1, hy, 12.5, 15);
    return place(s, o);
  }

  /* ---------- things ---------- */
  function lamp(o = {}) {
    let l = '';
    l += `<ellipse cx="0" cy="-3" rx="26" ry="6" fill="#8a6b48" fill-opacity=".75" stroke="${C.ink}" stroke-width="1.3"/>`;
    l += `<rect x="-3.5" y="-92" width="7" height="88" fill="#7a5d3c" fill-opacity=".85"/>` + line([[-3.5, -92], [-3.5, -5]], 1.1) + line([[3.5, -92], [3.5, -5]], 1.1);
    l += `<path d="M-20-95C-18-86 18-86 20-95Z" fill="#8a6b48" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.2"/><ellipse cx="0" cy="-95" rx="20" ry="4.5" fill="#6d5236" stroke="${C.ink}" stroke-width="1.2"/>`;
    l += line([[0, -96], [2, -103]], 1.6);
    if (!o.unlit) l += `<g class="flame"><path d="M1-132C11-119 11-105 1-100-8-105-8-119 1-132Z" fill="url(#hs-flame)"/><path d="M1-118C5-112 5-106 1-103-3-106-3-112 1-118Z" fill="#fffaf0" fill-opacity=".9"/></g>`;
    return l;
  }

  function gauze() {
    return `<path d="M-30-86L-30 0C-30 7 30 7 30 0L30-86Z" fill="url(#hs-gauze)"/>` +
      `<path d="M-30-86L-30 0C-30 7 30 7 30 0L30-86Z" fill="#f5eedd" fill-opacity=".28"/>` +
      `<ellipse cx="0" cy="-86" rx="30" ry="7" fill="none" stroke="${C.brown}" stroke-width="2.2"/>` +
      `<path d="M-30 0C-30 7 30 7 30 0" fill="none" stroke="${C.brown}" stroke-width="2.2"/>` +
      line([[-30, -86], [-30, 0]], 1.4) + line([[30, -86], [30, 0]], 1.4) + line([[0, -79], [0, 7]], 0.8, { op: 0.5 });
  }

  function cage(o = {}) {
    const col = '#5f4a33';
    let c = '';
    c += line([[0, -178], [0, -192], [6, -200], [0, -206], [-5, -200]], 2, { color: col });
    c += `<ellipse cx="0" cy="-12" rx="60" ry="10" fill="#8d6b46" fill-opacity=".55" stroke="${C.ink}" stroke-width="1.4"/>`;
    c += `<path d="M-60-12L-60 0C-60 9 60 9 60 0L60-12" fill="#8d6b46" fill-opacity=".7" stroke="${C.ink}" stroke-width="1.4"/>`;
    for (let x = -55; x <= 55; x += 11) {
      if (o.door && x > -12 && x < 12) continue;
      const topY = -120 - Math.sqrt(Math.max(0, 1 - (x / 58) ** 2)) * 8;
      c += line([[x, -12], [x, topY], [x * 0.55, -160], [0, -178]], 1.4, { color: col });
    }
    c += `<ellipse cx="0" cy="-120" rx="57" ry="9" fill="none" stroke="${col}" stroke-width="2"/>`;
    c += line([[-54, -62], [54, -62]], 2.4, { color: col });
    c += `<rect x="30" y="-34" width="14" height="10" fill="${C.paper}" stroke="${C.ink}" stroke-width="1"/>`;
    if (o.door) {
      let d = '';
      for (let x = -11; x <= 11; x += 11) d += line([[x, -14], [x, -78]], 1.4, { color: col });
      d += `<rect x="-12" y="-80" width="24" height="68" fill="none" stroke="${col}" stroke-width="2.2"/>`;
      c += `<g class="cage-door">${d}</g>`;
    }
    return c;
  }

  function featherDuster() {
    seed(77);
    let f = stroke([[-78, 14], [-20, 2]], 5, { color: C.brown, head: 1, tail: 0.9, wob: 0.03 });
    f += blob(26, -2, 52, 22, C.ochre, 0.5, { jag: 0.15 });
    for (let i = 0; i < 16; i++) {
      const y0 = rnd(-6, 8), len = rnd(40, 82), bend = rnd(-18, 18);
      f += stroke([[-22, y0 * 0.5], [-22 + len * 0.5, y0 + bend * 0.6], [-22 + len, y0 + bend]], rnd(4, 7), { head: 0.8, tail: 0.1, color: i % 3 ? '#8a5a38' : C.ink, op: 0.75 });
    }
    return f;
  }

  function stool() {
    return `<path d="M-38-40L38-40 44-32-44-32Z" fill="#b08a5a" fill-opacity=".8" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<rect x="-44" y="-32" width="88" height="6" fill="#8d6b46" fill-opacity=".85" stroke="${C.ink}" stroke-width="1.3"/>` +
      stroke([[-36, -26], [-40, 0]], 5, { color: C.ink, head: 1, tail: 0.8 }) + stroke([[36, -26], [40, 0]], 5, { color: C.ink, head: 1, tail: 0.8 }) +
      stroke([[-22, -26], [-22, -6]], 4, { color: C.ink2, head: 1, tail: 0.8 }) + stroke([[22, -26], [22, -6]], 4, { color: C.ink2, head: 1, tail: 0.8 });
  }

  function shoe(color = C.rouge) {
    return `<path d="M-9 0C-10-6-6-9 0-9 6-9 10-6 10-1Z" fill="${color}" fill-opacity=".9" stroke="${C.ink}" stroke-width="1.2"/><path d="M-10 0L11 0" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  }

  function slingshot() {
    return `<path d="M0 0L0-12M0-12L-6-24M0-12L6-24" stroke="${C.brown}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M-6-24C-2-18 2-18 6-24" stroke="${C.ink2}" stroke-width="1" fill="none"/>`;
  }

  function desk(x1, x2, y, legH = 150) {
    return `<path d="M${x1} ${y}L${x2} ${y}L${x2 + 6} ${y + 12}L${x1 - 6} ${y + 12}Z" fill="#8d6b46" fill-opacity=".8" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/>` +
      stroke([[x1 + 8, y + 12], [x1 + 6, y + legH]], 7, { color: C.ink, head: 1, tail: 0.7 }) + stroke([[x2 - 8, y + 12], [x2 - 6, y + legH]], 7, { color: C.ink, head: 1, tail: 0.7 });
  }

  function books(x, y) {
    return place(`<rect x="-34" y="-10" width="68" height="10" fill="${C.indigo}" fill-opacity=".7" stroke="${C.ink}" stroke-width="1.1"/><rect x="-30" y="-19" width="62" height="9" fill="${C.ochre}" fill-opacity=".7" stroke="${C.ink}" stroke-width="1.1"/><rect x="-32" y="-27" width="60" height="8" fill="${C.paperShade}" stroke="${C.ink}" stroke-width="1.1"/>`, { x, y });
  }

  function brushPot(x, y) {
    return place(`<path d="M-12 0L-14-30 14-30 12 0Z" fill="${C.indigo}" fill-opacity=".6" stroke="${C.ink}" stroke-width="1.2"/>` + line([[-6, -30], [-12, -62]], 2) + line([[0, -30], [2, -66]], 2) + line([[6, -30], [12, -58]], 2) +
      `<path d="M-12-62L-15-72-10-70Z M2-66L1-76 5-75Z" fill="${C.ink}"/>`, { x, y });
  }

  function paperStack(x, y, n = 6) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<rect x="${-46 + i * 1.5}" y="${-4 - i * 3}" width="92" height="4" fill="${C.white}" stroke="${C.ink}" stroke-width=".8" stroke-opacity=".7"/>`;
    return place(s, { x, y });
  }

  function easel() {
    return line([[-30, 0], [0, -150]], 3) + line([[30, 0], [0, -150]], 3) + line([[0, -150], [4, 0]], 2.4, { op: 0.8 }) +
      `<rect x="-34" y="-128" width="68" height="78" fill="${C.white}" stroke="${C.ink}" stroke-width="1.5"/>` + line([[-38, -48], [38, -48]], 3);
  }

  /* ---------- architecture ---------- */
  function wallTop(x1, x2, y, sd = 8) {
    seed(sd);
    let t = shape(`M${x1} ${y}L${x2} ${y}L${x2} ${y + 14}L${x1} ${y + 14}Z`, '#4a4a4a', 0.75);
    for (let x = x1; x < x2; x += 18) t += `<path d="M${x} ${y + 14}c3 6 12 6 15 0" fill="none" stroke="${C.ink}" stroke-width="1.3"/>`;
    t += stroke([[x1 - 10, y + 1], [x2 + 10, y - 2]], 5, { head: 0.8, tail: 0.6 });
    return t;
  }

  function roundWindow(cx, cy, r) {
    let w = `<circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="none" stroke="${C.brown}" stroke-width="7" stroke-opacity=".7"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
    return w;
  }

  function eaves(x1, x2, y) {
    let e = shape(`M${x1} ${y}L${x2} ${y - 30}L${x2} ${y - 10}L${x1} ${y + 22}Z`, '#4b4d52', 0.8);
    for (let i = 0; i <= 12; i++) {
      const x = x1 + ((x2 - x1) * i) / 12, yy = y + 22 - (32 * i) / 12;
      e += `<path d="M${n1(x)} ${n1(yy)}c2 6 10 6 12 0" fill="none" stroke="${C.ink}" stroke-width="1.4"/>`;
    }
    e += stroke([[x1, y + 22], [x2, y - 10]], 3, { head: 1, tail: 0.6 });
    return e;
  }

  /* ---------- seals ---------- */
  function sealChars(text) {
    const t = (text || '').trim();
    const cjk = Array.from(t).filter((ch) => /[㐀-鿿]/.test(ch));
    if (cjk.length) return cjk.slice(0, 4);
    const words = t.split(/\s+/).filter(Boolean);
    if (!words.length) return ['护', '生'];
    if (words.length === 1) return [words[0].slice(0, 2).toUpperCase()];
    return [(words[0][0] + words[words.length - 1][0]).toUpperCase()];
  }

  /* A red seal (朱文/白文). Returns markup for a 100×100 box. */
  function seal(text, o = {}) {
    const chars = sealChars(text);
    const red = o.color || C.seal;
    let inner = '';
    const font = `font-family="'Ma Shan Zheng','STKaiti','KaiTi',serif" fill="${C.paper}" text-anchor="middle" dominant-baseline="central"`;
    if (chars.length === 1) {
      const ch = chars[0];
      const size = ch.length > 1 ? 46 : 70;
      inner = `<text x="50" y="52" font-size="${size}" ${font}>${esc(ch)}</text>`;
    } else if (chars.length === 2) {
      inner = `<text x="50" y="29" font-size="44" ${font}>${esc(chars[0])}</text><text x="50" y="73" font-size="44" ${font}>${esc(chars[1])}</text>`;
    } else if (chars.length === 3) {
      inner = `<text x="72" y="50" font-size="46" ${font}>${esc(chars[0])}</text><text x="29" y="29" font-size="40" ${font}>${esc(chars[1])}</text><text x="29" y="72" font-size="40" ${font}>${esc(chars[2])}</text>`;
    } else {
      inner = `<text x="72" y="29" font-size="40" ${font}>${esc(chars[0])}</text><text x="72" y="72" font-size="40" ${font}>${esc(chars[1])}</text><text x="29" y="29" font-size="40" ${font}>${esc(chars[2])}</text><text x="29" y="72" font-size="40" ${font}>${esc(chars[3])}</text>`;
    }
    return `<g${o.filter === false ? '' : ' filter="url(#hs-seal)"'}><rect x="3" y="3" width="94" height="94" rx="6" fill="${red}"/><rect x="9" y="9" width="82" height="82" rx="3" fill="none" stroke="${C.paper}" stroke-width="2.2" stroke-opacity=".85"/>${inner}</g>`;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Wrap markup into a standalone <svg>. */
  function svg(inner, w, h, o = {}) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${o.vb || `0 0 ${w} ${h}`}"${o.cls ? ` class="${o.cls}"` : ''}${o.label ? ` role="img" aria-label="${esc(o.label)}"` : ' aria-hidden="true"'} preserveAspectRatio="${o.par || 'xMidYMid meet'}">${o.defs ? `<defs>${defs()}</defs>` : ''}${inner}</svg>`;
  }

  function sealSVG(text, o = {}) {
    return svg(seal(text, o), 100, 100, { cls: o.cls || 'seal-svg', label: o.label, defs: o.defs });
  }

  window.Art = {
    C, seed, rnd, spline, smoothD, stroke, line, blob, shape, place, defs, svg, esc,
    moon, swallow, willow, willowFringe, grass, flower, butterfly, dragonfly, cloud, hills, rainDrops,
    ant, leafShape, broom, fish, moth, bird, chickHead, fledgling, nest, littleChick, crab, cat,
    kid, adult, hand, lamp, gauze, cage, featherDuster, stool, shoe, slingshot, desk, books, brushPot,
    paperStack, easel, wallTop, roundWindow, eaves, seal, sealSVG, sealChars,
  };
})();
