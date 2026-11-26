import * as THREE from 'three';
import { drawTicketFace } from './ticket-face.js';

const SIZE = { w: 1.875, h: 1, d: 0.02 };
const START = { x: -5, y: 2.2, z: 1 };  // 左上の、画面の外。少し奥から
const END   = { x: 0,  y: 0,   z: 2.5 }; // 真ん中（2Dの切符と重なる位置）
const FLIGHT_TIME = 3.5; // 飛んでくるのにかかる秒数
const ARC = 0.5;         // 道すじのふくらみ（ふわっと浮き上がる高さ）
const SETTLE = 4;

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

  let phase = 'falling';
  let t = 0;
  const damp = THREE.MathUtils.damp;

  function update(delta) {
    if (phase === 'done') return;
    t += delta;

    if (phase === 'falling') {
      const p = Math.min(t / FLIGHT_TIME, 1);  // 進み具合 0 → 1
      const e = 1 - Math.pow(1 - p, 3);        // だんだんゆっくり（イーズアウト）
      const wave = 1 - e;                      // ひらひらの強さ（着く頃には0）

      // ① 道すじ：左上 → 真ん中（途中で少しふわっと浮く）
      const baseX = START.x + (END.x - START.x) * e;
      const baseY = START.y + (END.y - START.y) * e + Math.sin(p * Math.PI) * ARC;
      const baseZ = START.z + (END.z - START.z) * e;

      // ② ひらひら（真ん中に近づくほど小さく）
      mesh.position.set(
        baseX + Math.sin(t * 1.3) * 0.3 * wave,
        baseY + Math.sin(t * 2.0) * 0.15 * wave,
        baseZ
      );
      mesh.rotation.z = Math.cos(t * 1.3) * 0.5 * wave;
      mesh.rotation.x = Math.sin(t * 2.3) * 0.7 * wave;

      // ③ くるっと1回転して、着く頃に正面へ
      mesh.rotation.y = wave * Math.PI * 2;

      if (p >= 1) phase = 'landing'; // 飛び終わったら、仕上げの「止まる」へ
    }

    else if (phase === 'landing') {
      mesh.position.x = damp(mesh.position.x, 0, SETTLE, delta);
      mesh.position.y = damp(mesh.position.y, LAND_Y, SETTLE, delta);
      mesh.rotation.x = damp(mesh.rotation.x, 0, SETTLE, delta);
      mesh.rotation.y = damp(mesh.rotation.y, 0, SETTLE, delta);
      mesh.rotation.z = damp(mesh.rotation.z, 0, SETTLE, delta);

      // ほとんど止まったら、ぴったりそろえて「着いた」と知らせる
      const close = (v, target) => Math.abs(v - target) < 0.005;
      if (close(mesh.position.x, 0) && close(mesh.position.y, LAND_Y) &&
          close(mesh.rotation.x, 0) && close(mesh.rotation.y, 0) && close(mesh.rotation.z, 0)) {
        mesh.position.set(0, LAND_Y, DISTANCE_Z);
        mesh.rotation.set(0, 0, 0);
        phase = 'done';
        if (onLanded) onLanded();
      }
    }
  }

  return { object: mesh, update, canvas };
}