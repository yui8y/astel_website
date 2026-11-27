import * as THREE from 'three';
import { woodTexture, wallpaperTexture } from './textures.js';
import { createLantern } from './lantern.js';
import { createBookshelf } from './bookshelf.js';

// ローポリの材質を作る道具
const mat = (color) => new THREE.MeshStandardMaterial({ color, flatShading: true });

// 箱を作って置く道具
function box(w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.position.set(x, y, z);
  return mesh;
}

export function createDesk() {
  const group = new THREE.Group();

  // ===== 部屋（暗がり） =====
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), mat(0x1c1622));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.25;
  group.add(floor);

  // ===== 机 =====
  group.add(box(4, 0.15, 2.4, 0x5a3b28, 0, -0.075, 0)); // 天板
  for (const [x, z] of [[-1.85, -1.05], [1.85, -1.05], [-1.85, 1.05], [1.85, 1.05]]) {
    group.add(box(0.15, 1.1, 0.15, 0x4a3020, x, -0.7, z)); // 脚
  }

  // ===== 本棚（壁ぎわ） =====
  const shelf = createBookshelf({ seed: 12 });
  shelf.position.set(0, -1.25, -2.25); // 床の高さ、壁の手前
  scene.add(shelf);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshStandardMaterial({ map: wallpaperTexture(), flatShading: true })
  );
  group.add(wall);

  // 机の材質（木目）
  const deskWood = new THREE.MeshStandardMaterial({ map: woodTexture({ repeatX: 2, repeatY: 1 }), flatShading: true });
  const top = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 2.4), deskWood);
  top.position.y = -0.075;
  group.add(top);
  for (const [x, z] of [[-1.85, -1.05], [1.85, -1.05], [-1.85, 1.05], [1.85, 1.05]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 0.15), deskWood);
    leg.position.set(x, -0.7, z);
    group.add(leg);
  }

  // ===== ランタン =====
  const lantern = createLantern();
  lantern.object.position.set(-1.3, 0, -0.55);
  lantern.object.scale.setScalar(1.6); // 少し大きめに
  group.add(lantern.object);

  const light = new THREE.PointLight(0xffb86b, 8, 6, 2); // 色, 明るさ, 届く距離, 弱まり方
  light.position.set(-1.3, 0.8, -0.6);
  group.add(light);

  // ===== 二人のファイル =====
  const astelFile = box(0.9, 0.03, 1.2, 0x3c4a6b, -0.15, 0.015, 0.25);
  astelFile.rotation.y = 0.12;
  const outisFile = box(0.9, 0.03, 1.2, 0x31473a, 0.85, 0.015, 0.1);
  outisFile.rotation.y = -0.08;
  group.add(astelFile, outisFile);

  // ===== 星図（アステルの持ち物） =====
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), mat(0x2c3a5c));
  chart.rotation.x = -Math.PI / 2;
  chart.rotation.z = 0.3;
  chart.position.set(1.25, 0.002, -0.65);
  group.add(chart);


  function update(delta) {
    lantern.update(delta);
  }

  return { object: group, files: { astel: astelFile, outis: outisFile }, update };
}