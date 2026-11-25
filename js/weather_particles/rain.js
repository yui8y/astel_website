import * as THREE from 'three';
import { createParticles, randomSpot } from '../particles.js';

const SPEED = 40;
const LENGTH = 1.5;
const WIND = 1;
const RIPPLE_CHANCE = 0.3; // 30%
const RIPPLE_NEAR = 2;    // これより手前は、カメラの真下で見えない
const RIPPLE_FAR = -15;   // これより奥は、波紋が細くなりすぎてドットでつぶれるs

export function createRain(onHit) {
  return createParticles({
    count: 10,
    vertsPer: 2,
    Kind: THREE.LineSegments,
    material: new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      fog: true,
    }),

    spawn(p, anywhere) {
      randomSpot(p, anywhere);
      p.speed = SPEED * (0.8 + Math.random() * 0.4);
    },

    step(p, delta) {
      p.y -= p.speed * delta;
      p.x += WIND * delta;
    },

    write(pos, o, p) {
      const tilt = (WIND / p.speed) * LENGTH;
      pos[o + 0] = p.x;        pos[o + 1] = p.y;          pos[o + 2] = p.z;
      pos[o + 3] = p.x - tilt; pos[o + 4] = p.y + LENGTH; pos[o + 5] = p.z;
    },

    onLand(p) {
      if (p.z > RIPPLE_NEAR || p.z < RIPPLE_FAR) return; // 見えない場所では出さない
      if (Math.random() < RIPPLE_CHANCE) onHit(p.x, p.z);
    },
  });
}