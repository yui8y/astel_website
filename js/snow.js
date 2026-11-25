import * as THREE from 'three';

const COUNT = 30;        // 雪片の数
const FALL = 2;           // 落ちる速さ（雨よりずっと遅い）
const SWAY = 0.6;         // 左右に揺れる幅
const SWAY_SPEED = 1.2;   // 揺れる速さ

// 雪を降らせる範囲（雨と同じ）
const AREA = { width: 40, top: 20, bottom: -1.5, near: 4, far: -40 };

export function createSnow() {
  const positions = new Float32Array(COUNT * 3); // 雪片1つ = 1点 × xyz
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,                // ドット2つ分
    sizeAttenuation: false, // 遠くても同じ大きさ（ドットらしく）
    transparent: true,
    opacity: 0.9,
    fog: true,              // 遠くの雪は霧にかすむ
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; // 雨と同じ理由
  points.visible = false;

  // 雪片1つ1つの情報
  const flakes = [];
  for (let i = 0; i < COUNT; i++) {
    flakes.push({ x: 0, y: 0, z: 0, speed: 0, phase: 0 });
    reset(flakes[i], true);
  }

  function reset(f, anywhere) {
    f.x = (Math.random() - 0.5) * AREA.width;
    f.z = AREA.far + Math.random() * (AREA.near - AREA.far);
    f.y = anywhere
      ? AREA.bottom + Math.random() * (AREA.top - AREA.bottom)
      : AREA.top;
    f.speed = FALL * (0.6 + Math.random() * 0.8); // 速さをばらつかせる
    f.phase = Math.random() * Math.PI * 2;         // 揺れのタイミングをずらす
  }

  let time = 0;

  function update(delta) {
    if (!points.visible) return;
    time += delta;

    for (let i = 0; i < COUNT; i++) {
      const f = flakes[i];
      f.y -= f.speed * delta;

      if (f.y < AREA.bottom) {
        reset(f, false); // 水面に着いたら、すっと消えて上へ戻る
      }

      const sway = Math.sin(time * SWAY_SPEED + f.phase) * SWAY; // ゆらゆら
      const p = i * 3;
      positions[p + 0] = f.x + sway;
      positions[p + 1] = f.y;
      positions[p + 2] = f.z;
    }
    geo.getAttribute('position').needsUpdate = true;
  }

  function setActive(on) {
    points.visible = on;
  }

  return { object: points, update, setActive };
}