import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import { createRenderer, createCamera, handleResize } from '../renderer.js';
import { createDesk } from './desk/desk.js';
import { createCameraIntro } from './camera-intro.js';
import { createViewFitter } from './view-fitter.js';

// ===== 舞台・カメラ =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15111c); // 夜の書斎

const camera = createCamera();
camera.fov = 45;
camera.updateProjectionMatrix(); // 視野角を変えたら、カメラに反映
const renderer = createRenderer();
handleResize(renderer, camera);

scene.add(new THREE.AmbientLight(0x3a3048, 1.2)); // 部屋全体のうっすらした明るさ
// 上からは暖かい光、下からは暗い紫の照り返し
scene.add(new THREE.HemisphereLight(0x8a6a4a, 0x1a1422, 1.0));

// ===== 机 =====
const desk = createDesk();
scene.add(desk.object);

// ===== 机に向かうカメラ =====
// ===== カメラの位置（画面の形ごと） =====
const bases = {
  wide: {                                          // パソコン：机に向かって座る
    from:     new THREE.Vector3(0, 2.3, 2.0),
    lookFrom: new THREE.Vector3(0, 0.5, -0.5),
    to:       new THREE.Vector3(0, 1.9, 2.0),
    lookTo:   new THREE.Vector3(0.3, 0.3, 0.1),
    width: 3.0,
    fogNear: 3.5, fogFar: 9,
  },
  tall: {                                          // スマホ：少し上から見下ろす
    from:     new THREE.Vector3(0, 3.0, 2.0),
    lookFrom: new THREE.Vector3(0, 0.3, -0.6),
    to:       new THREE.Vector3(0, 2.8, 1.3),
    lookTo:   new THREE.Vector3(0, 0, -0.05),
    width: 1.6,                                    // 縦に並べたから、横は狭くていい
    fogNear: 3.5, fogFar: 9,
  },
};
scene.fog = new THREE.Fog(0x15111c, bases.wide.fogNear, bases.wide.fogFar);

// ===== 画面の形に合わせる（机の並べ方も一緒に） =====
const view = createViewFitter(camera, scene, {
  bases,
  onLayout: (mode) => desk.setLayout(mode),
});

// ===== 机に向かうカメラ =====
const intro = createCameraIntro(camera, { ...view, duration: 2.8 });

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