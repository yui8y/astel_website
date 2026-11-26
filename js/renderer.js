import * as THREE from 'three';

const PIXEL_SIZE = 4; // 1ドットを何ピクセル分の大きさにするか

// 画面サイズに合わせて、描く紙の大きさを決める（このファイルの中だけで使う）
function fitToWindow(renderer) {
  renderer.setSize(
    Math.floor(window.innerWidth / PIXEL_SIZE),
    Math.floor(window.innerHeight / PIXEL_SIZE),
    false
  );
}

// 画面の縦が、だいたい270ドットになるように、ドットの大きさを決める
function pixelSize() {
  return Math.max(1, Math.round(window.innerHeight / 270));
}

// カメラ（視野角, 画面の縦横比, 映る一番近い距離, 一番遠い距離）
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.z = 5;
  return camera;
}

// 映写機
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(1);
  fitToWindow(renderer);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

// ウィンドウの大きさが変わったら合わせる
export function handleResize(renderer, camera) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    fitToWindow(renderer);
  });
}