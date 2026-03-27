import { Blob } from 'buffer';
globalThis.Blob = Blob;

// Polyfill FileReader for Node.js
globalThis.FileReader = class FileReader {
  constructor() { this.onload = null; this.result = null; }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
    });
  }
};

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'fs';

async function exp(scene, file) {
  const exporter = new GLTFExporter();
  const data = await exporter.parseAsync(scene, { binary: true });
  fs.writeFileSync(file, Buffer.from(data));
  console.log(file + ': ' + (fs.statSync(file).size/1024).toFixed(1) + 'KB');
}

// Quick test
const scene = new THREE.Scene();
const g = new THREE.Group();
const m = new THREE.MeshStandardMaterial({color:0x3a3a3a});
g.add(new THREE.Mesh(new THREE.BoxGeometry(.04,.05,.2), m));
scene.add(g);
try {
  await exp(scene, 'models/test.glb');
  console.log('GLB export works!');
} catch(e) {
  console.error('Error:', e.message);
}
