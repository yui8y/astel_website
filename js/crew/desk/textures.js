import * as THREE from 'three';

// 小さな画用紙をテクスチャにする（ぼかさない・繰り返す）
function toTexture(canvas, repeatX = 1, repeatY = 1) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;  // ドットのまま
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

// ===== 木目 =====
export function woodTexture({ base = '#5a3b28', dark = '#3e2719', light = '#6f4b33', repeatX = 1, repeatY = 1 } = {}) {
  const S = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d');
  const TAU = Math.PI * 2;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // 横に流れる、ゆるく波打つ縞（端と端がつながるように周期をそろえる）
      const wave = y + Math.sin((x / S) * TAU * 2) * 3;
      const v = Math.sin((wave / S) * TAU * 8);

      let color = base;
      if (v > 0.8) color = dark;          // 濃い木目の線
      else if (v < -0.85) color = light;  // 明るい筋
      if (Math.random() < 0.03) color = dark; // ところどころ、小さな節

      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return toTexture(canvas, repeatX, repeatY);
}

// ===== 古い縞模様の壁紙 =====
export function wallpaperTexture({ a = '#2a1f2e', b = '#241a28', dot = '#3a2a3a', repeatX = 8, repeatY = 4 } = {}) {
  const S = 16;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = a;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = b;
  ctx.fillRect(8, 0, 8, S);  // 縦の縞
  ctx.fillStyle = dot;
  ctx.fillRect(3, 4, 2, 2);  // 小さな模様
  ctx.fillRect(11, 12, 2, 2);

  return toTexture(canvas, repeatX, repeatY);
}