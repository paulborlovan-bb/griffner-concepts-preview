/* ERZEUGT von tools/jh-moment.mjs aus journey/weg.js (drawMoment, Runde 23). Nicht von Hand ändern.
   Aufruf: drawMoment.call({ ctx, red }, k, pos, cx, cz, top, A0, tc, pr, NEAR) */
export function drawMoment(k, pos, cx, cz, top, A0, tc, pr, NEAR) {
    const lt = pos - k; if (lt < -.4 || lt > 1.3) return;
    const x = this.ctx, cl = v => v < 0 ? 0 : v > 1 ? 1 : v, rp = (v, a, b) => cl((v - a) / (b - a)), sm = v => v * v * (3 - 2 * v), eo = v => 1 - Math.pow(1 - v, 3), eio = v => v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
    const red = this.red, env = A0; if (env <= .01) return;
    const g = red ? 1 : (k === 13 ? rp(lt, -.4, -.02) : k === 3 ? rp(lt, -.26, .26) : rp(lt, -.3, .22)), gp = (a, b) => red ? 1 : eio(rp(g, a, b));
    const INK = '#000000', YE = '#FFB200', WH = '#FFFFFF', PI = Math.PI;
    let MS = 1; const W3 = (u, v, y) => tc(cx + u * MS, top + y * MS, cz + v * MS);
    const Pq = q => { if (q.some(c => c[2] < NEAR)) return false; x.beginPath(); q.forEach((c, i) => { const s = pr(c); i ? x.lineTo(s[0], s[1]) : x.moveTo(s[0], s[1]); }); x.closePath(); return true; };
    const fillQ = (q, col, a) => { if (a > .005 && Pq(q)) { x.globalAlpha = Math.min(1, a) * env; x.fillStyle = col || INK; x.fill(); } };
    const strQ = (q, a, col, w) => { if (a > .005 && Pq(q)) { x.globalAlpha = Math.min(1, a) * env; x.strokeStyle = col || INK; x.lineWidth = w || 1.6; x.stroke(); } };
    const R = (u0, u1, v0, v1, y) => [W3(u0, v0, y || .5), W3(u1, v0, y || .5), W3(u1, v1, y || .5), W3(u0, v1, y || .5)];
    const pl = (pts, f, a, col, w, dash) => {
      if (f <= 0 || a <= .005) return; const P3 = pts.map(p => W3(p[0], p[1], p[2] == null ? .5 : p[2])); if (P3.some(c => c[2] < NEAR)) return;
      let tot = 0; const L = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], (pts[i][2] || 0) - (pts[i - 1][2] || 0)); L.push(d); tot += d; }
      let rem = tot * Math.min(1, f); x.globalAlpha = Math.min(1, a) * env; x.strokeStyle = col || INK; x.lineWidth = w || 1.6; x.lineCap = 'square'; x.setLineDash(dash || []); x.beginPath();
      let s = pr(P3[0]); x.moveTo(s[0], s[1]);
      for (let i = 1; i < pts.length && rem > 0; i++) { const kk = Math.min(1, rem / (L[i - 1] || 1)); rem -= L[i - 1]; const a0 = pts[i - 1], b0 = pts[i]; s = pr(W3(a0[0] + (b0[0] - a0[0]) * kk, a0[1] + (b0[1] - a0[1]) * kk, (a0[2] == null ? .5 : a0[2]) + (((b0[2] == null ? .5 : b0[2]) - (a0[2] == null ? .5 : a0[2])) * kk))); x.lineTo(s[0], s[1]); }
      x.stroke(); x.setLineDash([]); x.lineCap = 'butt';
    };
    const box = (u0, u1, v0, v1, y0, y1, o) => {
      o = o || {}; const a = o.a == null ? 1 : o.a; if (a <= .005) return;
      if (y1 - y0 < .6) { fillQ(R(u0, u1, v0, v1, y0 + .5), o.fill || INK, a); return; }
      const c = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], F = [];
      for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; F.push({ q: [W3(p[0], p[1], y0), W3(q[0], q[1], y0), W3(q[0], q[1], y1), W3(p[0], p[1], y1)], col: o.fill || INK }); }
      F.push({ q: R(u0, u1, v0, v1, y1), col: o.top || o.fill || INK });
      F.forEach(f => { f.z = f.q.reduce((s, c) => s + c[2], 0) / 4; });
      F.sort((p, q) => q.z - p.z).forEach(f => { fillQ(f.q, f.col, a); strQ(f.q, a * .9, o.edge || YE, 1); });
    };
    const rbox = (cu, cv, w, d, y0, y1, ang, o) => {
      o = o || {}; const cs = Math.cos(ang), sn = Math.sin(ang), c = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([a, b]) => [cu + a * cs - b * sn, cv + a * sn + b * cs]), F = [];
      for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; F.push({ q: [W3(p[0], p[1], y0), W3(q[0], q[1], y0), W3(q[0], q[1], y1), W3(p[0], p[1], y1)], col: o.fill || INK }); }
      F.push({ q: c.map(([a, b]) => W3(a, b, y1)), col: o.top || o.fill || INK });
      F.forEach(f => { f.z = f.q.reduce((s, q) => s + q[2], 0) / 4; }); F.sort((p, q) => q.z - p.z).forEach(f => { fillQ(f.q, f.col, 1); strQ(f.q, .9, o.edge || YE, 1); });
    };
    const mixC = (A, B, t) => { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), a = h(A), b = h(B); return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')'; };
    const boxes = L => L.filter(b => b).map(b => ({ b, z: W3((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, 0)[2] })).sort((p, q) => q.z - p.z).forEach(({ b }) => box(...b));
    const arc = (cu, cv, r, a0, a1, n) => Array.from({ length: (n || 14) + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / (n || 14); return [cu + Math.cos(a) * r, cv + Math.sin(a) * r]; });
    const loop = (u0, u1, v0, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1], [u0, v0]];
    const boxE = (u0, u1, v0, v1, y0, y1) => { const c = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], e = []; for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; e.push([[p[0], p[1], y0], [q[0], q[1], y0]]); } for (let i = 0; i < 4; i++) { const p = c[i]; e.push([[p[0], p[1], y0], [p[0], p[1], y1]]); } for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; e.push([[p[0], p[1], y1], [q[0], q[1], y1]]); } return e; };
    const seq = (E, f, a, col, w, dash) => { const n = E.length; E.forEach((e, i) => pl(e, cl(f * n - i), a, col, w, dash)); };
    const PLAN = [loop(-120, 120, -90, 90), [[-20, -90], [-20, 25]], [[-120, 25], [-20, 25]], [[50, -90], [50, 90]]];
    const LO = [-140, 100, -60, 60, 0, 44], UP = [-60, 140, -53, 53, 44, 83];
    const HB = (s, du, dv) => { du = du || 0; dv = dv || 0; const f = b => [b[0] * s + du, b[1] * s + du, b[2] * s + dv, b[3] * s + dv, b[4] * s, b[5] * s]; return { L: f(LO), U: f(UP), wL: [-129 * s + du, -36 * s + du, 5 * s, 38 * s], wU: [20 * s + du, 129 * s + du, 51 * s, 77 * s], dr: [-22 * s + du, -6 * s + du, 0, 32 * s] }; };
    const lerpB = (A, B, t) => A.map((v, i) => v + (B[i] - v) * t);
    const pop = v => v <= 0 ? 0 : v >= 1 ? 1 : 1 - Math.pow(1 - v, 3);
    const faceQ = (v, u0, u1, y0, y1) => [W3(u0, v, y0), W3(u1, v, y0), W3(u1, v, y1), W3(u0, v, y1)];
    const winF = (h, aL, aU, col) => { const w = h.wL, u = h.wU; fillQ(faceQ(h.L[2] - .8, w[0], w[1], w[2], w[3]), col || WH, aL); fillQ(faceQ(h.U[2] - .8, u[0], u[1], u[2], u[3]), col || WH, aU == null ? aL : aU); };
    const tip = (E, f) => { const n = E.length, i = Math.min(n - 1, Math.floor(f * n)), q = f * n - i, e = E[i], P = e[0].map((v, d) => v + ((e[1][d] == null ? .5 : e[1][d]) - (v == null ? .5 : v)) * q); if (f > 0 && f < 1) box(P[0] - 4, P[0] + 4, P[1] - 4, P[1] + 4, (P[2] || 0), (P[2] || 0) + 9); };
    const siteDraw = G => {
        const h4 = HB(.72, -30, 14), L4 = h4.L, U4 = h4.U, uFace = (u, v0, v1, y0, y1) => [W3(u, v0, y0), W3(u, v1, y0), W3(u, v1, y1), W3(u, v0, y1)];
        const ga = G(0, .12); fillQ(R(-150, 150, -118, 118, .7), '#8B907C', ga * .9);
        pl(loop(-146, 146, -114, 114), G(.06, .26), .9, INK, 1);
        const da = G(.3, .44), dU0 = (h4.dr[0] + h4.dr[1]) / 2 - 14, dU1 = dU0 + 28;
        fillQ(R(dU0, dU1, -114, L4[2], .9), '#CACACA', da); for (let n = 1; n < 6; n++) { const v = -114 + (L4[2] + 114) * n / 6; pl([[dU0, v, 1.2], [dU1, v, 1.2]], da, .35, INK, .6); }
        fillQ(R(-138, -66, -108, -62, .9), '#CACACA', G(.36, .5)); [-114, -90].forEach(u => pl([[u, -108, 1.2], [u, -62, 1.2]], G(.4, .52), .5, INK, .8));
        for (let n = 0; n < 16; n++) { const u = -144 + n * 19.2; if (u > dU0 - 4 && u < dU1 + 4) continue; const f = G(.1 + n * .008, .24 + n * .008); if (f > 0) pl([[u, -114, 0], [u, -114, 11 * f]], 1, .9, INK, 1); }
        pl([[-146, -114, 9], [dU0 - 4, -114, 9]], G(.2, .3), .9, INK, 1); pl([[dU1 + 4, -114, 9], [146, -114, 9]], G(.22, .34), .9, INK, 1);
        const tA = G(.46, .6); fillQ(R(L4[1], L4[1] + 34, -14, 60, .9), '#CFC3B3', tA); for (let n = 1; n < 5; n++) pl([[L4[1], -14 + n * 14.8, 1.2], [L4[1] + 34, -14 + n * 14.8, 1.2]], tA, .3, INK, .6);
        const pa = G(.54, .7); fillQ(R(L4[1] + 38, 140, -24, 74, .9), '#CACACA', pa); fillQ(R(L4[1] + 44, 134, -18, 68, 1.1), WH, pa); strQ(R(L4[1] + 44, 134, -18, 68, 1.2), pa, INK, 1.1); for (let n = 1; n < 6; n++) pl([[L4[1] + 44, -18 + n * 14.3, 1.3], [134, -18 + n * 14.3, 1.3]], pa, .3, INK, .6);
        const tree = (u, v, n) => { const tr = G(.64 + n * .04, .8 + n * .04); if (tr <= 0) return; pl([[u, v, 0], [u, v, 34 * tr]], 1, 1, INK, 1.6); const cr = arc(u, v, 16 * tr, 0, 2 * PI, 20); fillQ(cr.map(([a, b]) => W3(a, b, 34 * tr)), INK, 1); pl(cr.map(([a, b]) => [a, b, 34 * tr]), 1, 1, WH, 1); };
        [[-126, 96], [-60, 104], [10, 102], [128, 98]].forEach(([u, v], n) => tree(u, v, n));
        const hl = (L4[5]) * G(.12, .38), hu = (U4[5] - U4[4]) * G(.34, .56);
        if (hl > .6) box(L4[0], L4[1], L4[2], L4[3], 0, hl); if (hu > .6) box(U4[0], U4[1], U4[2], U4[3], U4[4], U4[4] + hu);
        const wa = G(.6, .8);
        winF(h4, wa, G(.66, .86)); fillQ(faceQ(L4[2] - .8, h4.dr[0], h4.dr[1], 0, h4.dr[3]), WH, wa);
        tree(128, -92, 4);
      return { h4: HB(.72, -30, 14) };
    };
    switch (k) {
      case 0: {
        const ext = e => { const [a, b] = e, d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d) || 1, q = 10 / l; return [[a[0] - d[0] * q, a[1] - d[1] * q, a[2] - d[2] * q], [b[0] + d[0] * q, b[1] + d[1] * q, b[2] + d[2] * q]]; };
        seq(boxE(...LO).concat(boxE(...UP)).map(ext), red ? 1 : rp(g, 0, .9), .9, INK, 1.3); break;
      }
      case 1: {
        [[-150, -115], [150, -115], [150, 115], [-150, 115]].forEach(([u, v], n) => { const h = 30 * pop(gp(n * .05, .16 + n * .05)); if (h > .6) box(u - 4, u + 4, v - 4, v + 4, 0, h); });
        pl(loop(-150, 150, -115, 115), gp(.14, .34), 1, INK, 1.6);
        pl(loop(-118, 118, -83, 83), gp(.3, .46), .8, INK, 1, [6, 4]);
        [[-150, 0, -118, 0], [0, -115, 0, -83]].forEach(([a, b, c, d]) => { pl([[a, b], [c, d]], gp(.38, .48), .7, INK, .8); });
        const SA = Array.from({ length: 21 }, (_, n) => { const a = PI - PI * n / 20; return [Math.cos(a) * 165, 95, 20 + Math.sin(a) * 140]; });
        pl(SA, gp(.36, .62), 1, WH, 1.2, [3, 5]);
        const sp = gp(.4, .7); if (sp > 0 && sp < 1) { const a = PI - PI * sp; fillQ(R(Math.cos(a) * 165 - 6, Math.cos(a) * 165 + 6, 89, 101, 20 + Math.sin(a) * 140), WH, 1); }
        const dl = red ? 1 : eio(rp(g, .58, .9)), th = .9 * (1 - dl), dy = 150 * (1 - dl), cs = Math.cos(th), sn = Math.sin(th), S2 = .62;
        const T3 = p => [(p[0] * cs - p[1] * sn) * S2, (p[0] * sn + p[1] * cs) * S2, p[2] * S2 + dy];
        const ha = gp(.56, .64);
        if (ha > 0) {
          if (dl > .02) { const sh = [[LO[0], LO[2]], [LO[1], LO[2]], [LO[1], LO[3]], [LO[0], LO[3]]].map(([u, v]) => { const q = T3([u, v, 0]); return W3(q[0], q[1], .8); }); fillQ(sh, INK, .25 * dl); }
          boxE(...LO).concat(boxE(...UP)).forEach(e => pl(e.map(T3), 1, ha, INK, 1.4));
          if (dl >= 1) { const fa = gp(.86, 1), h1 = HB(S2, 0); if (fa > .02) { const l = h1.L.slice(), u2 = h1.U.slice(); l[5] *= fa; u2[4] = l[5]; u2[5] = l[5] + (h1.U[5] - h1.U[4]) * fa; boxes([l, u2]); } }
        }
        break;
      }
      case 2: {
        const Hs = [44, 26, 36, 58, 20], tot = Hs.reduce((s, v) => s + v, 0), W2 = 22;
        pl([[-135, -30], [135, -30]], gp(0, .14), 1, INK, 1.2);
        const B = []; let acc = 0;
        Hs.forEach((h, n) => {
          const u0 = -100 + n * 50, gr = red ? 1 : eo(rp(g, n * .05, .26 + n * .05)), st = red ? 1 : eio(rp(g, .4 + n * .07, .62 + n * .07));
          const u = u0 + (0 - u0) * st, y0 = acc * st, w = 16 + (W2 - 16) * st, d = 16 + (W2 - 16) * st;
          acc += h; if (gr > 0) B.push({ b: [u - w, u + w, -d, d, y0, y0 + h * gr], st, z: W3(u, 0, 0)[2] });
        });
        B.sort((p, q) => p.st === 1 && q.st === 1 ? p.b[4] - q.b[4] : q.z - p.z || p.b[4] - q.b[4]).forEach(({ b }) => box(...b));
        if (gp(.9, 1) > 0) { let y = 0; Hs.forEach((h, n) => { y += h; if (n < 4) pl([[-W2, -W2 - .6, y], [W2, -W2 - .6, y]], gp(.9, 1), .5, WH, 1); }); }
        const ty = tot + 6, la = gp(.86, 1); pl([[-60, -W2 - 2, ty], [60, -W2 - 2, ty]], la, 1, WH, 2);
        break;
      }
      case 3: {
        const s2 = .8, v1 = [LO, UP], v2 = [LO.map(v => v * s2), UP.map(v => v * s2)], v3 = [[-140, 140, -55, 55, 0, 40], [-140, 140, -55, 55, 40, 74]];
        const a = red ? 1 : eo(rp(g, 0, .12)), t2 = red ? 0 : eio(rp(g, .22, .34)), t3 = red ? 0 : eio(rp(g, .44, .56)), t1 = red ? 0 : eio(rp(g, .66, .8));
        const B = [0, 1].map(n => { let b = lerpB(v1[n], v2[n], t2); b = lerpB(b, v3[n], t3); b = lerpB(b, v1[n], t1); return b; });
        if (a > 0) { const l = B[0].slice(), u2 = B[1].slice(); l[5] *= a; u2[4] = l[5]; u2[5] = l[5] + (B[1][5] - B[1][4]) * a; if (l[5] > .6) box(...l); if (u2[5] - u2[4] > .6) box(...u2); }
        const act = t1 > .5 ? 0 : t3 > .5 ? 2 : t2 > .5 ? 1 : 0;
        if (red || g > .8) winF(HB(1), gp(.8, .9), gp(.84, .94));
        [-26, 0, 26].forEach((u, n) => { const q = R(u - 8, u + 8, -112, -96); strQ(q, 1, INK, 1.2); if (n === act) fillQ(q, INK, 1); });
        break;
      }
      case 4: {
        siteDraw(gp);
        break;
      }
      case 5: {
        MS = 1.5;
        const SA = '#CFC3B3', SB = '#8B907C', KA = '#CACACA', AN = '#444442', KU = '#887254', ST = '#555553';
        const B = (b, f, t, e) => box(b[0], b[1], b[2], b[3], b[4], b[5], { fill: f, top: t || f, edge: e || INK });
        const fl = red ? 1 : eo(rp(g, 0, .12)), fu = 110 * fl, fv = 70 * fl;
        if (fl > .01) { fillQ(R(-fu, fu, -fv, fv, 1), SA, 1); for (let n = 1; n < 22; n++) { const u = -110 + n * 10; if (Math.abs(u) < fu) pl([[u, -fv, 1.3], [u, fv, 1.3]], 1, .07, INK, 1); } }
        const wh = 84 * gp(.06, .2);
        if (wh > .6) { box(-110, 110, 64, 70, 0, wh, { fill: KA, top: WH, edge: AN }); box(104, 110, -70, 64, 0, wh, { fill: KA, top: WH, edge: AN }); }
        if (wh > 40) {
          const c1 = gp(.6, .7), c2 = gp(.7, .8), col = c2 > 0 ? mixC(SB, AN, c2) : mixC(KA, SB, c1);
          fillQ(faceQ(63.5, -108, -26, 0, Math.min(wh, 84)), col, gp(.2, .26));
          const gw = gp(.2, .28); fillQ([W3(103.5, -66, 3), W3(103.5, 10, 3), W3(103.5, 10, Math.min(wh, 81)), W3(103.5, -66, Math.min(wh, 81))], WH, gw);
          for (let n = 1; n < 3; n++) pl([[103.2, -66 + n * 25.3, 3], [103.2, -66 + n * 25.3, Math.min(wh, 81)]], gw, .35, AN, 1);
        }
        const kc = gp(.24, .38);
        if (kc > .02) { const h = 80 * kc; B([20, 102, 54, 64, 0, h], AN, AN); if (kc > .98) { for (let n = 1; n < 5; n++) pl([[20 + n * 16.4, 53.4, 2], [20 + n * 16.4, 53.4, 78]], 1, .35, INK, 1); pl([[20, 53.4, 36], [102, 53.4, 36]], 1, .5, KA, 1); fillQ(R(20, 102, 54, 64, 80.3), WH, .0); } }
        const is = gp(.32, .44); if (is > .02) { B([30, 92, 18, 34, 0, 20 * is], AN, AN); B([28, 94, 16, 36, 20 * is, 22.5 * is], WH, WH, KA); if (is > .98) { pl([[48, 24, 22.8], [58, 24, 22.8]], 1, .7, INK, 1.4); pl([[48, 29, 22.8], [58, 29, 22.8]], 1, .7, INK, 1.4); } }
        [38, 61, 84].forEach((u, n) => { const sp = red ? 1 : eio(rp(g, .4 + n * .03, .5 + n * .03)); if (sp <= 0) return; const v = 8 - (1 - sp) * 40; B([u - 4, u + 4, v - 4, v + 4, 0, 13], AN, KU); });
        const dt = red ? 1 : eio(rp(g, .44, .58)), du = (1 - dt) * 80;
        if (dt > 0) {
          [[38, -50], [82, -50], [38, -32], [82, -32]].forEach(([u, v]) => B([u - 1.2 + du, u + 1.2 + du, v - 1.2, v + 1.2, 0, 16], INK));
          B([34 + du, 86 + du, -54, -28, 16, 18], SA, SA, AN);
        }
        [[44, -62], [76, -62], [44, -20], [76, -20], [92, -41]].forEach(([u, v], n) => { const cp = pop(gp(.54 + n * .025, .64 + n * .025)); if (cp > .02) { B([u - 5, u + 5, v - 4, v + 4, 0, 9 * cp], AN); B([u - 5, u + 5, v + (v < -41 ? -4 : 3), v + (v < -41 ? -3 : 4), 9 * cp, 18 * cp], AN); } });
        const rg = gp(.5, .62); if (rg > 0) fillQ(R(-100, -100 + 80 * rg, -50, 30, 1.6), KA, 1);
        const sl = red ? 1 : eio(rp(g, .54, .7)), su = (1 - sl) * -90;
        if (sl > 0) { B([-106 + su, -96 + su, -56, 36, 0, 24], AN); B([-96 + su, -78 + su, -56, 36, 0, 10], AN); fillQ(R(-95 + su, -79 + su, -54, 34, 10.4), ST, 1); B([-96 + su, -60 + su, 26, 36, 0, 24], AN); B([-96 + su, -60 + su, 8, 26, 0, 10], AN); }
        const ct = pop(gp(.62, .72)); if (ct > .02) { B([-64, -42, -22, 2, 0, 6 * ct], INK, INK, AN); B([-65, -41, -23, 3, 6 * ct, 7.5 * ct], WH, WH, KA); }
        const ar = red ? 1 : eio(rp(g, .64, .8)); if (ar > 0) rbox(-26 + (1 - ar) * 40, -38 - (1 - ar) * 30, 20, 20, 0, 12, -2.4 + (1 - ar) * 2.2, { fill: KU, top: KU, edge: INK });
        const sb = gp(.66, .76); if (sb > .02) { B([-100, -40, 56, 64, 0, 14 * sb], WH, WH, KA); }
        const tr = gp(.72, .86); if (tr > 0) { B([-24, -14, 52, 62, 0, 10], AN); const cr = arc(-19, 57, 13 * tr, 0, 2 * PI, 18); fillQ(cr.map(([a, b]) => W3(a, b, 10 + 34 * tr)), SB, 1); pl(cr.map(([a, b]) => [a, b, 10 + 34 * tr]), 1, 1, INK, .8); pl([[-19, 57, 10], [-19, 57, 10 + 34 * tr]], 1, 1, INK, 1); }
        const la = gp(.82, .9); [50, 70].forEach(u => pl([[u, -41, 110], [u, -41, 44]], la, .8, INK, .8));
        if (la > 0) { const on = gp(.9, .98); [50, 70].forEach(u => B([u - 5, u + 5, -46, -36, 38, 44], on > .5 ? WH : INK, on > .5 ? WH : INK, on > .5 ? KA : AN)); fillQ(R(34, 86, -54, -28, 18.5), WH, .4 * on); fillQ(R(-90, -55, -45, 25, 1.9), WH, .12 * on); }
        break;
      }
      case 6: {
        const d = red ? 1 : eo(rp(g, 0, .2)), y = 2 + (1 - d) * 140;
        if (d > .01) box(-120, 120, -150, 150, y, y + 2, { fill: WH, top: WH, edge: INK });
        [125, 105, 85, 65, 45, 25, 5].forEach((v, i) => pl([[-96, v, y + 3], [i % 3 === 2 ? 30 : 96, v, y + 3]], gp(.2 + i * .03, .3 + i * .03), .55, INK, 1.5));
        pl([[-96, -95, y + 3], [-14, -95, y + 3]], gp(.42, .48), .8, INK, 1.2); pl([[14, -95, y + 3], [96, -95, y + 3]], gp(.44, .5), .8, INK, 1.2);
        const sig = (u0, f) => { const P = Array.from({ length: 26 }, (_, i) => [u0 + i * 3.1, -80 + Math.sin(i * .9) * 11 * (1 - i / 34) + (i < 5 ? -i * 1.5 : 0), y + 3.2]); pl(P, f, 1, INK, 2.2); if (f > 0 && f < 1) { const i = Math.min(25, Math.floor(f * 25)); pl([[P[i][0], P[i][1], y + 3], [P[i][0] + 16, P[i][1] - 12, y + 46]], 1, 1, INK, 3); } };
        sig(-92, gp(.5, .7)); sig(18, gp(.74, .94)); break;
      }
      case 7: {
        const ta = red ? 1 : eo(rp(g, 0, .14)), ty = (1 - ta) * 90, Y = 16 + ty + .6, P = pts => pts.map(([u, v]) => [u, v, Y]);
        const seats = [[-70, -72], [0, -72], [70, -72], [-70, 72], [0, 72], [70, 72]];
        const SL = seats.map(([u, v], n) => { const s = gp(.1 + n * .04, .24 + n * .04); return s > .04 ? [u - 12, u + 12, v - 9, v + 9, 0, 14 * s] : null; });
        boxes(SL.filter((b, n) => b && seats[n][1] < 0));
        if (ta > 0) box(-115, 115, -55, 55, ty, 16 + ty, { fill: INK, top: WH });
        boxes(SL.filter((b, n) => b && seats[n][1] > 0));
        if (ta > 0) {
          const tl = gp(.3, .5); pl(P([[-95, 8], [95, 8]]), tl, 1, INK, 1.6);
          [[-95, .44], [-35, .5], [25, .55]].forEach(([u, a]) => { const m = gp(a, a + .06); if (m > 0) fillQ(R(u - 3.5, u + 3.5, 4.5, 11.5, Y + .1), INK, m); });
          const hv = gp(.58, .66); if (hv > 0) { strQ(R(85, 103, -2, 18, Y + .1), hv, INK, 1.4); pl(P([[85, -2], [94, -10], [103, -2]]), hv, 1, INK, 1.4); }
          const rows = [-40, -30, -20], done = red ? 3 : Math.floor(rp(g, .72, .98) * 4);
          rows.forEach((v, n) => { const ra = gp(.6 + n * .04, .7 + n * .04); if (ra <= 0) return; strQ(R(-95, -89, v - 3, v + 3, Y + .1), ra, INK, 1); if (n < done) fillQ(R(-95, -89, v - 3, v + 3, Y + .1), INK, 1); pl(P([[-83, v], [-83 + 60 * ra, v]]), 1, .6, INK, 1); pl(P([[-10, v], [-10 + 22 * ra, v]]), 1, .4, INK, 1); });
          const wk = red ? 12 : rp(g, .68, 1) * 12;
          for (let n = 0; n < 12; n++) { const u = -92 + n * 16.5, wa = gp(.62 + n * .006, .66 + n * .006); if (wa <= 0) continue; const q = R(u - 5, u + 5, 26, 36, Y + .1);
            if (n < Math.floor(wk)) fillQ(q, INK, 1); else strQ(q, wa * (n === Math.floor(wk) ? 1 : .45), INK, 1); }
          if (wk > 0 && wk < 12) { const u = -92 + wk * 16.5; pl(P([[u, 22], [u, 40]]), 1, 1, INK, 2); }
        }
        break;
      }
      case 8: {
        let tp = 0; for (let i = 0; i < 4; i++) { const tt = red ? 1 : eo(rp(g, i * .08, i * .08 + .25)); if (tt <= 0) continue; const y = i * 6 + (1 - tt) * 160; box(-80 + (i % 2) * 6, 80 + (i % 2) * 6, -62, 62, y, y + 3, { fill: WH, top: WH, edge: INK }); tp = i * 6 + 3; }
        const dn = red ? 1 : eo(rp(g, .5, .66)), upS = red ? 1 : sm(rp(g, .76, .95)), ys = tp + 160 * (1 - dn) + 160 * upS;
        if (dn >= 1) { fillQ(R(-36, 36, -36, 36, tp + .8), INK, 1); strQ(R(-28, 28, -28, 28, tp + 1), 1, WH, 1.4); }
        if (rp(g, .42, .5) > 0 && upS < 1) { const yy = ys + 240 * (1 - sm(rp(g, .42, .5))) + 200 * sm(rp(upS, .4, 1)); box(-36, 36, -36, 36, yy, yy + 22); box(-9, 9, -9, 9, yy + 22, yy + 80); }
        break;
      }
      case 9: {
        const E = boxE(...LO).concat(boxE(...UP)); seq(E, gp(0, .3), .7, INK, 1.2);
        const kb = pop(gp(.3, .5)), bb = pop(gp(.38, .58));
        boxes([kb > 0 ? [-125, -75, 22, 52, 0, 18 * kb] : null, bb > 0 ? [40, 80, 22, 52, 0, 18 * bb] : null]);
        pl([[-130, -50, 1], [-20, -50, 1], [-20, 10, 1], [60, 10, 1], [60, 22, 1]], gp(.45, .8), 1, WH, 2, [5, 4]);
        pl([[-20, 10, 1], [-100, 10, 1], [-100, 22, 1]], gp(.6, .85), 1, WH, 2, [5, 4]);
        [[-110, -30, 37], [-40, -30, 37], [40, -30, 37], [-110, 30, 37], [20, 0, 76], [100, 0, 76]].forEach(([u, v, y], i) => { const s = 6 * pop(gp(.72 + i * .04, .84 + i * .04)); if (s > .3) box(u - s, u + s, v - s, v + s, y, y + 5, { fill: WH, top: WH, edge: WH }); });
        break;
      }
      case 10: {
        const T3 = [INK, WH, 'h', WH, 'h', INK, 'h', INK, WH], pick = [0, 4, 8], sel = gp(.72, .92), L = [];
        for (let i = 0; i < 9; i++) { const cu = -76 + (i % 3) * 76, cv = -76 + Math.floor(i / 3) * 76, tt = red ? 1 : eo(rp(g, i * .045, i * .045 + .32)); if (tt <= 0) continue; const on = pick.includes(i), dr = (1 - tt) * 200 + (on ? 18 * sel : 0), al = 1, sz = on ? 32 : 32 * (1 - .5 * sel);
          L.push({ i, cu, cv, dr, sz, z: W3(cu, cv, 0)[2] }); }
        L.sort((p, q) => q.z - p.z).forEach(({ i, cu, cv, dr, sz }) => { const t = T3[i]; box(cu - sz, cu + sz, cv - sz, cv + sz, dr, dr + 6, { fill: t === 'h' ? INK : t, top: t === 'h' ? INK : t, edge: INK }); if (t === 'h') for (let n = -2; n <= 2; n++) { const vv = cv + n * sz * .375; pl([[cu - sz, vv, dr + 6.5], [cu + sz, vv, dr + 6.5]], 1, 1, WH, 1); } });
        break;
      }
      case 11: {
        const Y = 2.6, P = pts => pts.map(([u, v]) => [u, v, Y]);
        box(-150, 150, -120, 120, 0, 2, { fill: WH, top: WH, edge: INK, a: gp(0, .08) });
        const ax = gp(.04, .18);
        [-95, -10, 45, 95].forEach(u => { pl(P([[u, -104], [u, 96]]), ax, .45, INK, .8, [6, 3, 1, 3]); pl(P(arc(u, -110, 6, 0, 2 * PI, 16)), ax, .8, INK, .8); });
        [-65, 20, 65].forEach(v => { pl(P([[-128, v], [110, v]]), ax, .45, INK, .8, [6, 3, 1, 3]); pl(P(arc(-134, v, 6, 0, 2 * PI, 16)), ax, .8, INK, .8); });
        const pa = gp(.14, .3);
        [[-95, 95, -65, -59], [-95, 95, 59, 65], [-95, -89, -59, 59], [89, 95, -59, 59], [-12, -8, -59, 18], [-89, -8, 18, 22], [43, 47, -59, 59]].forEach(b => fillQ(R(b[0], b[1], b[2], b[3], Y), INK, pa));
        const wa = gp(.3, .45);
        [[-75, -35, -65, -59], [58, 82, -65, -59], [89, 95, -35, -5], [-40, 10, 59, 65]].forEach(([u0, u1, v0, v1]) => { fillQ(R(u0, u1, v0, v1, Y + .1), WH, wa); const hor = (u1 - u0) > (v1 - v0); for (let n = 0; n < 3; n++) { const f = (n + .5) / 3; pl(P(hor ? [[u0, v0 + (v1 - v0) * f], [u1, v0 + (v1 - v0) * f]] : [[u0 + (u1 - u0) * f, v0], [u0 + (u1 - u0) * f, v1]]), wa, 1, INK, .7); } });
        const da = gp(.42, .56);
        [[-12, -8, -40, -22], [-60, -42, 18, 22], [43, 47, -20, -2], [15, 35, -65, -59]].forEach(([u0, u1, v0, v1]) => fillQ(R(u0, u1, v0, v1, Y + .1), WH, da));
        pl(P([[-8, -40], [10, -40]]), da, 1, INK, 1); pl(P(arc(-8, -40, 18, 0, PI / 2, 8)), da, .8, INK, .6);
        pl(P([[-60, 18], [-60, 0]]), da, 1, INK, 1); pl(P(arc(-60, 18, 18, -PI / 2, 0, 8)), da, .8, INK, .6);
        pl(P([[47, -20], [65, -20]]), da, 1, INK, 1); pl(P(arc(47, -20, 18, 0, PI / 2, 8)), da, .8, INK, .6);
        pl(P([[15, -59], [15, -39]]), da, 1, INK, 1); pl(P(arc(15, -59, 20, 0, PI / 2, 8)), da, .8, INK, .6);
        const sa = gp(.52, .68); strQ(R(55, 85, 24, 56, Y + .2), sa, INK, .9); for (let n = 1; n < 9; n++) pl(P([[55, 24 + n * 3.6], [85, 24 + n * 3.6]]), sa, .9, INK, .6); pl(P([[70, 28], [70, 52], [66, 47], [70, 52], [74, 47]]), sa, 1, INK, .8);
        const fa = gp(.6, .75);
        strQ(R(-85, -62, 26, 55, Y + .2), fa, INK, .8); strQ(R(-50, -20, 30, 52, Y + .2), fa, INK, .8); pl(P(arc(15, -15, 11, 0, 2 * PI, 18)), fa, 1, INK, .8); strQ(R(-80, -30, -50, -20, Y + .2), fa, INK, .8); strQ(R(55, 85, -50, -30, Y + .2), fa, INK, .8);
        const dm = gp(.7, .88);
        pl(P([[-95, -82], [95, -82]]), dm, 1, INK, .7); [-95, -10, 45, 95].forEach(u => { pl(P([[u - 3, -85], [u + 3, -79]]), dm, 1, INK, 1); pl(P([[u, -68], [u, -86]]), dm, .5, INK, .5); });
        pl(P([[-112, -65], [-112, 65]]), dm, 1, INK, .7); [-65, 20, 65].forEach(v => { pl(P([[-115, v - 3], [-109, v + 3]]), dm, 1, INK, 1); pl(P([[-98, v], [-116, v]]), dm, .5, INK, .5); });
        pl(P([[-128, -5], [118, -5]]), gp(.78, .9), .8, INK, 1.4, [10, 3, 2, 3]);
        const tb = gp(.84, .94); strQ(R(98, 146, -116, -84, Y + .2), tb, INK, .9); pl(P([[98, -100], [146, -100]]), tb, 1, INK, .6); pl(P([[122, -116], [122, -100]]), tb, 1, INK, .6);
        for (let n = 0; n < 3; n++) pl(P([[102, -93 + n * 3], [140 - n * 8, -93 + n * 3]]), tb, .6, INK, .5);
        fillQ(R(124, 144, -114, -102, Y + .3), INK, gp(.93, 1));
        break;
      }
      case 12: {
        const hm = HB(.75, 45), ML = hm.L, MU = hm.U, H0 = ML[5], up = (u0, v0, u1, v1) => [[u0, v0, 0], [u1, v1, 0], [u1, v1, H0], [u0, v0, H0]];
        const PAN = [up(ML[0], ML[2], ML[1], ML[2]), up(ML[1], ML[2], ML[1], ML[3]), up(ML[1], ML[3], ML[0], ML[3]), up(ML[0], ML[3], ML[0], ML[2])], LEN = [ML[1] - ML[0], ML[3] - ML[2], ML[1] - ML[0], ML[3] - ML[2]];
        const flat = (len, i, p) => { const h = 1 + i * 4, l = len * p; return [[-102, -len / 2, h], [-102, -len / 2 + l, h], [-172, -len / 2 + l, h], [-172, -len / 2, h]]; };
        strQ(R(-178, -96, -108, 108, .6), gp(0, .08) * .9, INK, 1);
        strQ(R(ML[0], ML[1], ML[2], ML[3], .6), gp(.25, .35) * .9, INK, 1, [4, 4]);
        const L = PAN.map((Pu, i) => {
          const pr0 = gp(i * .06, i * .06 + .12); if (pr0 <= 0) return null;
          const tt = red ? 1 : eio(rp(g, .32 + (3 - i) * .09, .5 + (3 - i) * .09)), Fl = flat(LEN[i], i, red ? 1 : eo(pr0));
          const Q = Fl.map((f, c) => { const p = Pu[c]; return [f[0] + (p[0] - f[0]) * tt, f[1] + (p[1] - f[1]) * tt, f[2] + (p[2] - f[2]) * tt + Math.sin(PI * tt) * 70]; });
          return { Q, pr0, tt, n: Math.round(LEN[i] / 22), z: W3((Q[0][0] + Q[2][0]) / 2, (Q[0][1] + Q[2][1]) / 2, (Q[0][2] + Q[2][2]) / 2)[2] };
        }).filter(Boolean).sort((p, q) => q.z - p.z);
        L.forEach(({ Q, pr0, n, tt }) => {
          const q3 = Q.map(p => W3(...p)); fillQ(q3, INK, 1); strQ(q3, 1, YE, 1);
          const sa = .45 * (1 - sm(rp(tt, .55, 1)));
          for (let s = 1; s < n; s++) { const a = s / n, b0 = Q[0].map((v, d) => v + (Q[1][d] - v) * a), t0 = Q[3].map((v, d) => v + (Q[2][d] - v) * a); pl([b0, t0], 1, sa, WH, .8); }
          pl([Q[0].map((v, d) => v + (Q[3][d] - v) * .5), Q[1].map((v, d) => v + (Q[2][d] - v) * .5)], 1, sa, WH, .8);
        });
        const rf = rp(g, .76, .88); if (rf > 0) { const y = H0 + 120 * (1 - eo(rf)); box(ML[0] - 3, ML[1] + 3, ML[2] - 3, ML[3] + 3, y, y + 3); }
        const uf = rp(g, .86, .99); if (uf > 0) { const y = MU[4] + 3 + 160 * (1 - eo(uf)), uc = (MU[0] + MU[1]) / 2; box(MU[0], MU[1], MU[2], MU[3], y, y + MU[5] - MU[4]); pl([[uc, 0, y + MU[5] - MU[4]], [uc, 0, 400]], 1, 1 - sm(rp(g, .97, 1)), INK, 1); if (uf >= 1) { winF(hm, gp(.97, 1)); fillQ(faceQ(ML[2] - .8, hm.dr[0], hm.dr[1], 0, hm.dr[3]), WH, gp(.97, 1)); } }
        break;
      }
      case 13: {
        const { h4 } = siteDraw(() => 1), L4 = h4.L, d = h4.dr, fv = L4[2], dw = d[1] - d[0];
        const op = gp(.15, .55), ph = PI / 2 * op, gl = gp(.45, .85);
        fillQ([W3(d[0], fv - 1, 1.3), W3(d[1], fv - 1, 1.3), W3(d[1] + 10, fv - 60 * op, 1.3), W3(d[0] - 10, fv - 60 * op, 1.3)], WH, .55 * op);
        fillQ(R(h4.wL[0], h4.wL[1], fv - 22 * gl, fv - 1, 1.3), WH, .35 * gl);
        const eu = d[0] + dw * Math.cos(ph), ev = fv - 1.2 - dw * Math.sin(ph); fillQ([W3(d[0], fv - 1.2, 0), W3(eu, ev, 0), W3(eu, ev, d[3]), W3(d[0], fv - 1.2, d[3])], INK, 1); strQ([W3(d[0], fv - 1.2, 0), W3(eu, ev, 0), W3(eu, ev, d[3]), W3(d[0], fv - 1.2, d[3])], 1, YE, 1);
        break;
      }
    }
    x.globalAlpha = 1;
  }

