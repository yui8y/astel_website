import * as THREE from 'three';

const { degToRad, radToDeg, clamp } = THREE.MathUtils;

// 縦長の画面か？
const isTall = () => window.innerWidth / window.innerHeight < 0.8;

export function createViewFitter(camera, scene, { bases, onLayout, baseFov = 45, maxFov = 65 }) {
  const view = {
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    lookFrom: new THREE.Vector3(),
    lookTo: new THREE.Vector3(),
  };

  function fit() {
    const mode = isTall() ? 'tall' : 'wide';
    const base = bases[mode];
    if (onLayout) onLayout(mode); // 机の上の並べ方も切り替える

    const aspect = window.innerWidth / window.innerHeight;
    const baseDist = base.to.distanceTo(base.lookTo);
    const half = base.width / 2;

    const needFov = radToDeg(2 * Math.atan(half / (baseDist * aspect)));
    camera.fov = clamp(needFov, baseFov, maxFov);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const dist = Math.max(baseDist, half / (Math.tan(degToRad(camera.fov / 2)) * aspect));
    const k = dist / baseDist;

    view.lookFrom.copy(base.lookFrom);
    view.lookTo.copy(base.lookTo);
    view.to.copy(base.to).sub(base.lookTo).multiplyScalar(k).add(base.lookTo);
    view.from.copy(base.from).sub(base.lookFrom).multiplyScalar(k).add(base.lookFrom);

    if (scene.fog) {
      const extra = dist - baseDist;
      scene.fog.near = base.fogNear + extra;
      scene.fog.far = base.fogFar + extra;
    }
  }

  fit();
  window.addEventListener('resize', fit);
  return view;
}