import * as THREE from 'three';

const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

// from → to へ、look（見ている点）も一緒に動かしながら、ゆっくり移動する
export function createCameraIntro(camera, { from, to, lookFrom, lookTo, duration = 2.5 }) {
  const look = new THREE.Vector3();
  let t = 0;

  camera.position.copy(from);
  camera.lookAt(lookFrom);

  function update(delta) {
    if (t >= duration) return;               // 動き終わったら何もしない
    t = Math.min(t + delta, duration);
    const e = easeInOut(t / duration);

    camera.position.lerpVectors(from, to, e); // 位置を少しずつ
    look.lerpVectors(lookFrom, lookTo, e);    // 見る場所も少しずつ
    camera.lookAt(look);
  }

  return { update };
}