import * as THREE from 'three';

const KEYS = ['zenith', 'middle', 'horizon', 'water', 'sun', 'ambient'];
const DURATION = 4;


function toColors(palette) {
  const colors = {};
  for (const key of KEYS) colors[key] = new THREE.Color(palette[key]);
  return colors;
}

export function createPaletteFader(initial, apply) {
  const current = toColors(initial); // 今の色
  let from = null;                   // 出発点
  let to = null;                     // 到着点
  let t = 1;                         // 進み具合

  function fadeTo(palette) {
    from = {};
    for (const key of KEYS) from[key] = current[key].clone(); // 今の色をコピーして出発点に
    to = toColors(palette);
    t = 0;
  }

  function update(delta) {
    if (t >= 1) return;
    t = Math.min(t + delta / DURATION, 1);
    const e = t * t * (3 - 2 * t); // 最初と最後をゆっくりにする（なめらかに見える）

    for (const key of KEYS) {
      current[key].lerpColors(from[key], to[key], e);
    }
    apply(current);
  }

  return { fadeTo, update };
}