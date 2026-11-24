//GameManager
import * as THREE from 'three';
import { palettes } from './palettes.js';
import { createRenderer, createCamera, handleResize } from './renderer.js';
import { createSky, createStars, paintSky } from './sky.js';
import { createHud } from './hud.js';
import { createWater } from './water.js';
import { createRipples } from './ripples.js';
import { createTrain } from './train.js';
import { createEnvironment } from './environment.js';
import { createPaletteFader } from './palette-fader.js';


const env = createEnvironment();
const palette = palettes[env.state.timeOfDay];

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

// 水面
const water = createWater(palette);
scene.add(water);

// 波紋
const ripples = createRipples(scene, water.position.y);

// 列車
const train = createTrain();
scene.add(train.object);

// アニメーション
const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  water.material.uniforms.time.value += delta * 0.01;
  ripples.update(delta);
  train.update(delta);
  renderer.render(scene, camera);
  fader.update(delta);
}
renderer.setAnimationLoop(animate);

// 水面作成
const hud = createHud();
const fader = createPaletteFader(palette, applyPalette);
env.start({
  onTick: (state) => hud.update(state),
  onTimeChange: (state) => fader.fadeTo(palettes[state.timeOfDay]),
});
// デバッグ：T キーで時間帯を順番に切り替える
const ORDER = ['dawn', 'day', 'dusk', 'night'];
let debugIndex = ORDER.indexOf(env.state.timeOfDay);
window.addEventListener('keydown', (e) => {
  if (e.key !== 't') return;
  debugIndex = (debugIndex + 1) % ORDER.length; // 最後まで行ったら最初に戻る
  fader.fadeTo(palettes[ORDER[debugIndex]]);
});