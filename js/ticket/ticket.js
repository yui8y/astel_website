import * as THREE from 'three';
import { drawTicketFace } from './ticket-face.js';

const SIZE = { w: 1.875, h: 1, d: 0.02 };
const START = { x: -5, y: 1.2, z: 1 };   // 左上の、画面の外。少し奥から
const END   = { x: 0,  y: 0,   z: 2.5 }; // 真ん中（2Dの切符と重なる位置）
const FLIGHT_TIME = 3.5;  // 飛んでくるのにかかる秒数
const RISE_TIME = 1.6;    // 起き上がるのにかかる秒数
const ARC = 0.8;          // 道すじのふくらみ
const LIE = -1.2;         // 横たわる角度（-1.57で真横。少し手前にして、表が見えるように）
const SPIN = Math.PI * 1; // 舞っている間に回る量（1回転）

export async function createTicket(state, { onLanded } = {}) {
  const canvas = await drawTicketFace(state);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;

  const edge = new THREE.MeshBasicMaterial({ color: 0xd8ccb0, fog: false });
  const front = new THREE.MeshBasicMaterial({ map: texture, fog: false });
  const back = new THREE.MeshBasicMaterial({ color: 0xe9dfc8, fog: false });

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(SIZE.w, SIZE.h, SIZE.d),
    [edge, edge, edge, edge, front, back]
  );
  mesh.position.set(START.x, START.y, START.z);

    let phase = 'flying';
  let t = 0;
  let from = null; // 起き上がり始めたときの姿勢を覚えておく

  const lerp = THREE.MathUtils.lerp;
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);                       // だんだんゆっくり
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2); // ゆっくり始まって、ゆっくり終わる

  function update(delta) {
    if (phase === 'done') return;
    t += delta;

    // ===== 横たわって舞いながら、真ん中へ =====
    if (phase === 'flying') {
      const p = Math.min(t / FLIGHT_TIME, 1);
      const e = easeOut(p);
      const wave = 1 - e; // ひらひらの強さ（着く頃には0）

      mesh.position.set(
        lerp(START.x, END.x, e) + Math.sin(t * 1.3) * 0.3 * wave,
        lerp(START.y, END.y, e) + Math.sin(p * Math.PI) * ARC + Math.sin(t * 2.0) * 0.15 * wave,
        lerp(START.z, END.z, e)
      );

      mesh.rotation.x = LIE + Math.sin(t * 2.3) * 0.25;                 // 横たわったまま、ぱたぱた
      mesh.rotation.y = Math.sin(t * 0.9) * 0.3 * wave;                 // 少しねじれる
      mesh.rotation.z = wave * SPIN + Math.cos(t * 1.3) * 0.3 * wave;  // 木の葉みたいに、くるりと回る

      if (p >= 1) {
        // 今の姿勢を覚えて、起き上がる段階へ
        from = {
          x: mesh.position.x, y: mesh.position.y, z: mesh.position.z,
          rx: mesh.rotation.x, ry: mesh.rotation.y, rz: mesh.rotation.z,
        };
        t = 0;
        phase = 'rising';
      }
    }

    // ===== 真ん中で、ゆっくり起き上がる =====
    else if (phase === 'rising') {
      const p = Math.min(t / RISE_TIME, 1);
      const e = easeInOut(p);

      mesh.position.set(lerp(from.x, END.x, e), lerp(from.y, END.y, e), lerp(from.z, END.z, e));
      mesh.rotation.set(lerp(from.rx, 0, e), lerp(from.ry, 0, e), lerp(from.rz, 0, e));

      if (p >= 1) {
        phase = 'done';
        if (onLanded) onLanded();
      }
    }
  }

  // 使い終わったら、GPUのメモリを片付ける
  function dispose() {
    mesh.geometry.dispose();
    edge.dispose();
    front.dispose();
    back.dispose();
    texture.dispose();
  }

  return { object: mesh, update, canvas, dispose };
}