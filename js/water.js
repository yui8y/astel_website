import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

// 法線マップ
// 静かな水面用の法線マップを、その場で作る
function createCalmNormals(size = 256, strength = 6) {
  const canvas = document.createElement('canvas'); // 見えない画用紙
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);     // 1ピクセルずつ塗れる配列

  for (let i = 0; i < size * size; i++) {
    img.data[i * 4 + 0] = 128 + (Math.random() - 0.5) * strength * 2; // R：左右の傾き
    img.data[i * 4 + 1] = 128 + (Math.random() - 0.5) * strength * 2; // G：前後の傾き
    img.data[i * 4 + 2] = 255;                                         // B：上向き
    img.data[i * 4 + 3] = 255;                                         // 不透明
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas); // 画用紙をテクスチャにする
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 水面
export function createWater(palette) {
    const waterNormals = createCalmNormals(256, 6);

    // 水面
    const water = new Water(
    new THREE.PlaneGeometry(10000, 10000), // 十分広い板
    {
        textureWidth: 256,   // 反射画像の解像度（ドット風なら低めでOK）
        textureHeight: 256,
        waterNormals: waterNormals,
        waterColor: palette.water,
        sunColor: palette.sun,
        sunDirection: new THREE.Vector3(0, 0.15, -1).normalize(),
        fog: true,
        distortionScale: 0,  // 揺れの強さ
    }
    );

    water.rotation.x = -Math.PI / 2; // 板を寝かせる
    water.position.y = -1.5;         // 星より少し下に
    water.material.uniforms.size.value = 0.3; 

    return water;
}

// 指定したものを、海の反射に写らないようにする
export function excludeFromReflection(water, objects) {
  const renderReflection = water.onBeforeRender; // 元の「反射を撮る処理」を取っておく

  water.onBeforeRender = function (...args) {
    const wasVisible = objects.map((o) => o.visible); // 今見えているかを覚えておく
    objects.forEach((o) => { o.visible = false; });    // 隠す

    renderReflection.apply(this, args);                 // 反射を撮る

    objects.forEach((o, i) => { o.visible = wasVisible[i]; }); // 元に戻す
  };
}