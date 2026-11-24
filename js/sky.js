import * as THREE from 'three';

//空
export function createSky(palette) {
  const geo = new THREE.SphereGeometry(500, 16, 12); // 半径, 横の分割, 縦の分割（少なめ＝ローポリ）
  const pos = geo.getAttribute('position');          // 頂点の位置の一覧
  const colors = [];
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 500; // 高さを -1〜1 にそろえる

    if (y < 0.15) {
      c.copy(palette.horizon); // 水平線付近と、その下
    } else if (y < 0.5) {
      c.lerpColors(palette.horizon, palette.middle, (y - 0.15) / 0.35);
    } else {
      c.lerpColors(palette.middle, palette.zenith, (y - 0.5) / 0.5);
    }
    colors.push(c.r, c.g, c.b);
  }

  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.MeshBasicMaterial({
    vertexColors: true,     // 頂点の色を使う
    side: THREE.BackSide,   // 球の「内側」を描く
    fog: false,             // 霧の影響を受けない
  });
  return new THREE.Mesh(geo, mat);
}

// 星
export function createStars() {
  const count = 300;
  const positions = [];

  for (let i = 0; i < count; i++) {
    const y = 0.3 + Math.random() * 0.7;        // 上の方にだけ置く（水平線付近は明るいから）
    const angle = Math.random() * Math.PI * 2;  // ぐるっと一周のどこか
    const r = Math.sqrt(1 - y * y);
    positions.push(Math.cos(angle) * r * 450, y * 450, Math.sin(angle) * r * 450);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,               // ドット1つ分
    sizeAttenuation: false, // 遠くても小さくならない
    transparent: true,
    opacity: 0.6,          // 昼に近いから、うっすら
    fog: false,
  });
  return new THREE.Points(geo, mat);
}