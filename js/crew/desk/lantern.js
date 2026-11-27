import * as THREE from 'three';

export function createLantern() {
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x3a3226, flatShading: true, metalness: 0.4, roughness: 0.6 });

  const add = (geometry, material, y) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = y;
    group.add(mesh);
    return mesh;
  };

  add(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 6), metal, 0.025); // 台座

  // ガラスのほや（うっすら光る）
  const glass = add(
    new THREE.CylinderGeometry(0.13, 0.13, 0.32, 6),
    new THREE.MeshStandardMaterial({
      color: 0xffe3a8, emissive: 0xffb45e, emissiveIntensity: 0.6,
      transparent: true, opacity: 0.55, flatShading: true,
    }),
    0.21
  );

  // 枠の柱（6本）
  for (let k = 0; k < 6; k++) {
    const angle = (k / 6) * Math.PI * 2 + Math.PI / 6;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.34, 0.02), metal);
    bar.position.set(Math.cos(angle) * 0.135, 0.21, Math.sin(angle) * 0.135);
    group.add(bar);
  }

  add(new THREE.ConeGeometry(0.17, 0.12, 6), metal, 0.43);           // 屋根
  add(new THREE.TorusGeometry(0.06, 0.012, 4, 8), metal, 0.53);      // 持ち手の輪

  // 炎
  const flame = add(new THREE.ConeGeometry(0.03, 0.09, 5), new THREE.MeshBasicMaterial({ color: 0xffd28a }), 0.2);

  // 灯り
  const light = new THREE.PointLight(0xffb05a, 6, 5, 2);
  light.position.y = 0.22;
  group.add(light);

  // ゆらめき
  let t = 0;
  function update(delta) {
    t += delta;
    const flicker = Math.sin(t * 7) * 0.4 + Math.sin(t * 13) * 0.25;
    light.intensity = 6 + flicker;
    glass.material.emissiveIntensity = 0.6 + flicker * 0.1;
    flame.scale.y = 1 + Math.sin(t * 11) * 0.12;   // 炎が伸び縮み
  }

  return { object: group, update };
}