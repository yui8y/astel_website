import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

// ===== 色のパレット（後で時間帯ごとに切り替える） =====
const palette = {
  zenith:  new THREE.Color(0x9fc4e8), // 天頂
  middle:  new THREE.Color(0xd9c6e8), // 中間
  horizon: new THREE.Color(0xffd1b0), // 水平線
  water:   0xc8d6ea,                  // 海
  sun:     0xfff1e0,                  // 朝日の光
};

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
const light = new THREE.DirectionalLight(palette.sun, 2);
light.position.set(0, 1, -5); // 奥から照らす
scene.add(light);
scene.add(new THREE.AmbientLight(0xc8b8d8, 1.2)); // 薄紫で全体を明るく

// 法線マップ（波の凸凹の情報）
// 静かな水面用の法線マップを、その場で作る
// strength：揺らぎの強さ（0 で完全な鏡）
function createCalmNormals(size = 256, strength = 2) {
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
const waterNormals = createCalmNormals(256, 6);

scene.fog = new THREE.Fog(palette.horizon, 30, 400); // 色, 霧が始まる距離, 完全に霧になる距離

// 水面
const water = new Water(
  new THREE.PlaneGeometry(10000, 10000), // 十分広い板
  {
    textureWidth: 256,   // 反射画像の解像度（ドット風なら低めでOK）
    textureHeight: 256,
    waterNormals: waterNormals,
    sunDirection: new THREE.Vector3(0.3, 1, 0.2).normalize(), // 光が来る向き
    sunColor: 0x222233,
    waterColor: palette.water,
    sunColor: palette.sun,
    sunDirection: new THREE.Vector3(0, 0.15, -1).normalize(),
    fog: true,
    distortionScale: 0,  // 揺れの強さ
  }
);

// ===== 波紋 =====
const ripples = [];         // 今出ている波紋のリスト
const RIPPLE_LIFE = 2.5;    // 波紋の寿命（秒）
let nextRipple = 2;         // 次の波紋までの残り時間

function spawnRipple(x, z) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.0, 24), // 内側の半径, 外側の半径, 角の数
    new THREE.MeshBasicMaterial({
      color: 0xffffff,  // 真っ白
        transparent: true,
        opacity: 0.8,     // 少し濃くして、明るい海でも見えるように
        fog: false,       // 霧で色がくすまないように
    })
  );
  ring.rotation.x = -Math.PI / 2;                 // 寝かせる
  ring.position.set(x, water.position.y + 0.01, z); // 水面のほんの少し上
  ring.userData.age = 0;                          // 生まれてからの時間
  scene.add(ring);
  ripples.push(ring);
}

//空
function createSky() {
  const geo = new THREE.SphereGeometry(500, 16, 12); // 半径, 横の分割, 縦の分割（少なめ＝ローポリ）
  const pos = geo.getAttribute('position');          // 頂点の位置の一覧
  const colors = [];
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 500; // 高さを -1〜1 にそろえる

    if (y < 0.15) {
      c.copy(palette.horizon); // 水平線付近と、その下
    } else if (y < 0.5) {
      c.lerpColors(palette.horizon, palette.middle, (y - 0.15) / 0.35);
    } else {
      c.lerpColors(palette.middle, palette.zenith, (y - 0.5) / 0.5);
    }
    colors.push(c.r, c.g, c.b);
  }

  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.MeshBasicMaterial({
    vertexColors: true,     // 頂点の色を使う
    side: THREE.BackSide,   // 球の「内側」を描く
    fog: false,             // 霧の影響を受けない
  });
  return new THREE.Mesh(geo, mat);
}
scene.add(createSky());

function createStars() {
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

scene.add(createStars());

water.rotation.x = -Math.PI / 2; // 板を寝かせる（立った状態で作られるから）
water.position.y = -1.5;         // 星より少し下に
scene.add(water);
water.material.uniforms.size.value = 0.3; 

// 毎フレーム呼ばれる（Unityの Update() にあたる）
const clock = new THREE.Clock(); // Unityの Time にあたる
function animate() {
  const delta = clock.getDelta(); // 前のフレームからの経過秒数 = Time.deltaTime

  star.rotation.x += 0.6 * delta; // 1秒に0.6ラジアン回る
  star.rotation.y += 0.6 * delta;

  water.material.uniforms.time.value += delta * 0.01; // 波の時間を進める

    // 一定時間ごとに波紋を出す
  nextRipple -= delta;
  if (nextRipple <= 0) {
    const x = (Math.random() - 0.5) * 10; // 左右 -5〜5
    const z = -2 - Math.random() * 10;    // 奥 -2〜-12
    spawnRipple(x, z);
    nextRipple = 2 + Math.random() * 4;   // 次は2〜6秒後
  }

  // 波紋を育てる・片付ける（後ろから回すのがポイント）
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.userData.age += delta;
    const t = r.userData.age / RIPPLE_LIFE; // 0 → 1 に進む

    r.scale.setScalar(0.1 + t * 1.5);       // 広がる
    r.material.opacity = 0.8 * (1 - t);     // 薄くなる

    if (t >= 1) {
      scene.remove(r);
      r.geometry.dispose(); // GPUのメモリも片付ける
      r.material.dispose();
      ripples.splice(i, 1); // リストから外す
    }
  }

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