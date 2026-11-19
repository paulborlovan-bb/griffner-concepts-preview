/* GRIFFNER Journey: die Familie (Vater, Mutter, Tochter, Sohn) als echte Menschen.
   Kundenwunsch 2026-11-19: „eine andere Art Menschen“, gewählt: echte Menschen. Modelle: Microsoft Rocketbox Avatar Library,
   MIT License, Copyright (c) 2020 Microsoft (github.com/microsoft/Microsoft-Rocketbox). Eingedampft von familie-echt-bau.mjs zu familie-echt.bin:
   je Figur Körper (ca. 7000 Dreiecke), Skelett (Bip01), zwei Texturen; Kleidung ruhig umgefärbt (Vater Jeansjacke und weißes Shirt,
   Mutter weißes Shirt und Jeans, Tochter gedämpftes Gelb, Sohn Salbei).
   Der Gang ist eine echte Bewegungsaufnahme (gang-daten.js, Quaternius Universal Animation Library, CC0): je Bild die Richtungen
   von Oberschenkel, Unterschenkel, Fuß, Oberarm, Unterarm und die Lage von Becken und Brust. Hier dreht jeder Knochen des Skeletts
   von seiner Ruhelage auf diese Richtung (kleinste Drehung, die Kette entlang); der tiefste Punkt der Schuhe steht auf dem Boden.
   Die Familie hält sich an den Händen (Tochter, Mutter, Vater, Sohn); ein Kind, das sich umdreht und winkt, lässt los.
   Blick in Richtung −z, rechts = +x. API wie die Familie der Runde 4: { members, pose(m, ph, env, t, look, still, extra), hands(still), fade(m, o), stride(m) }. */
import { GANG } from './gang-daten.js';

/* H Körpergröße (m, vor dem Maßstab FS), lat seitlich vom Weg (+ rechts), fwd vor (+) oder hinter, cad höchstens Doppelschritte je s, wave: Hand zum Winken */
export const ECHT_WHO = [
  { key: 'vater', kid: false, H: 1.82, lat: .3, fwd: 0, cad: 1.9 },
  { key: 'mutter', kid: false, H: 1.69, lat: -.3, fwd: .04, cad: 1.9 },
  { key: 'tochter', kid: true, H: 1.3, lat: -.8, fwd: .12, cad: 2.4, wave: -1 },
  { key: 'sohn', kid: true, H: 1.38, lat: .8, fwd: .1, cad: 2.4, wave: 1 }
];
/* Wer hält wen: [links, rechts]. Die rechte Hand der linken Figur nimmt die linke Hand der rechten. */
const HOLD = [['tochter', 'mutter'], ['mutter', 'vater'], ['vater', 'sohn']];
/* Die Familie ist etwas kleiner als echt (Kundenwunsch: kleiner im Bild) */
const FS = .84;
/* Beugeachse der Finger im Knochen (Biped: x entlang des Glieds) */
const CURL = (typeof window !== 'undefined' && window.__curl) || [0, 0, 1];

/* url: familie-echt.bin oder .bin.gz (gzip, wird hier entpackt; auf griffner.com liegt die gepackte Datei bei Framer) */
export async function loadEchteFamilie(T, url, who = ECHT_WHO) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('familie-echt.bin ' + r.status);
  let buf = await r.arrayBuffer();
  const u8 = new Uint8Array(buf, 0, 2);
  if (u8[0] === 0x1f && u8[1] === 0x8b) {
    if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream fehlt');
    buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  return echteFamilie(T, buf, who);
}

export async function echteFamilie(T, buf, who = ECHT_WHO) {
  const dv = new DataView(buf);
  if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'GJR1') throw new Error('familie-echt.bin: falsches Format');
  const jl = dv.getUint32(4, true), HD = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, jl))), base = 8 + jl;
  const V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z), UP = V(0, 1, 0);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- Texturen: JPEG/PNG aus der Datei (kein Canvas: Safari) ---------- */
  const tex = await Promise.all(HD.tex.map(async t => {
    const url = URL.createObjectURL(new Blob([new Uint8Array(buf, base + t.off, t.len)], { type: t.type }));
    const img = new Image(); img.src = url;
    try { await img.decode(); } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
    const x = new T.Texture(img); x.colorSpace = T.SRGBColorSpace; x.anisotropy = 4; x.needsUpdate = true;
    return x;
  }));

  /* ---------- Gang: Richtungen je Bild, Stehen = Mittel des Gangs ---------- */
  const KEYS = ['thL', 'shL', 'ftL', 'thR', 'shR', 'ftR', 'uaL', 'faL', 'uaR', 'faR', 'pr', 'pu', 'cr', 'cu', 'hd'];
  const G = GANG, STAND = {};
  KEYS.forEach(k => { const s = V(); for (let f = 0; f < G.F; f++) s.add(V(G[k][f * 3], G[k][f * 3 + 1], G[k][f * 3 + 2])); STAND[k] = s.normalize(); });
  ['thL', 'shL', 'thR', 'shR'].forEach(k => STAND[k].lerp(V(Math.sign(STAND[k].x) * .02, -1, 0), .6).normalize());
  STAND.pu.set(0, 1, 0); STAND.cu.set(0, 1, 0); STAND.pr.set(1, 0, 0); STAND.cr.set(1, 0, 0);
  /* Arme im Stehen locker neben dem Körper, leicht gebeugt */
  STAND.uaL.set(-.12, -1, .03).normalize(); STAND.uaR.set(.12, -1, .03).normalize();
  STAND.faL.set(-.06, -1, -.14).normalize(); STAND.faR.set(.06, -1, -.14).normalize();
  const FT0 = { L: STAND.ftL.clone(), R: STAND.ftR.clone() };
  const _a = V(), _b = V();
  function gait(ph, env, d) {
    const fl = ((ph / (2 * Math.PI)) % 1 + 1) % 1 * G.F, f0 = Math.floor(fl) % G.F, f1 = (f0 + 1) % G.F, k = fl - Math.floor(fl);
    KEYS.forEach(key => {
      const a = G[key];
      _a.set(a[f0 * 3], a[f0 * 3 + 1], a[f0 * 3 + 2]); _b.set(a[f1 * 3], a[f1 * 3 + 1], a[f1 * 3 + 2]);
      d[key].copy(_a.lerp(_b, k).normalize()).lerp(STAND[key], 1 - env).normalize();
    });
    /* Arme etwas näher am Körper, Becken und Brust aufrechter, Kopf gerade */
    ['uaL', 'uaR'].forEach(k => { d[k].x *= .75; d[k].normalize(); });
    d.pu.lerp(UP, .45).normalize(); d.cu.lerp(UP, .5).normalize(); d.hd.lerp(UP, .7).normalize();
  }
  const _m4 = new T.Matrix4(), _z = V(), _y = V();
  function basis(r, u, q) { _z.crossVectors(r, u).normalize(); _y.crossVectors(_z, r).normalize(); _m4.makeBasis(r, _y, _z); return q.setFromRotationMatrix(_m4); }

  /* ---------- eine Figur ---------- */
  const QN = new T.Quaternion().setFromAxisAngle(UP, Math.PI);
  function build(w) {
    const P = HD.people.find(p => p.key === w.key);
    if (!P) throw new Error('familie-echt.bin: ' + w.key + ' fehlt');
    /* Geometrie entpacken */
    const n = P.n, qp = new Uint16Array(buf, base + P.pos, n * 3), qn = new Int8Array(buf, base + P.nor, n * 4), qu = new Uint16Array(buf, base + P.uv, n * 2);
    const Pp = new Float32Array(n * 3), Nn = new Float32Array(n * 3), Uv = new Float32Array(n * 2);
    for (let v = 0; v < n; v++) {
      for (let c = 0; c < 3; c++) { Pp[v * 3 + c] = P.lo[c] + qp[v * 3 + c] * P.sc[c]; Nn[v * 3 + c] = qn[v * 4 + c] / 127; }
      Uv[v * 2] = P.ulo[0] + qu[v * 2] * P.usc[0]; Uv[v * 2 + 1] = P.ulo[1] + qu[v * 2 + 1] * P.usc[1];
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(Pp, 3));
    geo.setAttribute('normal', new T.BufferAttribute(Nn, 3));
    geo.setAttribute('uv', new T.BufferAttribute(Uv, 2));
    geo.setAttribute('skinIndex', new T.BufferAttribute(new Uint8Array(buf, base + P.jnt, n * 4), 4));
    geo.setAttribute('skinWeight', new T.BufferAttribute(new Uint8Array(buf, base + P.wgt, n * 4), 4, true));
    geo.setIndex(new T.BufferAttribute(P.i32 ? new Uint32Array(buf, base + P.idx, P.tri * 3) : new Uint16Array(buf, base + P.idx, P.tri * 3), 1));
    P.groups.forEach(([s, c, mi]) => geo.addGroup(s, c, mi));
    geo.computeBoundingSphere();
    const mats = P.mats.map(m => new T.MeshStandardMaterial({
      map: tex[m.tex], roughness: .82, metalness: 0, transparent: false, opacity: 1,
      ...(m.alpha ? { alphaTest: .5, side: T.DoubleSide } : {})
    }));

    /* Skelett: Welt-Lagen der Bindungspose → lokale Lagen */
    const NB = P.bones.length, Wm = P.t.map((t, b) => new T.Matrix4().compose(V(...t), new T.Quaternion(...P.r[b]), V(...P.s[b])));
    const bones = P.bones.map((nm, b) => {
      const o = new T.Bone(); o.name = nm;
      const L = P.parents[b] >= 0 ? new T.Matrix4().copy(Wm[P.parents[b]]).invert().multiply(Wm[b]) : Wm[b].clone();
      L.decompose(o.position, o.quaternion, o.scale);
      return o;
    });
    const nrm = new T.Group();
    P.parents.forEach((p, b) => (p >= 0 ? bones[p] : nrm).add(bones[b]));
    const mesh = new T.SkinnedMesh(geo, mats);
    new T.Matrix4().fromArray(P.meshM).decompose(mesh.position, mesh.quaternion, mesh.scale);
    mesh.castShadow = true; mesh.frustumCulled = false;
    nrm.add(mesh);
    const inv = Array.from({ length: NB }, (_, b) => new T.Matrix4().fromArray(new Float32Array(buf, base + P.ib + b * 64, 16)));
    /* Größe: Modell in cm, Kopf oben = höchster Punkt (z im Netz); Blick nach −z */
    const s = w.H / ((P.lo[2] + 65535 * P.sc[2]) / 100) * FS / 100;
    nrm.scale.setScalar(s); nrm.quaternion.copy(QN);
    const body = new T.Group(); body.add(nrm);
    const g = new T.Group(); g.add(body);
    nrm.updateMatrixWorld(true);
    mesh.bind(new T.Skeleton(bones, inv), new T.Matrix4().fromArray(P.bindM));

    /* Ruhelage im Körperraum (Welt-Maßstab): Drehung RQ, Position RP je Knochen */
    const RQ = P.r.map(r => QN.clone().multiply(new T.Quaternion(...r)));
    const RP = P.t.map(t => V(...t).multiplyScalar(s).applyQuaternion(QN));
    const B = Object.fromEntries(P.bones.map((nm, b) => [nm, b]));
    const need = ['Pelvis', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'L_Thigh', 'L_Calf', 'L_Foot', 'L_Toe0', 'R_Thigh', 'R_Calf', 'R_Foot', 'R_Toe0', 'L_Clavicle', 'L_UpperArm', 'L_Forearm', 'L_Hand', 'R_Clavicle', 'R_UpperArm', 'R_Forearm', 'R_Hand'];
    need.forEach(k => { if (B[k] === undefined) throw new Error('familie-echt.bin: Knochen ' + k + ' fehlt bei ' + w.key); });
    /* Reihenfolge: Eltern vor Kindern */
    const order = [], seen = new Set(); const visit = b => { if (seen.has(b)) return; if (P.parents[b] >= 0) visit(P.parents[b]); seen.add(b); order.push(b); };
    for (let b = 0; b < NB; b++) visit(b);
    const dir = (a, c) => V().subVectors(RP[B[c]], RP[B[a]]).normalize();
    const len = (a, c) => RP[B[c]].distanceTo(RP[B[a]]);
    /* Becken- und Brustrahmen in Ruhe (wie in gang-bau.mjs gemessen) */
    const r0p = dir('L_Thigh', 'R_Thigh'), u0p = dir('Pelvis', 'Spine2'), r0c = dir('L_UpperArm', 'R_UpperArm'), u0c = dir('Spine1', 'Neck');
    const Bp0 = basis(r0p, u0p, new T.Quaternion()).invert(), Bc0 = basis(r0c, u0c, new T.Quaternion()).invert();
    /* Fußsohle: Ferse unter dem Knöchel etwas hinten, Spitze vor dem Zehenknochen, beide auf dem Boden der Ruhelage */
    const sole = {};
    ['L', 'R'].forEach(sd => {
      const F = RP[B[sd + '_Foot']], Z = RP[B[sd + '_Toe0']], fl = Math.hypot(Z.x - F.x, Z.z - F.z);
      sole[sd] = { heel: V(F.x, 0, F.z + fl * .3).sub(F), tip: V(Z.x, 0, Z.z - fl * .55).sub(Z) };
    });
    /* Finger locker gekrümmt (die Modelle haben gestreckte, gespreizte Finger): je Glied eine kleine Drehung um die Beugeachse */
    const curl = P.bones.map(nm => { const f = /_Finger(\d)(\d?)$/.exec(nm); if (!f) return null; const th = f[1] === '0', a = th ? .18 : f[2] ? .42 : .3; return new T.Quaternion().setFromAxisAngle(V(...CURL), a * (th ? .6 : 1)); });
    const L = { ua: len('L_UpperArm', 'L_Forearm'), fa: len('L_Forearm', 'L_Hand'), leg: len('L_Thigh', 'L_Calf') + len('L_Calf', 'L_Foot') };
    L.hand = len('L_Hand', P.bones.includes('L_Finger2') ? 'L_Finger2' : 'L_Finger1') * 1.6;
    return {
      ...w, g, body, nrm, mesh, mats, bones, B, RQ, RP, order, curl, parents: P.parents, sole, L, Bp0, Bc0,
      D: Array.from({ length: NB }, () => new T.Quaternion()), MP: Array.from({ length: NB }, () => V()),
      d: Object.fromEntries(KEYS.map(k => [k, V()])), J: { shL: V(), shR: V(), wrL: V(), wrR: V() }, link: { L: 0, R: 0 },
      ph: 0, yaw: null, turn: 0
    };
  }
  const members = who.map(build);

  /* ---------- Haltung ---------- */
  const _q = new T.Quaternion(), _q2 = new T.Quaternion(), _e = new T.Euler(0, 0, 0, 'YXZ'), _v = V(), _w = V(), _u = V();
  const Dp = new T.Quaternion(), Dc = new T.Quaternion(), QL = new T.Quaternion();
  /* Knochen b (Elternteil p) dreht so, dass seine Richtung (Ruhe: von b zu Kind c) auf target zeigt: kleinste Drehung nach der Drehung des Elternteils */
  function aim(m, b, c, target) {
    const p = m.parents[b];
    _v.subVectors(m.RP[c], m.RP[b]).normalize().applyQuaternion(m.D[p]);
    m.D[b].setFromUnitVectors(_v, _w.copy(target).normalize()).multiply(m.D[p]);
  }
  /* lokale Drehung des Knochens aus den Körperraum-Drehungen (Elternteil oder, bei der Wurzel, der Rahmen nrm) */
  function local(m, b) {
    const p = m.parents[b];
    if (p >= 0) _q.copy(m.D[p]).multiply(m.RQ[p]).invert(); else _q.copy(QN).invert();
    m.bones[b].quaternion.copy(_q).multiply(_q2.copy(m.D[b]).multiply(m.RQ[b]));
    if (m.curl[b]) m.bones[b].quaternion.multiply(m.curl[b]);
  }
  /* Positionen im Körperraum aus den Drehungen (Knochenlängen der Ruhelage) */
  function positions(m) {
    m.order.forEach(b => { const p = m.parents[b]; if (p < 0) m.MP[b].copy(m.RP[b]); else m.MP[b].subVectors(m.RP[b], m.RP[p]).applyQuaternion(m.D[p]).add(m.MP[p]); });
  }
  const DRIVEN = ['Pelvis', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'L_Thigh', 'L_Calf', 'L_Foot', 'R_Thigh', 'R_Calf', 'R_Foot', 'L_UpperArm', 'L_Forearm', 'R_UpperArm', 'R_Forearm'];

  function arm(m, sd, ua, fa) {
    const B = m.B;
    aim(m, B[sd + '_UpperArm'], B[sd + '_Forearm'], ua);
    aim(m, B[sd + '_Forearm'], B[sd + '_Hand'], fa);
  }
  function pose(m, ph, env, t, look = 0, still = false, extra = {}) {
    const d = m.d, B = m.B, D = m.D, tt = still ? 0 : t, wv = extra.wave || 0;
    gait(ph, env, d);
    /* Winken: der freie Arm geht hoch, die Hand winkt */
    if (wv > 0 && m.wave) {
      const s = m.wave, u = s < 0 ? 'L' : 'R';
      d['ua' + u].lerp(_u.set(s * .55, .78, -.12).normalize(), wv).normalize();
      d['fa' + u].lerp(_u.set(s * .15 + .42 * Math.sin(tt * 8.5), 1, -.18).normalize(), wv).normalize();
    }
    /* alle Knochen zunächst wie ihr Elternteil (Ruhelage relativ), dann die geführten */
    m.order.forEach(b => { const p = m.parents[b]; if (p < 0) D[b].identity(); else D[b].copy(D[p]); });
    basis(d.pr, d.pu, Dp).multiply(m.Bp0); basis(d.cr, d.cu, Dc).multiply(m.Bc0);
    /* Stehen: leichtes Gewicht verlagern */
    const st = (1 - env) * (still ? 0 : 1);
    if (st > 0) Dp.premultiply(_q.setFromAxisAngle(_u.set(0, 0, 1), Math.sin(tt * .8 + m.fwd * 5) * .02 * st));
    D[B.Pelvis].copy(Dp); D[B.Spine].copy(Dp);
    D[B.Spine1].copy(Dp).slerp(Dc, .5); D[B.Spine2].copy(Dc); D[B.Neck].copy(Dc);
    /* Kopf: Richtung aus dem Gang, dazu Blick (look, + links) und Neigen */
    _v.subVectors(m.RP[B.Head], m.RP[B.Neck]).normalize().applyQuaternion(Dc);
    QL.setFromUnitVectors(_v, d.hd);
    _e.set(-.04 - .03 * env + Math.sin(ph * 2) * .015 * env, look, (still ? .04 : Math.sin(tt * .7 + m.fwd * 2) * .05) * (1 - env) * (m.kid ? 1.3 : .8) + wv * .1);
    D[B.Head].setFromEuler(_e).multiply(QL).multiply(Dc);
    /* Beine */
    ['L', 'R'].forEach(sd => {
      aim(m, B[sd + '_Thigh'], B[sd + '_Calf'], d['th' + sd]);
      aim(m, B[sd + '_Calf'], B[sd + '_Foot'], d['sh' + sd]);
      /* Fuß: um so viel drehen, wie sich der Fuß im Gang gegenüber dem Stehen dreht */
      _u.subVectors(m.RP[B[sd + '_Toe0']], m.RP[B[sd + '_Foot']]).normalize().applyQuaternion(_q.setFromUnitVectors(FT0[sd], d['ft' + sd]));
      aim(m, B[sd + '_Foot'], B[sd + '_Toe0'], _u);
    });
    /* Kinder der geführten Knochen (Zehen, Schlüsselbeine, Finger, Gesicht) folgen */
    m.order.forEach(b => { if (!DRIVEN.includes(m.bones[b].name) && m.parents[b] >= 0) D[b].copy(D[m.parents[b]]); });
    arm(m, 'L', d.uaL, d.faL); arm(m, 'R', d.uaR, d.faR);
    ['L', 'R'].forEach(sd => { ['_Hand'].forEach(k => D[B[sd + k]].copy(D[B[sd + '_Forearm']])); });
    m.order.forEach(b => { const p = m.parents[b]; if (p >= 0 && !DRIVEN.includes(m.bones[b].name) && /Finger|Hand/.test(m.bones[b].name)) D[b].copy(D[p]); });
    positions(m);
    /* Der tiefste Punkt der Sohlen steht auf dem Boden: Körper heben oder senken (das ist auch das Federn beim Gehen) */
    let low = 1e9;
    ['L', 'R'].forEach(sd => {
      const F = B[sd + '_Foot'], Z = B[sd + '_Toe0'];
      low = Math.min(low, _u.copy(m.sole[sd].heel).applyQuaternion(D[F]).add(m.MP[F]).y, _u.copy(m.sole[sd].tip).applyQuaternion(D[Z]).add(m.MP[Z]).y);
    });
    m.body.position.y = -low;
    m.order.forEach(b => local(m, b));
    m.J.shL.copy(m.MP[B.L_UpperArm]); m.J.shR.copy(m.MP[B.R_UpperArm]);
    m.J.wrL.copy(m.MP[B.L_Hand]); m.J.wrR.copy(m.MP[B.R_Hand]);
  }

  /* ---------- Hände halten: zwei Arme treffen sich zwischen den beiden (Zwei-Gelenk-Lösung), Ellbogen nach außen ---------- */
  const byKey = Object.fromEntries(members.map(m => [m.key, m]));
  const _s = V(), _tg = V(), _el = V(), _ax = V(), _pp = V(), _wA = V(), _wB = V(), _mid = V(), _ua = V(), _fa = V();
  /* Arm von m (Seite sd) zur Hand am Punkt target (Körperraum), Anteil k */
  function reach(m, sd, target, k) {
    const B = m.B, sh = m.MP[B[sd + '_UpperArm']], l1 = m.L.ua, l2 = m.L.fa + m.L.hand * .45;
    _tg.copy(target).sub(sh); let dd = _tg.length(); const dmax = (l1 + l2) * .995;
    if (dd < 1e-4) return;
    if (dd > dmax) { _tg.multiplyScalar(dmax / dd); dd = dmax; }
    _ax.copy(_tg).divideScalar(dd);
    const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    /* Ellbogen nach hinten und unten (etwas nach außen), nie nach oben */
    _pp.set(sd === 'L' ? -.3 : .3, -.8, .55); _pp.addScaledVector(_ax, -_pp.dot(_ax)).normalize();
    _el.copy(sh).addScaledVector(_ax, a).addScaledVector(_pp, h);
    _s.copy(sh).add(_tg);
    /* neue Richtungen, mit dem natürlichen Arm gemischt */
    const D = m.D;
    _ua.subVectors(m.MP[B[sd + '_Forearm']], sh).normalize().lerp(_el.clone().sub(sh).normalize(), k).normalize();
    const elb = V().copy(sh).addScaledVector(_ua, l1);
    _fa.subVectors(m.MP[B[sd + '_Hand']], m.MP[B[sd + '_Forearm']]).normalize().lerp(_s.clone().sub(elb).normalize(), k).normalize();
    arm(m, sd, _ua, _fa);
    D[B[sd + '_Hand']].copy(D[B[sd + '_Forearm']]);
    /* Hand leicht zum anderen hin drehen (Handfläche zur Hand des anderen) */
    D[B[sd + '_Hand']].premultiply(_q.setFromAxisAngle(_fa, (sd === 'L' ? 1 : -1) * .5 * k));
    [sd + '_UpperArm', sd + '_Forearm', sd + '_Hand'].forEach(nm => local(m, B[nm]));
  }
  function hands(still = false) {
    members.forEach(m => m.g.updateMatrixWorld(true));
    HOLD.forEach(([a, b]) => {
      const A = byKey[a], Bm = byKey[b];
      if (!A || !Bm) return;
      A.body.localToWorld(_wA.copy(A.J.wrR)); Bm.body.localToWorld(_wB.copy(Bm.J.wrL));
      /* Treffpunkt: in der Mitte, auf der Höhe der tieferen Hand (der Größere greift nach unten, das Kind hebt den Arm nicht) */
      _mid.copy(_wA).add(_wB).multiplyScalar(.5); _mid.y = Math.min(_wA.y, _wB.y) + .03;
      const sA = A.body.localToWorld(A.J.shR.clone()), sB = Bm.body.localToWorld(Bm.J.shL.clone());
      const rA = (A.L.ua + A.L.fa + A.L.hand * .45) * .96, rB = (Bm.L.ua + Bm.L.fa + Bm.L.hand * .45) * .96;
      for (let i = 0; i < 6; i++) [[sA, rA], [sB, rB]].forEach(([sh, r]) => { const dd = _mid.distanceTo(sh); if (dd > r) _mid.sub(sh).multiplyScalar(r / dd).add(sh); });
      const over = Math.max(sA.distanceTo(_mid) / rA, sB.distanceTo(_mid) / rB);
      /* loslassen: zu weit auseinander oder ein Kind dreht sich um und winkt */
      const k = clamp((1.06 - over) / .06) * (1 - clamp(A.turn * 3)) * (1 - clamp(Bm.turn * 3));
      A.link.R = still ? k : lerp(A.link.R, k, .25); Bm.link.L = A.link.R;
      if (A.link.R < .01) return;
      reach(A, 'R', A.body.worldToLocal(_mid.clone()), A.link.R);
      reach(Bm, 'L', Bm.body.worldToLocal(_mid.clone()), A.link.R);
    });
  }
  function fade(m, o) { m.mats.forEach(x => { x.opacity = o; const tr = o < .999; if (x.transparent !== tr) { x.transparent = tr; x.needsUpdate = true; } x.depthWrite = o > .5; }); m.g.visible = o > .002; }
  /* Doppelschritt in m (Weltmaß): aus der Aufnahme, je Beinlänge */
  const stride = m => G.stride * m.L.leg;
  members.forEach(m => pose(m, 0, 0, 0, 0, true));
  return { members, pose, hands, fade, stride };
}
