import * as THREE from 'three';
import { woodTexture } from './desk/textures.js';

// 種（seed）が同じなら、毎回同じ順番で数を出すランダム
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // 0〜1
  };
}

// 古い本の背表紙の色
const BOOK_COLORS = [0x6b2e2e, 0x2e4a3b, 0x3b3560, 0x7a5a2e, 0x4a2f22, 0x8a7a5a, 0x2f3f55];

export function createBookshelf({ width = 4.4, height = 3, depth = 0.4, shelves = 4, seed = 12 } = {}) {
  const group = new THREE.Group();
  const random = seededRandom(seed);
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture({ base: '#4a3020', dark: '#33200f', light: '#5c3d28' }), flatShading: true });

  const box = (w, h, d, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  };

  // 枠：左右・背板・天板
  box(0.08, height, depth, wood, -width / 2, height / 2, 0);
  box(0.08, height, depth, wood, width / 2, height / 2, 0);
  box(width, height, 0.04, wood, 0, height / 2, -depth / 2);
  box(width + 0.1, 0.08, depth + 0.05, wood, 0, height, 0);

  // 棚板と本
  const step = height / shelves;
  for (let i = 0; i < shelves; i++) {
    const shelfY = i * step;
    box(width, 0.05, depth, wood, 0, shelfY, 0); // 棚板

    let x = -width / 2 + 0.08;
    while (x < width / 2 - 0.2) {
      const w = 0.06 + random() * 0.08;
      const h = step * (0.5 + random() * 0.35);
      if (random() < 0.08) { x += w * 2; continue; } // ときどき、すき間

      const color = BOOK_COLORS[Math.floor(random() * BOOK_COLORS.length)];
      const book = box(w, h, depth * 0.8, new THREE.MeshStandardMaterial({ color, flatShading: true }), x + w / 2, shelfY + 0.025 + h / 2, 0.02);
      if (random() < 0.06) book.rotation.z = -0.18; // たまに、もたれかかった本

      x += w + 0.006;
    }
  }

  return group;
}