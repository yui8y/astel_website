import * as THREE from 'three';
import { drawTicketFace } from './ticket-face.js';

const SIZE = { w: 1.875, h: 1, d: 0.02 };
const START_Y = 4.5;     // ここから落ち始める（画面の上の外）
const LAND_Y = 0;        // ここで止まる（画面の真ん中）
const DISTANCE_Z = 2.5;  // カメラからの位置
const FALL_SPEED = 0.9;  // 落ちる速さ
const SETTLE = 4;        // 止まるときの「吸い寄せられる強さ」

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
  mesh.position.set(0, START_Y, DISTANCE_Z);

  let phase = 'falling';
  let t = 0;
  const damp = THREE.MathUtils.damp;

  function update(delta) {
    if (phase === 'done') return;
    t += delta;

    if (phase === 'falling') {
      mesh.position.y -= FALL_SPEED * delta;
      mesh.position.x = Math.sin(t * 1.3) * 0.8;  // 左右に揺れる
      mesh.rotation.z = Math.cos(t * 1.3) * 0.5;  // 揺れに合わせて傾く
      mesh.rotation.x = Math.sin(t * 2.3) * 0.7;  // 前後にぱたぱた
      mesh.rotation.y = Math.sin(t * 0.9) * 1.2;  // ゆっくりねじれる

      if (mesh.position.y <= LAND_Y + 0.6) phase = 'landing'; // 近づいたら、止まる動きへ
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