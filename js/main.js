//GameManager
import * as THREE from 'three';
import { palette } from './palettes.js';
import { createRenderer, createCamera, handleResize } from './renderer.js';
import { getTimeOfDay, getSeason } from './environment.js';
import { createSky, createStars, paintSky } from './sky.js';
import { createHud } from './hud.js';
import { createWater } from './water.js';
import { createRipples } from './ripples.js';
import { createTrain } from './train.js';


// ===== 今の状態 =====
const state = { timeOfDay: getTimeOfDay(), season: getSeason() };

// 確認用：URLの末尾に ?time=night などを付けると、その時間帯で見られる
const debugTime = new URLSearchParams(location.search).get('time');
if (debugTime in palettes) state.timeOfDay = debugTime;

const palette = palettes[state.timeOfDay];

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(palette.horizon, 30, 400); // 水面より先に作る

const camera = createCamera();
const renderer = createRenderer();
handleResize(renderer, camera);

// ライト
const light = new THREE.DirectionalLight(palette.sun, 2);
light.position.set(0, 1, -5);
scene.add(light);
const ambient = new THREE.AmbientLight(palette.ambient, 1.2);
scene.add(ambient);

// 空
const sky = createSky(palette);
scene.add(sky);
scene.add(createStars());

// パレットを景色全体に当てる
function applyPalette(p) {
  paintSky(sky, p);
  scene.fog.color.set(p.horizon);
  water.material.uniforms.waterColor.value.set(p.water);
  water.material.uniforms.sunColor.value.set(p.sun);
  light.color.set(p.sun);
  ambient.color.set(p.ambient);
}

// 10秒ごとに状態を確認して、変わっていたら反映
const hud = createHud();
function tick() {
  const now = new Date();
  const t = debugTime in palettes ? debugTime : getTimeOfDay(now);
  if (t !== state.timeOfDay) {
    state.timeOfDay = t;
    applyPalette(palettes[t]);
  }
  state.season = getSeason(now);
  hud.update(now, state);
}
tick();
setInterval(tick, 10 * 1000);

// 水面
const water = createWater(palette);
scene.add(water);

// 波紋
const ripples = createRipples(scene, water.position.y);

// 列車
const train = createTrain();
scene.add(train.object);

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  water.material.uniforms.time.value += delta * 0.01;
  ripples.update(delta);
  train.update(delta);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);