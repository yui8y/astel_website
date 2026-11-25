import * as THREE from 'three';
import { createParticles, randomSpot } from '../particles.js';

const FALL = 2;
const SWAY = 0.6;
const SWAY_SPEED = 1.2;

export function createSnow() {
  return createParticles({
    count: 300,
    vertsPer: 1,
    Kind: THREE.Points,
    material: new THREE.PointsMaterial({
      color: 0xffffff, size: 2, sizeAttenuation: false,
      transparent: true, opacity: 0.9, fog: true,
    }),

    spawn(p, anywhere) {
      randomSpot(p, anywhere);
      p.speed = FALL * (0.6 + Math.random() * 0.8);
      p.phase = Math.random() * Math.PI * 2;
    },

    step(p, delta) {
      p.y -= p.speed * delta;
    },

    write(pos, o, p, time) {
      pos[o + 0] = p.x + Math.sin(time * SWAY_SPEED + p.phase) * SWAY; // ゆらゆら
      pos[o + 1] = p.y;
      pos[o + 2] = p.z;
    },
  });
}