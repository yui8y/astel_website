import * as THREE from 'three';

const RIPPLE_LIFE = 2.5;
const RIPPLE_OPACITY = 0.8;

export function createRipples(scene, waterY) {
  const ripples = [];
  let nextRipple = 2;

  function spawn(x, z) {
    // 今の spawnRipple の中身をここへ
    // （water.position.y の代わりに waterY を使う）
  }

  function update(delta) {
    // 今の animate の中にある「波紋を出す」「育てる・片付ける」をここへ
  }

  return { update }; // 外からは update だけ使えるようにする
}