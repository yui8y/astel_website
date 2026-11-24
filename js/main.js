//GameManager
import * as THREE from 'three';
import { palette } from './palette.js';
import { createRenderer, createCamera, handleResize } from './js/renderer.js';
import { createSky, createStars } from './sky.js';
import { createWater } from './water.js';
import { createRipples } from './ripples.js';

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(palette.horizon, 30, 400); // 水面より先に作る

const camera = createCamera();
const renderer = createRenderer();
handleResize(renderer, camera);

// ライト
const light = new THREE.DirectionalLight(palette.sun, 2);
light.position.set(0, 1, -5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xc8b8d8, 1.2));

scene.add(createSky(palette));
scene.add(createStars());

const water = createWater(palette);
scene.add(water);

const ripples = createRipples(scene, water.position.y);

// （回る星は、列車ができたら置き換え）

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  water.material.uniforms.time.value += delta * 0.01;
  ripples.update(delta);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);