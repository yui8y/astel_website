import * as THREE from 'three';

const RIPPLE_LIFE = 2.5;
const RIPPLE_OPACITY = 0.8;
const RING_GEOMETRY = new THREE.RingGeometry(0.9, 1.0, 24);

export function createRipples(scene, waterY) {
  const ripples = [];
  let nextRipple = 2;
  let minGap = 2;   // 次の波紋までの最短
  let maxGap = 6;   // 次の波紋までの最長

  function spawn(x, z) {
    const ring = new THREE.Mesh(
    RING_GEOMETRY,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,  // 真っ白
        transparent: true,
        opacity: RIPPLE_OPACITY,     // 少し濃くして、明るい海でも見えるように
        fog: false,       // 霧で色がくすまないように
    })
    );
    ring.rotation.x = -Math.PI / 2;                 // 寝かせる
    ring.position.set(x, waterY + 0.01, z); // 水面のほんの少し上
    ring.userData.age = 0;  
    ring.userData.maxScale = 1.2 + Math.random() * 0.8; // 1.2〜2.0
    ring.userData.life = RIPPLE_LIFE * (0.6 + ring.userData.maxScale * 0.3); // 大きいほど長生き
    ring.scale.setScalar(0.1);
    scene.add(ring);
    ripples.push(ring);
  }

  function update(delta) {
    
    nextRipple -= delta;
    if (nextRipple <= 0) {
      const x = (Math.random() - 0.5) * 10;
      const z = -2 - Math.random() * 10;
      spawn(x, z);
      nextRipple = minGap + Math.random() * (maxGap - minGap);
    }
    
    for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.userData.age += delta;
    const t = r.userData.age / r.userData.life; // その波紋の寿命を使う
    r.scale.setScalar(0.1 + t * r.userData.maxScale);       // 広がる
    r.material.opacity = RIPPLE_OPACITY  * (1 - t);     // 薄くなる

    if (t >= 1) {
      scene.remove(r);
      r.material.dispose();
      ripples.splice(i, 1); // リストから外す
    }
  }
  }

  function setFrequency(min, max) {
    minGap = min;
    maxGap = max;
    nextRipple = Math.min(nextRipple, max); // すぐに新しい間隔で出始めるように
  }

  return { update, setFrequency, spawn };
}