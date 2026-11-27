import * as THREE from 'three';

const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

const SWAY_POS = 0.015;  // 位置の揺れの大きさ
const SWAY_LOOK = 0.02;  // 見る場所の揺れの大きさ

// 動きを減らす設定の人には、揺らさない
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createCameraIntro(camera, { from, to, lookFrom, lookTo, duration = 2.5 }) {
  const basePos = new THREE.Vector3();  // 揺れを足す前の位置
  const baseLook = new THREE.Vector3(); // 揺れを足す前の、見る場所
  const look = new THREE.Vector3();
  let t = 0;     // 座るまでの時間
  let time = 0;  // 揺れ用の時間（ずっと進む）

  camera.position.copy(from);
  camera.lookAt(lookFrom);

  function update(delta) {
    time += delta;

    // ① 座る動き（終わったら、座った位置のまま）
    t = Math.min(t + delta, duration);
    const e = easeInOut(t / duration);
    basePos.lerpVectors(from, to, e);
    baseLook.lerpVectors(lookFrom, lookTo, e);

    // ② わずかな揺れを足す
    camera.position.copy(basePos);
    look.copy(baseLook);
    if (!reduceMotion) {
      camera.position.x += Math.sin(time * 0.6) * SWAY_POS + Math.sin(time * 1.7) * SWAY_POS * 0.3;
      camera.position.y += Math.sin(time * 0.9) * SWAY_POS * 0.7;   // 呼吸みたいに、上下にゆっくり
      look.x += Math.sin(time * 0.5 + 1.3) * SWAY_LOOK;
      look.y += Math.sin(time * 0.8 + 0.4) * SWAY_LOOK * 0.5;
    }
    camera.lookAt(look);
  }

  return { update };
}