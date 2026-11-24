import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

// ① 舞台
const scene = new THREE.Scene();
const PIXEL_SIZE = 4; // 1ドットを何ピクセル分の大きさにするか

// ② カメラ（視野角, 画面の縦横比, 映る一番近い距離, 一番遠い距離）
const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 5; // 少し手前に下がる

// ③ 映写機
const renderer = new THREE.WebGLRenderer({ antialias: false }); // ギザギザを消す処理をオフ
renderer.setPixelRatio(1);
renderer.setSize(
  Math.floor(window.innerWidth / PIXEL_SIZE),
  Math.floor(window.innerHeight / PIXEL_SIZE),
  false // ← CSS側の大きさは変えない、という意味
);
document.body.appendChild(renderer.domElement);

// 物体：形 ＋ 材質
const geometry = new THREE.IcosahedronGeometry(1, 0); // 正二十面体（半径1, 細かさ0）
const material = new THREE.MeshStandardMaterial({
  color: 0x88aaff,
  flatShading: true, // ← これがローポリ感の正体！
});
const star = new THREE.Mesh(geometry, material);
scene.add(star);

// ライト
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 4, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404060)); // 全体をうっすら照らす

// 法線マップ（波の凸凹の情報）
const waterNormals = new THREE.TextureLoader().load('textures/waternormals.jpg');
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; // 画像を繰り返し敷き詰める

// 水面
const water = new Water(
  new THREE.PlaneGeometry(10000, 10000), // 十分広い板
  {
    textureWidth: 256,   // 反射画像の解像度（ドット風なら低めでOK）
    textureHeight: 256,
    waterNormals: waterNormals,
    sunDirection: new THREE.Vector3(0.3, 1, 0.2).normalize(), // 光が来る向き
    sunColor: 0xffffff,
    waterColor: 0x0a1030,  // 夜の海の色
    distortionScale: 2.0,  // 揺れの強さ
  }
);
water.rotation.x = -Math.PI / 2; // 板を寝かせる（立った状態で作られるから）
water.position.y = -1.5;         // 星より少し下に
scene.add(water);

// 毎フレーム呼ばれる（Unityの Update() にあたる）
const clock = new THREE.Clock(); // Unityの Time にあたる
function animate() {
  const delta = clock.getDelta(); // 前のフレームからの経過秒数 = Time.deltaTime

  star.rotation.x += 0.6 * delta; // 1秒に0.6ラジアン回る
  star.rotation.y += 0.6 * delta;

  water.material.uniforms.time.value += delta; // 波の時間を進める

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// ウィンドウの大きさが変わったら合わせる
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; // 縦横比を更新
  camera.updateProjectionMatrix();                        // カメラに反映
  renderer.setSize(
    Math.floor(window.innerWidth / PIXEL_SIZE),
    Math.floor(window.innerHeight / PIXEL_SIZE),
    false
  );
});