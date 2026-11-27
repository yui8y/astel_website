import * as THREE from 'three';
import { woodTexture, wallpaperTexture } from './textures.js';
import { createLantern } from './lantern.js';
import { createBookshelf } from '../bookshelf.js';
import { bookStack, inkwell, papers, teacup, ticketPunch, pocketWatch, starFrame } from './props.js';//小物


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

  // ===== 本棚（壁ぎわ） =====
  const shelf = createBookshelf({ seed: 12 });
  shelf.position.set(0, -1.25, -2.25); // 床の高さ、壁の手前
  group.add(shelf);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshStandardMaterial({ map: wallpaperTexture(), flatShading: true })
  );
  wall.position.set(0, 3, -2.5);
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

  // ===== 机の上の小物（少しずつ傾けて、生活感を出す） =====
  const place = (object, x, z, ry = 0) => {
    object.position.set(x, 0, z);
    object.rotation.y = ry;
    group.add(object);
  };
  place(papers(), 0.35, -0.25, 0.1);       // ファイルの下に、紙を散らす
  place(bookStack(), -1.55, 0.6, 0.3);
  place(inkwell(), 0.3, -0.75);
  place(teacup(), 1.6, 0.65, 0.5);
  place(ticketPunch(), -0.65, -0.6, 0.8);  // ランタンのそば
  place(pocketWatch(), 0.45, 0.85);

  // ===== 壁の星図（本棚の上） =====
  const frame = starFrame();
  frame.position.set(0.8, 2.3, -2.46);
  group.add(frame);

  // ===== 影を受ける・落とす =====
  floor.receiveShadow = true;
  wall.receiveShadow = true;
  top.receiveShadow = true;
  astelFile.castShadow = astelFile.receiveShadow = true;
  outisFile.castShadow = outisFile.receiveShadow = true;

  // ===== ランタン =====
  const lantern = createLantern();
  lantern.object.position.set(-1.3, 0, -0.55);
  lantern.object.scale.setScalar(1.6); // 少し大きめに
  group.add(lantern.object);

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