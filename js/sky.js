import * as THREE from 'three';

// 空の色を塗る
export function paintSky(sky, palette) {
  const zenith = new THREE.Color(palette.zenith);
  const middle = new THREE.Color(palette.middle);
  const horizon = new THREE.Color(palette.horizon);
  const pos = sky.geometry.getAttribute('position');
  const col = sky.geometry.getAttribute('color');
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 500;
    if (y < 0.15) c.copy(horizon);
    else if (y < 0.5) c.lerpColors(horizon, middle, (y - 0.15) / 0.35);
    else c.lerpColors(middle, zenith, (y - 0.5) / 0.5);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true; // GPUに知らせる
}

// 空
export function createSky(palette) {
  const geo = new THREE.SphereGeometry(500, 16, 12);
  const count = geo.getAttribute('position').count;
  geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3)); // 空の色の箱

  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true, side: THREE.BackSide, fog: false,
  }));
  paintSky(sky, palette);
  return sky;
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