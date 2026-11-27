import * as THREE from 'three';

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, ...extra });

// 小さな画用紙をテクスチャにする（ドットのまま）
function pixelTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

// ===== 窓（外は星空） =====
export function createWindow({ width = 1.2, height = 1.5 } = {}) {
  const g = new THREE.Group();
  const wood = mat(0x3a2416);

  // 外の夜空を描く
  const W = 48, H = 60;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0e1430');   // 上は濃い紺
  sky.addColorStop(1, '#3a2f5c');   // 下は少し紫
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f3ead2';
  for (let i = 0; i < 15; i++) {
    ctx.fillRect(Math.floor(Math.random() * W), Math.floor(Math.random() * H * 0.8), 1, 1);
  }

  // 外の景色（ライトに関係なく、そのまま見える）
  const outside = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: pixelTexture(canvas) })
  );
  g.add(outside);

  // 窓枠（外枠＋十字の桟）
  const t = 0.07;
  const bar = (w, h, x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), wood);
    m.position.set(x, y, 0.03);
    g.add(m);
  };
  bar(width + t * 2, t, 0, height / 2 + t / 2);   // 上
  bar(width + t * 2, t, 0, -height / 2 - t / 2);  // 下
  bar(t, height, -width / 2 - t / 2, 0);          // 左
  bar(t, height, width / 2 + t / 2, 0);           // 右
  bar(width, 0.04, 0, 0);                          // 横の桟
  bar(0.04, height, 0, 0);                         // 縦の桟

  // 窓台
  const sill = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.06, 0.2), wood);
  sill.position.set(0, -height / 2 - 0.1, 0.1);
  g.add(sill);

  return g;
}