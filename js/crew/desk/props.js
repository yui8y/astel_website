import * as THREE from 'three';

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, ...extra });

// 部品を作って、影を落とす・受けるようにする道具
function part(geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = true;    // 影を落とす
  m.receiveShadow = true; // 影を受ける
  return m;
}

// ===== 積み重ねた本 =====
export function bookStack() {
  const g = new THREE.Group();
  const books = [[0.5, 0.08, 0.36, 0x6b2e2e], [0.44, 0.07, 0.32, 0x2e4a3b], [0.4, 0.06, 0.3, 0x7a5a2e]];
  let y = 0;
  books.forEach(([w, h, d, color], i) => {
    const b = part(new THREE.BoxGeometry(w, h, d), mat(color), 0, y + h / 2, 0);
    b.rotation.y = (i % 2 ? 1 : -1) * 0.1 * i; // 少しずつ、互い違いにずらす
    g.add(b);
    y += h;
  });
  return g;
}

// ===== インク壺と羽ペン =====
export function inkwell() {
  const g = new THREE.Group();
  const glass = mat(0x1d2430, { metalness: 0.2, roughness: 0.3 });
  g.add(part(new THREE.CylinderGeometry(0.07, 0.08, 0.09, 6), glass, 0, 0.045, 0));
  g.add(part(new THREE.CylinderGeometry(0.03, 0.035, 0.03, 6), glass, 0, 0.105, 0));
  const quill = part(new THREE.ConeGeometry(0.02, 0.42, 4), mat(0xe9e0cc), 0.06, 0.25, 0);
  quill.rotation.z = -0.45; // 壺に差して、斜めに傾ける
  g.add(quill);
  return g;
}

// ===== 紅茶のカップ =====
export function teacup() {
  const g = new THREE.Group();
  const china = mat(0xeee6d8);
  g.add(part(new THREE.CylinderGeometry(0.12, 0.12, 0.012, 10), china, 0, 0.006, 0)); // 受け皿
  g.add(part(new THREE.CylinderGeometry(0.075, 0.055, 0.09, 10), china, 0, 0.057, 0)); // カップ
  const tea = new THREE.Mesh(new THREE.CircleGeometry(0.068, 10), mat(0x5a2e14));
  tea.rotation.x = -Math.PI / 2;
  tea.position.y = 0.095;
  g.add(tea);
  g.add(part(new THREE.TorusGeometry(0.03, 0.008, 4, 8), china, 0.085, 0.06, 0)); // 持ち手
  return g;
}

// ===== 改札鋏（車掌の道具） =====
export function ticketPunch() {
  const g = new THREE.Group();
  const metal = mat(0x6d665c, { metalness: 0.6, roughness: 0.4 });
  g.add(part(new THREE.BoxGeometry(0.1, 0.03, 0.05), metal, 0, 0.03, 0)); // 頭
    for (const side of [-1, 1]) {
    const y = side > 0 ? 0.024 : 0.02; // 片方だけ、ほんの少し高くして、重なりを分ける
    const handle = part(new THREE.BoxGeometry(0.025, 0.02, 0.32), metal, side * 0.03, y, 0.17);
    handle.rotation.y = side * 0.12;
    g.add(handle);
  }
  return g;
}

// ===== 額に入った星図（壁に飾る） =====
export function starFrame() {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(1.1, 0.8, 0.04), mat(0x3a2416), 0, 0, 0)); // 額縁

  // 星図の絵をその場で描く
  const W = 64, H = 44;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a2340';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e9dcc0';
  for (let i = 0; i < 40; i++) ctx.fillRect(Math.floor(Math.random() * W), Math.floor(Math.random() * H), 1, 1);
  ctx.strokeStyle = '#8a7a5a';
  ctx.beginPath();                     // 星座の線
  ctx.moveTo(12, 30); ctx.lineTo(22, 18); ctx.lineTo(34, 22); ctx.lineTo(46, 12);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;

  const picture = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.65), new THREE.MeshStandardMaterial({ map: tex }));
  picture.position.z = 0.021;
  g.add(picture);
  return g;
}