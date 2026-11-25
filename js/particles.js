import * as THREE from 'three';

// 降らせる範囲（共通）
export const AREA = { width: 40, top: 20, bottom: -1.5, near: 4, far: -40 };

// 範囲のどこかに置く（anywhere：最初はバラバラの高さ、2回目からは上から）
export function randomSpot(p, anywhere) {
  p.x = (Math.random() - 0.5) * AREA.width;
  p.z = AREA.far + Math.random() * (AREA.near - AREA.far);
  p.y = anywhere
    ? AREA.bottom + Math.random() * (AREA.top - AREA.bottom)
    : AREA.top;
}

// 降らせる機械を作る。カートリッジを受け取る
export function createParticles({
  count,      // 粒の数
  vertsPer,   // 1粒あたりの点の数
  Kind,       // THREE.Points か THREE.LineSegments
  material,   // 見た目
  spawn,      // (p, anywhere) => 1粒を生む
  step,       // (p, delta, time) => 1粒を動かす
  write,      // (positions, offset, p, time) => 1粒の点を書き込む
  onLand,     // (p) => 水面に着いたとき（なくてもOK）
}) {
  const positions = new Float32Array(count * vertsPer * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const object = new Kind(geo, material);
  object.frustumCulled = false;
  object.visible = false;

  const parts = [];
  for (let i = 0; i < count; i++) {
    const p = {};
    spawn(p, true);
    parts.push(p);
  }

  let time = 0;

  function update(delta) {
    if (!object.visible) return;
    time += delta;

    for (let i = 0; i < count; i++) {
      const p = parts[i];
      step(p, delta, time);

      if (p.y < AREA.bottom) {
        if (onLand) onLand(p);
        spawn(p, false);
      }
      write(positions, i * vertsPer * 3, p, time);
    }
    geo.getAttribute('position').needsUpdate = true;
  }

  function setActive(on) {
    object.visible = on;
  }

  return { object, update, setActive };
}