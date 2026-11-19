/* GRIFFNER Journey: die Familie (Vater, Mutter, Tochter, Sohn), die gemeinsam zum Haus geht.
   Körper, Frisuren und Gang: Quaternius (Universal Base Characters, Universal Animation Library), CC0 1.0,
   eingedampft von journey/familie-bau.mjs zu assets/familie.bin (Skelett, zwei Körper, vier Frisuren, Gehen und ruhiges Stehen).
   Freundlich und ruhig: warme Haut, gedämpfte Farben. Kleidung immer dunkler als die Haut (im Licht liest sich Weiß sonst wie Haut). Die Kleidung (Oberteil, Hose oder Kleid, Schuhe) ist nur Farbe,
   aus den Knochenzonen des Skeletts gelesen, damit die Familie angezogen wirkt und nicht wie Schaufensterpuppen.
   Kinder: ein eigener, geglätteter Kinderkörper, kleiner, größerer Kopf, schmalere Schultern, kürzere Beine.
   Der Gang wird nicht abgespielt, sondern am gegangenen Weg entlang gescrubbt: nichts rutscht, beim Anhalten bleibt die Familie stehen. */

/* url: familie.bin oder familie.bin.gz (gzip, wird hier entpackt; auf griffner.com liegt die gepackte Datei bei Framer) */
export async function loadFamily(T, url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('familie.bin ' + r.status);
  let buf = await r.arrayBuffer();
  const u8 = new Uint8Array(buf, 0, 2);
  if (u8[0] === 0x1f && u8[1] === 0x8b) {
    if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream fehlt');
    buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  return family(T, buf);
}

/* Wer, welcher Körper, welche Frisur, Größe, Kopf (Kinder größer), Schulterbreite und Beinlänge (Kinder kleiner),
   Platz neben dem Weg (seitlich, vorne in m), höchste Schrittfrequenz (Doppelschritte je s),
   Kleidung je Zone: top (Rumpf, Oberarm), fore (Unterarm), thigh (Becken, Oberschenkel), shin (Unterschenkel), shoe, hair.
   arm: Armdicke (die Grundkörper sind Superhelden, die Familie soll freundlich wirken) */
/* Freundlich und ruhig: warme Haut, gedämpfte Farben (Kundenwunsch 2026-11-19: „sehr freundlich, im Design und im Aussehen“),
   bei der Tochter ein Hauch GRIFFNER Gelb. Kleidung immer dunkler als die Haut. */
const TON = { haut: 0xF0DDC8, schuh: 0x3A3532 };
export const WHO = [
  { key: 'vater', body: 'm', s: .975, head: 1, sh: .93, arm: .86, leg: 1, lat: .42, fwd: 0, cad: 1.8,
    wear: { top: 0x6F8296, fore: 0x6F8296, thigh: 0x4C4F55, shin: 0x4C4F55, shoe: TON.schuh, hair: 0x4A3A2E } },
  { key: 'mutter', body: 'f', s: .965, head: 1, sh: .97, arm: .94, leg: 1, lat: -.4, fwd: .12, cad: 1.8,
    wear: { top: 0x8C5F6A, fore: 0x8C5F6A, thigh: 0x5A5550, shin: 0x5A5550, shoe: TON.schuh, hair: 0x7A563C } },
  { key: 'tochter', body: 'k', s: .66, head: 1.22, sh: .78, arm: .88, leg: .9, lat: -.82, fwd: .95, cad: 2.3,
    wear: { top: 0xD9A441, fore: TON.haut, thigh: 0xD9A441, shin: TON.haut, shoe: TON.schuh, hair: 0x8A6446 } },
  { key: 'sohn', body: 'k', s: .76, head: 1.16, sh: .8, arm: .88, leg: .92, lat: .5, fwd: 1.5, cad: 2.2,
    wear: { top: 0x8E9C7A, fore: TON.haut, thigh: 0x4C4F55, shin: TON.haut, shoe: TON.schuh, hair: 0x5A4434 } }
];
/* Knochenzonen für die Kleidung; alles andere (Hals, Kopf, Hände) ist Haut */
const ZONE = {
  top: ['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r'],
  fore: ['lowerarm_l', 'lowerarm_r'], thigh: ['pelvis', 'thigh_l', 'thigh_r'], shin: ['calf_l', 'calf_r'],
  shoe: ['foot_l', 'foot_r', 'ball_l', 'ball_r', 'ball_leaf_l', 'ball_leaf_r']
};

export function family(T, buf, who = WHO) {
  const dv = new DataView(buf);
  if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'GJF1') throw new Error('familie.bin: falsches Format');
  const jl = dv.getUint32(4, true), H = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, jl))), base = 8 + jl;
  const NB = H.bones.length, ix = n => H.bones.indexOf(n);
  /* Finger: der Gang hat Fäuste; halb zur offenen Ruhehand zurück wirkt freundlicher */
  const FING = H.bones.map((n, b) => /^(index|middle|ring|pinky|thumb)_/.test(n) ? b : -1).filter(b => b >= 0);
  const B = { pelvis: ix('pelvis'), neck: ix('neck_01'), head: ix('Head'), sp2: ix('spine_02') };

  /* Geometrie entpacken */
  const geo = {};
  const unpack = p => {
    const g = new T.BufferGeometry(), qp = new Uint16Array(buf, base + p.pos, p.n * 3), qn = new Int8Array(buf, base + p.nor, p.n * 4);
    const P = new Float32Array(p.n * 3), N = new Float32Array(p.n * 3);
    for (let v = 0; v < p.n; v++) for (let c = 0; c < 3; c++) { P[v * 3 + c] = p.lo[c] + qp[v * 3 + c] * p.sc[c]; N[v * 3 + c] = qn[v * 4 + c] / 127; }
    g.setAttribute('position', new T.BufferAttribute(P, 3));
    g.setAttribute('normal', new T.BufferAttribute(N, 3));
    if (p.kind === 'body') {
      g.setAttribute('skinIndex', new T.BufferAttribute(new Uint8Array(buf, base + p.jnt, p.n * 4), 4));
      g.setAttribute('skinWeight', new T.BufferAttribute(new Uint8Array(buf, base + p.wgt, p.n * 4), 4, true));
    }
    g.setIndex(new T.BufferAttribute(new Uint16Array(buf, base + p.idx, p.tri), 1));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  };
  H.parts.forEach(p => { geo[p.key] = unpack(p); });

  /* Clips: Drehungen je Rahmen und Knochen (Int16), Beckenweg (Float32) */
  const clip = c => ({ ...c, q: new Int16Array(buf, base + c.rot, c.F * NB * 4), p: new Float32Array(buf, base + c.pel, c.F * 3) });
  const WALK = clip(H.clips.walk), IDLE = clip(H.clips.idle);
  const qa = new T.Quaternion(), qb = new T.Quaternion(), qc = new T.Quaternion(), va = new T.Vector3(), vb = new T.Vector3();
  const sampleQ = (C, f, b, out) => {
    const F = C.F, f0 = Math.floor(f) % F, f1 = (f0 + 1) % F, k = f - Math.floor(f), o0 = (f0 * NB + b) * 4, o1 = (f1 * NB + b) * 4, q = C.q;
    qa.set(q[o0] / 32767, q[o0 + 1] / 32767, q[o0 + 2] / 32767, q[o0 + 3] / 32767);
    qb.set(q[o1] / 32767, q[o1 + 1] / 32767, q[o1 + 2] / 32767, q[o1 + 3] / 32767);
    return out.copy(qa).slerp(qb, k).normalize();
  };
  const sampleP = (C, f, out) => { const F = C.F, f0 = Math.floor(f) % F, f1 = (f0 + 1) % F, k = f - Math.floor(f); va.fromArray(C.p, f0 * 3); vb.fromArray(C.p, f1 * 3); return out.copy(va).lerp(vb, k); };

  /* Zone je Punkt: die Zone mit dem größten Gewicht */
  const ZK = Object.keys(ZONE), zoneOf = {};
  const boneZone = H.bones.map(n => ZK.find(z => ZONE[z].includes(n)) || 'skin');
  const zones = key => zoneOf[key] ||= (() => {
    const g = geo[key], J = g.attributes.skinIndex.array, W = g.attributes.skinWeight.array, n = J.length / 4, out = new Array(n);
    /* Halsausschnitt: Haut am Hals erst oberhalb von 83 % der Körperhöhe (sonst wäre der obere Rücken Haut) */
    const P = g.attributes.position.array, neckY = g.boundingBox.max.y * .83;
    for (let v = 0; v < n; v++) {
      const acc = {}; let best = 'skin', bw = -1;
      for (let c = 0; c < 4; c++) { const z = boneZone[J[v * 4 + c]]; acc[z] = (acc[z] || 0) + W[v * 4 + c]; if (acc[z] > bw) { bw = acc[z]; best = z; } }
      if (best === 'skin' && P[v * 3 + 1] < neckY && Math.abs(P[v * 3]) < .3) best = 'top';
      out[v] = best;
    }
    return out;
  })();
  const col = new T.Color();
  const dressed = (key, wear) => {
    const g0 = geo[key], z = zones(key), C = new Float32Array(z.length * 3);
    z.forEach((zz, v) => { col.setHex(zz === 'skin' ? TON.haut : wear[zz] ?? TON.haut); C[v * 3] = col.r; C[v * 3 + 1] = col.g; C[v * 3 + 2] = col.b; });
    const g = new T.BufferGeometry();
    ['position', 'normal', 'skinIndex', 'skinWeight'].forEach(a => g.setAttribute(a, g0.attributes[a]));
    g.setIndex(g0.index); g.setAttribute('color', new T.BufferAttribute(C, 3)); g.boundingSphere = g0.boundingSphere;
    return g;
  };
  const yUp = new T.Vector3(0, 1, 0), xAx = new T.Vector3(1, 0, 0), qLook = new T.Quaternion();
  const members = who.map(w => {
    const rig = H.rigs[w.body === 'f' ? 'f' : 'm'];
    const M = o => new T.MeshStandardMaterial({ roughness: .88, metalness: 0, emissive: 0x1a1712, transparent: true, opacity: 1, ...o });
    const mat = M({ vertexColors: true }), hmat = M({ color: w.wear.hair, roughness: .95 });
    const bones = H.bones.map((n, b) => { const o = new T.Bone(); o.name = n; o.position.fromArray(rig.t[b]); o.quaternion.fromArray(rig.r[b]); return o; });
    H.parents.forEach((p, b) => { if (p >= 0) bones[p].add(bones[b]); });
    /* Kinder: Schultern schmaler (Oberarm näher am Schlüsselbein), Beine kürzer (Knie und Knöchel höher) */
    ['upperarm_l', 'upperarm_r'].forEach(n => { bones[ix(n)].position.y *= w.sh; });
    ['calf_l', 'calf_r', 'foot_l', 'foot_r'].forEach(n => { bones[ix(n)].position.multiplyScalar(w.leg); });
    /* Arme schlanker: Oberarm quer zur Knochenachse (y) dünner, Unterarm und Hand erben es */
    if (w.arm && w.arm !== 1) ['upperarm_l', 'upperarm_r'].forEach(n => bones[ix(n)].scale.set(w.arm, 1, w.arm));
    const inv = rig.ib.map(a => new T.Matrix4().fromArray(a));
    const mesh = new T.SkinnedMesh(dressed(w.body, w.wear), mat);
    mesh.castShadow = true; mesh.frustumCulled = false;
    const inner = new T.Group(); inner.rotation.y = Math.PI; inner.scale.setScalar(w.s);
    inner.add(bones[0]); inner.add(mesh);
    /* eigene inverse Bindungen behalten: bind() mit Matrix, sonst rechnet three sie aus der (noch leeren) Pose neu */
    mesh.bind(new T.Skeleton(bones, inv), new T.Matrix4());
    const hair = new T.Mesh(geo[w.key], hmat); hair.castShadow = true; bones[B.head].add(hair);
    const g = new T.Group(); g.add(inner);
    const ratio = rig.t[B.pelvis][2] / H.ualPelvis[2] * (1 - .94 * (1 - w.leg));
    const rest = rig.r.map(r => new T.Quaternion().fromArray(r));
    return { ...w, g, mats: [mat, hmat], bones, rest, ratio, ph: 0, env: 0, look: 0 };
  });

  const qw = new T.Quaternion(), qi = new T.Quaternion(), pw = new T.Vector3(), pi = new T.Vector3();
  /* ph: Schrittphase (eine Runde = ein Doppelschritt), env: 0 steht, 1 geht, t: Zeit in s (Atmen), look: Kopf drehen (+ links) */
  function pose(m, ph, env, t, look = 0, still = false) {
    const fw = (((ph / (Math.PI * 2)) % 1) + 1) % 1 * WALK.F;
    const fi = still ? 0 : ((t * .5 + m.fwd * 1.7) / IDLE.dur % 1) * IDLE.F;
    for (let b = 0; b < NB; b++) {
      sampleQ(WALK, fw, b, qw); sampleQ(IDLE, fi, b, qi);
      m.bones[b].quaternion.copy(qi).slerp(qw, env);
    }
    for (const b of FING) m.bones[b].quaternion.slerp(m.rest[b], .55);
    sampleP(WALK, fw, pw); sampleP(IDLE, fi, pi);
    m.bones[B.pelvis].position.copy(pi.lerp(pw, env)).multiplyScalar(m.ratio);
    /* Atmen im Stehen: Brustkorb hebt sich kaum sichtbar */
    if (!still && env < 1) m.bones[B.sp2].quaternion.multiply(qLook.setFromAxisAngle(xAx, Math.sin(t * 1.5 + m.fwd * 2) * .014 * (1 - env)));
    /* Kinder: größerer Kopf */
    if (m.head !== 1) m.bones[B.head].scale.setScalar(m.head);
    /* Im Stehen lebt der Blick ein wenig: Kinder schauen sich um, zu den Eltern hinauf, Eltern zueinander */
    if (!still && env < 1) look += (m.head > 1 ? .32 : .14) * Math.sin(t * .42 + m.fwd * 3.1 + m.lat * 2) * (1 - env);
    /* Blick: Hals und Kopf drehen um ihre Längsachse (y im Knochen) */
    if (look) {
      m.bones[B.neck].quaternion.multiply(qLook.setFromAxisAngle(yUp, look * .4));
      m.bones[B.head].quaternion.multiply(qLook.setFromAxisAngle(yUp, look * .6));
    }
  }
  function fade(m, o) { m.mats.forEach(x => { x.opacity = o; x.depthWrite = o > .5; }); m.g.visible = o > .002; }
  /* Schrittlänge für ph: ein Doppelschritt des Clips in m, mal Größe */
  const stride = m => H.clips.walk.stride * m.s * m.leg;
  members.forEach(m => pose(m, 0, 0, 0, 0, true));
  return { members, pose, fade, stride, src: H.src };
}
