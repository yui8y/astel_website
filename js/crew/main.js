import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import { createRenderer, createCamera, handleResize } from '../renderer.js';
import { createDesk } from './desk/desk.js';
import { createCameraIntro } from './camera-intro.js';

// ===== 舞台・カメラ =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15111c); // 夜の書斎

const camera = createCamera();
camera.fov = 45;
camera.updateProjectionMatrix(); // 視野角を変えたら、カメラに反映
const renderer = createRenderer();
handleResize(renderer, camera);

scene.add(new THREE.AmbientLight(0x3a3048, 1.0)); // 部屋全体のうっすらした明るさ
// 上からは暖かい光、下からは暗い紫の照り返し
scene.add(new THREE.HemisphereLight(0x8a6a4a, 0x1a1422, 0.5));

// ===== 机 =====
const desk = createDesk();
scene.add(desk.object);

// ===== 机に向かうカメラ =====
const intro = createCameraIntro(camera, {
  from:     new THREE.Vector3(0, 2.3, 2.0),  // 部屋に入ったところ（立っている目線）
  lookFrom: new THREE.Vector3(0, 0.5, -0.5),  // 机の奥を見ている
  to:       new THREE.Vector3(0, 1.9, 2.0),  // 机の前に座ったところ
  lookTo:   new THREE.Vector3(0.3, 0.3, 0.1), // 手元のファイルを見下ろす
  duration: 2.8,
});

// ===== アニメーション（必ず最後） =====
const timer = new Timer();
function animate(timestamp) {
  timer.update(timestamp);
  const delta = timer.getDelta();

  intro.update(delta);
  desk.update(delta);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);