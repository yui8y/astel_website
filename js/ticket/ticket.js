import * as THREE from 'three';
import { drawTicketFace } from './ticket-face.js';

const SIZE = { w: 1.875, h: 1, d: 0.02 }; // 絵と同じ縦横比（480:256）、厚みは紙っぽく薄く

export async function createTicket(state) {
  const canvas = await drawTicketFace(state);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;  // 色を正しく出す
  texture.magFilter = THREE.NearestFilter;    // 拡大してもぼかさない（ドットのまま）
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  const edge = new THREE.MeshBasicMaterial({ color: 0xd8ccb0, fog: false });
  const front = new THREE.MeshBasicMaterial({ map: texture, fog: false });
  const back = new THREE.MeshBasicMaterial({ color: 0xe9dfc8, fog: false });

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(SIZE.w, SIZE.h, SIZE.d),
    [edge, edge, edge, edge, front, back] // 面ごとの材質
  );
  mesh.position.set(0, 0, 2.5); // カメラ（z=5）のすぐ前

  return { object: mesh };
}