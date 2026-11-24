import * as THREE from 'three';

const TRAIN_COLOR = 0x1a1626;
const SPEED = 8;              // 1秒に進む距離
const LOOP_X = 250;           // ここまで行ったら反対側へ戻る
const DISTANCE = -150;        // カメラからの奥行き
const RAIL_Y = -1.2;          // 線路の高さ
const DEPTH = 0.6;            // 型抜きの厚み
const COACH_COUNT = 2;        // 客車の数


// 点の並びを順番に結んで、輪郭を作る
function shapeFrom(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  return shape;
}

// 窓
function rectHole(x0, y0, x1, y1) {
  const hole = new THREE.Path();
  hole.moveTo(x0, y0);
  hole.lineTo(x1, y0);
  hole.lineTo(x1, y1);
  hole.lineTo(x0, y1);
  return hole;
}

// 輪郭を型抜き
function extrude(shape, material) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
  geo.translate(0, 0, -DEPTH / 2);
  return new THREE.Mesh(geo, material);
}

// 車輪（8角形）
function wheel(x, material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, DEPTH + 0.2, 8), material);
  mesh.rotation.x = Math.PI / 2; // 円柱を横に倒す
  mesh.position.set(x, 0.5, 0);
  return mesh;
}


function createLocomotive(material) {
  const group = new THREE.Group();

  // 右が先頭。左下から時計回りに、輪郭をなぞっていく
  const body = shapeFrom([
    [-5, 0.8], [4, 0.8],                                  // 車体の底
    [5.6, 0.2], [4.6, 1.6],                               // 先頭の排障器（とんがり）
    [4.6, 3.0], [3.9, 3.0],                               // ボイラーの前
    [3.9, 3.6], [4.3, 4.6], [2.9, 4.6], [3.3, 3.6],       // 煙突（上が広がった形）
    [3.3, 3.0], [1.8, 3.0],
    [1.8, 3.7], [1.3, 4.1], [0.8, 3.7],                   // ドーム（とんがり屋根）
    [0.8, 3.0], [-1.2, 3.0],
    [-1.2, 5.0], [-5, 5.0],                               // 運転室
  ]);
  body.holes.push(rectHole(-4.2, 3.4, -2.4, 4.5));        // 運転室の窓

  group.add(extrude(body, material));
  for (const x of [-3.8, -2.4, -1.0, 0.4]) {
    group.add(wheel(x, material));
  }
  return group;
}

function createCoach(material) {
  const group = new THREE.Group();

  const body = shapeFrom([
    [-4.5, 0.8], [4.5, 0.8], [4.5, 3.6],
    [4.9, 3.6], [4.9, 4.2], [4.3, 4.6],    // 屋根の右端
    [-4.3, 4.6], [-4.9, 4.2], [-4.9, 3.6], // 屋根の左端
    [-4.5, 3.6],
  ]);
  for (let k = 0; k < 3; k++) {
    const x0 = -3.6 + k * 2.6;
    body.holes.push(rectHole(x0, 1.8, x0 + 1.8, 2.8)); // 窓
  }

  group.add(extrude(body, material));
  group.add(wheel(-3, material));
  group.add(wheel(3, material));

  // 前の車両とつなぐ連結器
  const coupler = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 0.3), material);
  coupler.position.set(5.05, 1.2, 0);
  group.add(coupler);

  return group;
}

// ===== 外から使うもの =====

export function createTrain() {
  const material = new THREE.MeshBasicMaterial({ color: TRAIN_COLOR, fog: false });
  const train = new THREE.Group();

  train.add(createLocomotive(material));

  for (let i = 0; i < COACH_COUNT; i++) {
    const coach = createCoach(material);
    coach.position.x = -10.8 - i * 10.6; // 機関車の後ろに、間をあけて並べる
    train.add(coach);
  }

  train.position.set(-LOOP_X, RAIL_Y, DISTANCE);

  function update(delta) {
    train.position.x += SPEED * delta;
    if (train.position.x > LOOP_X) {
      train.position.x = -LOOP_X;
    }
  }

  return { object: train, update };
}

export function createRail() {
  const material = new THREE.MeshBasicMaterial({ color: TRAIN_COLOR, fog: false });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1000, 0.3, 0.5), material);
  rail.position.set(0, RAIL_Y - 0.15, DISTANCE);
  return rail;
}