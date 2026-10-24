
/* =========================================================
   Iso engine — tiny isometric SVG renderer (no dependencies)
   ========================================================= */
const C30 = 0.8660254, S30 = 0.5;
const P = (x, y, z = 0) => [(x - y) * C30, (x + y) * S30 - z];
const f1 = n => Math.round(n * 10) / 10;
const pts = list => list.map(p => { const [X, Y] = P(...p); return f1(X) + "," + f1(Y); }).join(" ");
const poly = (list, cls, extra = "") => `<polygon class="${cls}" points="${pts(list)}" ${extra}/>`;
const line = (a, b, cls, extra = "") => { const [x1, y1] = P(...a), [x2, y2] = P(...b); return `<line class="${cls}" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" ${extra}/>`; };
const pathL = (list, cls, extra = "") => `<path class="${cls}" d="M${pts(list).replace(/ /g, " L")}" ${extra}/>`;
const circ = (p, r, cls, extra = "") => { const [X, Y] = P(...p); return `<circle class="${cls}" cx="${f1(X)}" cy="${f1(Y)}" r="${f1(r)}" ${extra}/>`; };
const ell = (x, y, z, r, cls, extra = "") => { const [X, Y] = P(x, y, z); return `<ellipse class="${cls}" cx="${f1(X)}" cy="${f1(Y)}" rx="${f1(r * 1.2247)}" ry="${f1(r * .7071)}" ${extra}/>`; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const wrapPI = a => Math.atan2(Math.sin(a), Math.cos(a));
// screen → ground plane (z = 0)
const unP = (X, Y) => [Y + X / (2 * C30), Y - X / (2 * C30)];

// box: x,y,z origin (back corner), w along x, d along y, h up. acc = 0..1 accent blend
function box(x, y, z, w, d, h, acc = 0) {
  const L = [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]];
  const R = [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]];
  const T = [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]];
  let s = poly(L, "f2") + poly(R, "f2") + poly(T, "f");
  if (acc > .01) { const o = `opacity="${f1(acc)}"`; s += poly(L, "al", o) + poly(R, "ar", o) + poly(T, "at", o); }
  return s;
}
// vertical cylinder
function cyl(cx, cy, z, r, h, topCls = "f", sideCls = "f2", extra = "") {
  const rx = r * 1.2247, ry = r * .7071, [X, Yb] = P(cx, cy, z), Yt = Yb - h;
  const side = `<path class="${sideCls}" ${extra} d="M${f1(X - rx)},${f1(Yb)} A${f1(rx)},${f1(ry)} 0 0 0 ${f1(X + rx)},${f1(Yb)} L${f1(X + rx)},${f1(Yt)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(X - rx)},${f1(Yt)} Z"/>`;
  return side + `<ellipse class="${topCls}" ${extra} cx="${f1(X)}" cy="${f1(Yt)}" rx="${f1(rx)}" ry="${f1(ry)}"/>`;
}
// pie sector as a short cylinder slice
function sector(cx, cy, z, r, h, a0, a1, top = "f", side = "f2", extra = "") {
  const n = Math.max(3, Math.ceil((a1 - a0) / 0.12)), arc = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; arc.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  const c0 = [cx, cy, z], c1 = [cx, cy, z + h];
  const e0 = arc[0], e1 = arc[arc.length - 1];
  let s = poly([c0, [e0[0], e0[1], z], [e0[0], e0[1], z + h], c1], side, extra);
  s += poly([c0, [e1[0], e1[1], z], [e1[0], e1[1], z + h], c1], side, extra);
  s += poly([...arc.map(p => [p[0], p[1], z]), ...arc.slice().reverse().map(p => [p[0], p[1], z + h])], side, extra);
  s += poly([c1, ...arc.map(p => [p[0], p[1], z + h])], top, extra);
  return s;
}
const glow = (p, r, id, op = 1) => { const [X, Y] = P(...p); return `<circle cx="${f1(X)}" cy="${f1(Y)}" r="${f1(r)}" fill="url(#${id})" opacity="${f1(op)}"/>`; };

const txt = (p, s, extra = "") => { const [X, Y] = P(...p); return `<text class="lbl" x="${f1(X)}" y="${f1(Y)}" text-anchor="middle" ${extra}>${s}</text>`; };

const SCENES = {
  /* 01 网易 — 游戏运营触达棋盘：玩家分层 → 策略匹配和内容生成 → 企微触达 → 回复 / 转化反馈 */
  reach: {
    rest: [10, 10],
    zones: [
      { n: "高价值活跃", s: "新内容推荐", pawns: [[0, 0], [1, 2], [0, 3]] },
      { n: "付费下滑",   s: "权益提醒",   pawns: [[1, 0], [0, 1], [1, 3]] },
      { n: "沉默待唤回", s: "回归引导",   pawns: [[0, 0], [1, 1], [0, 2], [1, 3]] }
    ],
    stages: ["用户理解", "策略匹配", "内容生成", "审核 · 企微发送", "回复 · 转化反馈"],
    T: 15, ZW: 34,
    zx(k) { return -52 + k * (this.ZW + 4); },
    target(i) {
      let sel = 0, bd = 1e9;
      for (let k = 0; k < 3; k++) { const [X] = P(this.zx(k) + 15, 26); const d = Math.abs(X - i.px); if (d < bd) { bd = d; sel = k; } }
      return { sel, s: [0, 1, 2].map(k => k === sel ? 1 : 0) };
    },
    render(v, i) {
      const Z = this.zones, T = this.T, z0 = -14;
      const ph = i.h > .5 ? (i.t * .38) % 1 : .86;            // loop while hovered, frozen snapshot at rest
      const stIdx = ph < .1 ? 0 : ph < .2 ? 1 : ph < .3 ? 2 : ph < .58 ? 3 : 4;
      let out = "";

      // AI workflow rail behind the board: 4 stage blocks light up in sequence
      const py = -30, pz = z0;
      out += box(-56, py - 6, pz, 112, 14, 3);
      const sx = k => -50 + k * 27;
      for (let k = 0; k < 4; k++) {
        const lit = (k < 3 ? stIdx >= k : stIdx >= 4) ? 1 : 0;
        if (k > 0) out += line([sx(k - 1) + 10, py + 1, pz + 3], [sx(k), py + 1, pz + 3], lit ? "ra" : "sf");
        out += box(sx(k), py - 3, pz + 3, 10, 8, 8 + (k === 3 ? 4 : 0), lit * (k === 3 && stIdx === 4 ? 1 : lit ? .9 : 0));
      }
      // tiny rising bars on the feedback block = 回复率提升
      if (stIdx === 4) for (let b = 0; b < 3; b++) out += line([sx(3) + 2 + b * 3, py + 5, pz + 15], [sx(3) + 2 + b * 3, py + 5, pz + 15 + 3 + b * 3 * Math.min(1, (ph - .58) * 4)], "bgline");

      // game board: 3 player segments, checker tiles
      const tiles = [];
      for (let k = 0; k < 3; k++) for (let c = 0; c < 2; c++) for (let r = 0; r < 4; r++) tiles.push({ k, x: this.zx(k) + c * (T + 2), y: -6 + r * T, alt: (c + r) % 2 });
      tiles.sort((a, b) => (a.x + a.y) - (b.x + b.y));
      for (const t of tiles) {
        const s = v.s[t.k], lift = 3 * s;
        out += box(t.x, t.y, z0 + lift, T + 2 - 1, T - 1, 3, s * (t.alt ? .9 : .55));
      }

      // pawns + segment flags
      const items = [];
      Z.forEach((zn, k) => {
        zn.pawns.forEach(([c, r], j) => items.push({ type: "pawn", k, j, x: this.zx(k) + c * (T + 2) + 8, y: -6 + r * T + 7 }));
        items.push({ type: "flag", k, x: this.zx(k) + 30, y: -4 });
      });
      items.sort((a, b) => (a.x + a.y) - (b.x + b.y));
      const heads = [];
      for (const it of items) {
        const s = v.s[it.k], base = z0 + 3 + 3 * s;
        if (it.type === "flag") {
          out += line([it.x, it.y, base], [it.x, it.y, base + 20], "ln");
          out += poly([[it.x, it.y, base + 20], [it.x, it.y + 9, base + 17], [it.x, it.y, base + 14]], s > .5 ? "rf" : "f");
          continue;
        }
        const bob = s * i.h * Math.abs(Math.sin(i.t * 5 + it.j * 1.7)) * 2.5, z = base + bob;
        out += ell(it.x, it.y, base, 4.2, "f2");
        out += cyl(it.x, it.y, z, 2.6, 6, "f", "f2");
        out += circ([it.x, it.y, z + 9], 3.6, s > .5 ? "rf" : "f");
        if (s > .5) heads.push({ ...it, z: z + 9 });
      }

      // message card: generated → flies from the send block to the selected segment
      const zc = [this.zx(v.sel) + 16, 22];
      const from = [sx(3) + 5, py + 1, pz + 22], to = [zc[0], zc[1], z0 + 34];
      let mp = ph < .3 ? 0 : ph < .58 ? (ph - .3) / .28 : 1;
      mp = mp * mp * (3 - 2 * mp);
      const mx = lerp(from[0], to[0], mp), my = lerp(from[1], to[1], mp), mz = lerp(from[2], to[2], mp) + Math.sin(Math.PI * mp) * 18 + Math.sin(i.t * 3) * 1.2;
      if (ph >= .2) {
        if (mp > 0 && mp < 1) out += pathL([from, [lerp(from[0], mx, .5), lerp(from[1], my, .5), (from[2] + mz) / 2 + 8], [mx, my, mz]], "rd", `opacity=".7"`);
        const w = 20, d = 13, cx = mx - w / 2, cy = my - d / 2;
        out += poly([[cx, cy, mz], [cx + w, cy, mz], [cx + w, cy + d, mz], [cx, cy + d, mz]], "f");
        out += line([cx + 4, cy + 4, mz], [cx + 13, cy + 4, mz], "ln") + line([cx + 4, cy + 7.5, mz], [cx + 10, cy + 7.5, mz], "ln");
        out += poly([[cx + 13, cy + 7, mz], [cx + 18, cy + 10, mz], [cx + 12, cy + 11, mz]], "rf");
        out += glow([mx, my, mz], 16, i.gid, .25 + .4 * i.h);
      }

      // replies pop up above the targeted players; one converts
      if (stIdx === 4) {
        heads.forEach((hd, j) => {
          const a = clamp((ph - .6 - j * .06) / .08); if (a <= 0) return;
          const [X, Y] = P(hd.x, hd.y, hd.z + 8), conv = j === 1;
          const sc = .4 + .6 * a;
          out += `<g transform="translate(${f1(X)} ${f1(Y - 4)}) scale(${sc.toFixed(2)})" opacity="${f1(a)}">`
            + `<rect class="${conv ? "rf" : "f"}" x="-7.5" y="-6" width="15" height="9" rx="3"/>`
            + `<path class="${conv ? "rf" : "f"}" d="M-2,3 L0,6 L2,3 Z"/>`
            + (conv ? `<path class="bgline" d="M-3.2,-1.6 L-1,.6 L3.2,-3.6"/>` : `<circle class="dot" style="fill:var(--mfc-line)" cx="-3.2" cy="-1.5" r=".9"/><circle style="fill:var(--mfc-line)" cx="0" cy="-1.5" r=".9"/><circle style="fill:var(--mfc-line)" cx="3.2" cy="-1.5" r=".9"/>`)
            + `</g>`;
        });
        // feedback loop back to the workflow
        const fb = clamp((ph - .7) / .15);
        if (fb > 0) out += pathL([[zc[0] + 10, zc[1] - 10, z0 + 6], [lerp(zc[0] + 10, sx(3) + 5, .5), -20, z0 + 30], [sx(3) + 5, py + 1, pz + 16]], "rd", `opacity="${f1(fb * .8)}"`);
      }

      const zn = Z[v.sel];
      return { svg: out, readout: `${zn.n} → ${zn.s} · <b>${this.stages[stIdx]}</b>` };
    }
  },

  /* 02 Cookie Cats — three risk tiers; the hovered tier rises with its strategy */
  churn: {
    rest: [-40, 10],
    tiers: [
      { n: "高风险", s: "优先挽留", cnt: 3 },
      { n: "中风险", s: "定向激励", cnt: 5 },
      { n: "低风险", s: "常规运营", cnt: 7 }
    ],
    target(i) {
      let sel = 0, bd = 1e9; for (let k = 0; k < 3; k++) { const [X] = P(-58 + k * 40 + 17, 0); const d = Math.abs(X - i.px); if (d < bd) { bd = d; sel = k; } }
      return { sel, s: [0, 1, 2].map(k => k === sel ? 1 : 0) };
    },
    render(v, i) {
      const T = this.tiers, z0 = -26; let out = "";
      out += pathL([[-62, -34, z0], [-62, 34, z0]], "ds");
      for (let k = 0; k < 3; k++) {
        const x = -58 + k * 40, s = v.s[k], z = z0 + 10 * s, H = 6;
        out += box(x, -22, z, 34, 44, H, s);
        const toks = [];
        for (let j = 0; j < T[k].cnt; j++) { const a = (j * 137.5) * Math.PI / 180, r = 4 + 12 * Math.sqrt((j + .5) / T[k].cnt); toks.push([x + 17 + r * Math.cos(a) * .9, r * Math.sin(a) * 1.1]); }
        toks.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
        for (const [tx, ty] of toks) {
          const bounce = s * i.h * Math.abs(Math.sin(i.t * 6 + tx + ty)) * 3, tz = z + H + bounce;
          out += ell(tx, ty, tz, 3.2, "f2") ;
          out += circ([tx, ty, tz + 4], 3.6, s > .5 ? "rf" : "f");
          const [hx, hy] = P(tx, ty, tz + 4);
          out += `<path class="${s > .5 ? "rf" : "f"}" d="M${f1(hx - 3.4)},${f1(hy - 1.2)} L${f1(hx - 2.8)},${f1(hy - 5.6)} L${f1(hx - .8)},${f1(hy - 3.3)} Z M${f1(hx + 3.4)},${f1(hy - 1.2)} L${f1(hx + 2.8)},${f1(hy - 5.6)} L${f1(hx + .8)},${f1(hy - 3.3)} Z"/>`;
        }
        if (s > .5) out += glow([x + 17, 0, z + 30], 22, i.gid, .25 + .45 * i.h);
      }
      const t = T[v.sel];
      return { svg: out, readout: `AUC 0.894 · ${t.n} → <b>${t.s}</b>` };
    }
  },

  /* 03 URAI Lab — a confidence gate sweeps the samples: left = 人工复核, right = 自动处理 */
  review: {
    rest: [-10, 0],
    tiles: (() => { const a = []; let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) a.push({ i, j, c: clamp((i + .15 + r() * .7) / 5), bx: 3 + r() * 5, by: 3 + r() * 4, bw: 5 + r() * 4, bd: 4 + r() * 4 }); return a; })(),
    target(i) {
      const th = clamp((i.px + 70) / 140, .08, .95);
      return { th, s: this.tiles.map(t => t.c < th ? 1 : 0) };
    },
    render(v, i) {
      const T = this.tiles, z0 = -22, S = 19, ox = -50, oy = -38, gx = ox + v.th * 5 * S - 1.5;
      const tile = (t, k) => {
        const x = ox + t.i * S, y = oy + t.j * S, s = v.s[k], z = z0 + 7 * s;
        let o = box(x, y, z, 15, 15, 2, s * .95);
        const zt = z + 2, q = [[x + t.bx, y + t.by, zt], [x + t.bx + t.bw, y + t.by, zt], [x + t.bx + t.bw, y + t.by + t.bd, zt], [x + t.bx, y + t.by + t.bd, zt]];
        o += poly(q, s > .5 ? "bgline" : "ra");
        if (s <= .5) o += pathL([[x + 9, y + 10, zt], [x + 10.5, y + 12, zt], [x + 13, y + 8, zt]], "ln");
        return o;
      };
      const order = T.map((t, k) => ({ t, k })).sort((a, b) => (a.t.i + a.t.j) - (b.t.i + b.t.j));
      let out = "";
      for (const o of order) if (ox + o.t.i * S + 15 <= gx) out += tile(o.t, o.k);
      out += poly([[gx, oy - 6, z0 - 2], [gx, oy + 4 * S + 2, z0 - 2], [gx, oy + 4 * S + 2, z0 + 34], [gx, oy - 6, z0 + 34]], "rf", `opacity="${f1(.08 + .1 * i.h)}"`);
      out += poly([[gx, oy - 6, z0 - 2], [gx, oy + 4 * S + 2, z0 - 2], [gx, oy + 4 * S + 2, z0 + 34], [gx, oy - 6, z0 + 34]], "rd");
      for (const o of order) if (ox + o.t.i * S + 15 > gx) out += tile(o.t, o.k);
      const n = v.s.filter(s => s > .5).length;
      return { svg: out, readout: `阈值 ${v.th.toFixed(2)} · 人工复核 <b>${n}</b> / ${T.length} · 自动 ${T.length - n}` };
    }
  }
};

/* =========================================================
   Card controller — pointer → eased state → render
   ========================================================= */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = matchMedia("(hover: hover)").matches;
const VB = { x: -96, y: -76, w: 192, h: 132 };
const cards = [];

function deepEase(cur, tgt, k) {
  if (typeof tgt === "number") return cur == null ? tgt : cur + (tgt - cur) * k;
  if (Array.isArray(tgt)) return tgt.map((t, j) => deepEase(cur ? cur[j] : null, t, k));
  return tgt;
}
function delta(a, b) {
  if (typeof b === "number") return Math.abs((a ?? b) - b);
  if (Array.isArray(b)) return b.reduce((s, t, j) => s + delta(a?.[j], t), 0);
  if (b && typeof b === "object") return Object.keys(b).reduce((s, key) => s + delta(a?.[key], b[key]), 0);
  return 0;
}

document.querySelectorAll(".m-featured-cards .pc").forEach((el, idx) => {
  const sc = SCENES[el.dataset.scene], gid = "glow" + idx;
  const stage = el.querySelector(".stage");
  let dots = ""; let seed = idx * 97 + 13; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let k = 0; k < 26; k++) dots += `<circle class="dot" cx="${f1(VB.x + rnd() * VB.w)}" cy="${f1(VB.y + rnd() * VB.h * .8)}" r="${f1(.5 + rnd() * .6)}"/>`;
  stage.innerHTML = `<i class="br tl"></i><i class="br tr"></i><i class="br bl"></i><i class="br bm"></i>
    <svg viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" aria-hidden="true"><defs><radialGradient id="${gid}"><stop offset="0" stop-color="#e84632" stop-opacity=".55"/><stop offset="1" stop-color="#e84632" stop-opacity="0"/></radialGradient></defs><g>${dots}</g><g class="scene"></g></svg>
    <span class="readout"></span>`;
  el.querySelector(".cta i").innerHTML = `<svg viewBox="0 0 10 10"><path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="#fff" stroke-width="1.4"/></svg>`;
  const svg = stage.querySelector("svg"), g = stage.querySelector(".scene"), ro = stage.querySelector(".readout");
  const st = { el, sc, svg, g, ro, gid, on: false, auto: false,
    tgt: { px: sc.rest[0], py: sc.rest[1], h: 0, u: .5, v: .5 },
    cur: { px: sc.rest[0], py: sc.rest[1], h: 0, u: .5, v: .5 }, val: null, dirty: true };
  cards.push(st);

  const toSvg = e => {
    const r = svg.getBoundingClientRect(), s = Math.min(r.width / VB.w, r.height / VB.h);
    const ox = (r.width - VB.w * s) / 2, oy = (r.height - VB.h * s) / 2;
    const c = el.getBoundingClientRect();
    const F = st.fit || { sc: 1, tx: 0, ty: 0 };
    return { px: (VB.x + (e.clientX - r.left - ox) / s - F.tx) / F.sc, py: (VB.y + (e.clientY - r.top - oy) / s - F.ty) / F.sc, u: clamp((e.clientX - c.left) / c.width), v: clamp((e.clientY - c.top) / c.height) };
  };
  const activate = on => { st.on = on; el.classList.toggle("is-on", on); st.tgt.h = on ? 1 : 0; if (!on) Object.assign(st.tgt, { px: sc.rest[0], py: sc.rest[1], u: .5, v: .5 }); kick(); };
  el.addEventListener("pointerenter", e => { if (e.pointerType === "mouse" || e.pointerType === "pen") { activate(true); Object.assign(st.tgt, toSvg(e)); } });
  el.addEventListener("pointermove", e => { if (st.on && !st.auto) { Object.assign(st.tgt, toSvg(e)); kick(); } });
  el.addEventListener("pointerleave", e => { if (e.pointerType !== "touch") activate(false); });
  el.addEventListener("focus", () => { activate(true); Object.assign(st.tgt, { px: -sc.rest[0], py: sc.rest[1] - 10 }); });
  el.addEventListener("blur", () => activate(false));
  st.activate = activate;
});

/* touch: auto-activate the card nearest the viewport centre and sweep its scene */
if (!reduce && !canHover && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    const st = cards.find(c => c.el === e.target); st.auto = e.isIntersecting; st.activate(e.isIntersecting);
  }), { rootMargin: "-42% 0px -42% 0px" });
  cards.forEach(c => io.observe(c.el));
}

let raf = 0, last = performance.now();
function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
function tick(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; raf = 0;
  const k = reduce ? 1 : 1 - Math.exp(-dt * 11), t = reduce ? 0 : now / 1000;
  let busy = false;
  for (const st of cards) {
    if (st.auto) { st.tgt.px = Math.sin(t * .9) * 60; st.tgt.py = Math.cos(t * .7) * 35; st.tgt.u = .5 + Math.sin(t * .9) * .4; st.tgt.v = .5; }
    const before = delta({ h: st.cur.h, u: st.cur.u, v: st.cur.v }, { h: st.tgt.h, u: st.tgt.u, v: st.tgt.v }) + delta({ px: st.cur.px, py: st.cur.py }, { px: st.tgt.px, py: st.tgt.py }) / 100;
    for (const key in st.tgt) st.cur[key] = before < .02 ? st.tgt[key] : st.cur[key] + (st.tgt[key] - st.cur[key]) * k;
    const inp = { ...st.cur, t, gid: st.gid };
    const tv = st.sc.target(inp, st.val);
    const moving = before > 0 || !st.val || delta(st.val, tv) > .002 || (st.on && !reduce);
    if (!moving && !st.dirty) continue;
    st.val = deepEase(st.val, tv, reduce ? 1 : 1 - Math.exp(-dt * 9));
    if (typeof tv.sel === "number") st.val.sel = tv.sel;
    const r = st.sc.render(st.val, inp);
    st.g.innerHTML = r.svg; st.ro.innerHTML = r.readout; st.dirty = false;
    if (!st.fit) {
      const b = st.g.getBBox(), padX = 14, top = 12, bottom = 20;
      const aw = VB.w - padX * 2, ah = VB.h - top - bottom, sc = Math.min(aw / b.width, ah / b.height) * .97;
      const tx = VB.x + padX + aw / 2 - (b.x + b.width / 2) * sc, ty = VB.y + top + ah / 2 - (b.y + b.height / 2) * sc;
      st.fit = { sc, tx, ty }; st.g.setAttribute("transform", `translate(${f1(tx)} ${f1(ty)}) scale(${sc.toFixed(3)})`);
    }
    // card tilt
    const h = st.cur.h;
    if (!reduce) {
      st.el.style.setProperty("--mfc-rx", f1((.5 - st.cur.v) * 9 * h) + "deg");
      st.el.style.setProperty("--mfc-ry", f1((st.cur.u - .5) * 12 * h) + "deg");
      st.el.style.setProperty("--mfc-rz", f1((st.cur.u - .5) * -1.6 * h) + "deg");
      st.el.style.setProperty("--mfc-lift", f1(-6 * h) + "px");
      st.el.style.setProperty("--mfc-sc", (1 + .035 * h).toFixed(3));
    }
    busy = true;
  }
  if (busy) raf = requestAnimationFrame(tick);
}
kick();
