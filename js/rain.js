import * as THREE from 'three';

const COUNT = 800;          // 雨粒の数
const SPEED = 18;           // 落ちる速さ
const LENGTH = 0.8;         // 雨粒の長さ
const WIND = 2;             // 横に流れる速さ（斜めに降る）
const RIPPLE_CHANCE = 0.03; // 水面に落ちたとき、波紋を出す確率（3%）

// 雨を降らせる範囲
const AREA = { width: 40, top: 20, bottom: -1.5, near: 4, far: -40 };

// onHit：雨粒が水面に落ちたときに呼ぶ関数（波紋を出す用）
export function createRain(onHit) {
  const positions = new Float32Array(COUNT * 2 * 3); // 雨粒1つ = 2点 × xyz
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.LineBasicMaterial({
    color: 0xdfe8ff,   // ほんのり青白い
    transparent: true,
    opacity: 0.6,
    fog: true,         // 遠くの雨は霧にかすむ
  });

  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false; // 理由は下で説明
  lines.visible = false;       // 最初は降っていない

  // 雨粒1つ1つの情報
  const drops = [];
  for (let i = 0; i < COUNT; i++) {
    drops.push({ x: 0, y: 0, z: 0, speed: 0 });
    reset(drops[i], true);
  }

  // 雨粒を、範囲のどこかに置き直す
  function reset(d, anywhere) {
    d.x = (Math.random() - 0.5) * AREA.width;
    d.z = AREA.far + Math.random() * (AREA.near - AREA.far);
    d.y = anywhere
      ? AREA.bottom + Math.random() * (AREA.top - AREA.bottom) // 最初はバラバラの高さ
      : AREA.top;                                              // 2回目からは上から
    d.speed = SPEED * (0.8 + Math.random() * 0.4);             // 速さを少しずつ変える
  }

  function update(delta) {
    if (!lines.visible) return; // 降っていないときは計算しない

    for (let i = 0; i < COUNT; i++) {
      const d = drops[i];
      d.y -= d.speed * delta;
      d.x += WIND * delta;

      if (d.y < AREA.bottom) {
        if (Math.random() < RIPPLE_CHANCE) onHit(d.x, d.z); // たまに波紋
        reset(d, false);
      }

      // 線の2点を書き込む（下の点 → 上の点）
      const tilt = (WIND / d.speed) * LENGTH; // 斜めに傾ける分
      const p = i * 6;
      positions[p + 0] = d.x;        positions[p + 1] = d.y;          positions[p + 2] = d.z;
      positions[p + 3] = d.x - tilt; positions[p + 4] = d.y + LENGTH; positions[p + 5] = d.z;
    }
    geo.getAttribute('position').needsUpdate = true; // GPUに送り直す
  }

  function setActive(on) {
    lines.visible = on;
  }

  return { object: lines, update, setActive };
}