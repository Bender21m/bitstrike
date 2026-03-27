import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { Blob } from 'buffer';
import fs from 'fs';

// Polyfill for node
globalThis.Blob = Blob;

async function exportGLB(scene, filename) {
  const exporter = new GLTFExporter();
  const glb = await exporter.parseAsync(scene, { binary: true });
  fs.writeFileSync(filename, Buffer.from(glb));
  console.log(`Exported ${filename} (${(fs.statSync(filename).size/1024).toFixed(1)}KB)`);
}

function createAK47() {
  const scene = new THREE.Scene();
  const g = new THREE.Group();
  
  const darkSteel = new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.35,metalness:.9});
  const steel = new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:.3,metalness:.85});
  const wood = new THREE.MeshStandardMaterial({color:0x8b5e3c,roughness:.75,metalness:.05});
  const blackPoly = new THREE.MeshStandardMaterial({color:0x111111,roughness:.7,metalness:.2});
  const rubber = new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:.95,metalness:0});
  const btcMat = new THREE.MeshStandardMaterial({color:0xf7931a,roughness:.3,metalness:.6,emissive:0xf7931a,emissiveIntensity:.4});

  // Barrel - smooth cylinder with taper
  const barrelPts = [];
  for(let i=0;i<=20;i++){
    const t=i/20;
    const r=0.008-t*0.002;
    barrelPts.push(new THREE.Vector2(r,t*0.45));
  }
  const barrelGeo = new THREE.LatheGeometry(barrelPts,16);
  const barrel = new THREE.Mesh(barrelGeo,darkSteel);
  barrel.rotation.x=-Math.PI/2;barrel.position.set(0,.012,-.2);g.add(barrel);

  // Muzzle brake with slots
  const muzzleGeo = new THREE.LatheGeometry([
    new THREE.Vector2(.013,0),new THREE.Vector2(.014,.005),
    new THREE.Vector2(.012,.01),new THREE.Vector2(.014,.015),
    new THREE.Vector2(.012,.02),new THREE.Vector2(.014,.025),
    new THREE.Vector2(.011,.035),new THREE.Vector2(.01,.04)
  ],12);
  const muzzle = new THREE.Mesh(muzzleGeo,darkSteel);
  muzzle.rotation.x=-Math.PI/2;muzzle.position.set(0,.012,-.62);g.add(muzzle);

  // Receiver with rounded edges
  const recvShape = new THREE.Shape();
  recvShape.moveTo(-.02,-.025);recvShape.lineTo(.02,-.025);
  recvShape.lineTo(.022,-.02);recvShape.lineTo(.022,.02);
  recvShape.lineTo(.02,.025);recvShape.lineTo(-.02,.025);
  recvShape.lineTo(-.022,.02);recvShape.lineTo(-.022,-.02);recvShape.closePath();
  const recvGeo = new THREE.ExtrudeGeometry(recvShape,{depth:.25,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2});
  const recv = new THREE.Mesh(recvGeo,steel);
  recv.rotation.x=-Math.PI/2;recv.position.set(0,0,-.02);g.add(recv);

  // Top cover with ridges
  const topCvr = new THREE.Mesh(new THREE.BoxGeometry(.038,.008,.2),steel);
  topCvr.position.set(0,.03,-.1);g.add(topCvr);
  for(let i=0;i<8;i++){
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(.04,.003,.003),steel);
    ridge.position.set(0,.035,-.18+i*.025);g.add(ridge);
  }

  // Gas tube (cylinder)
  const gasTube = new THREE.Mesh(new THREE.CylinderGeometry(.007,.007,.22,10),darkSteel);
  gasTube.rotation.x=Math.PI/2;gasTube.position.set(0,.04,-.33);g.add(gasTube);

  // Upper handguard (wood, rounded)
  const hgShape = new THREE.Shape();
  hgShape.absarc(0,0,.016,0,Math.PI*2,false);
  const hgGeo = new THREE.ExtrudeGeometry(hgShape,{depth:.18,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:3});
  const hgU = new THREE.Mesh(hgGeo,wood);
  hgU.rotation.x=-Math.PI/2;hgU.position.set(0,.028,-.2);g.add(hgU);

  // Lower handguard
  const hgL = new THREE.Mesh(new THREE.CylinderGeometry(.017,.015,.18,10),wood);
  hgL.rotation.x=Math.PI/2;hgL.position.set(0,-.002,-.3);g.add(hgL);

  // Magazine (curved banana shape using extrude along path)
  const magShape = new THREE.Shape();
  magShape.moveTo(-.014,0);magShape.lineTo(.014,0);magShape.lineTo(.012,.12);magShape.lineTo(-.012,.12);magShape.closePath();
  const magGeo = new THREE.ExtrudeGeometry(magShape,{depth:.018,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:1});
  const mag = new THREE.Mesh(magGeo,new THREE.MeshStandardMaterial({color:0x4a3a2a,roughness:.6,metalness:.4}));
  mag.position.set(0,-.02,-.08);mag.rotation.set(.18,0,0);g.add(mag);

  // Pistol grip (ergonomic shape)
  const gripPts = [
    new THREE.Vector2(.012,0),new THREE.Vector2(.014,.01),
    new THREE.Vector2(.013,.03),new THREE.Vector2(.012,.05),
    new THREE.Vector2(.011,.06),new THREE.Vector2(.01,.065)
  ];
  const gripGeo = new THREE.LatheGeometry(gripPts,10);
  const grip = new THREE.Mesh(gripGeo,blackPoly);
  grip.position.set(0,-.025,-.015);grip.rotation.x=.15;g.add(grip);

  // Stock (solid wood)
  const stockShape = new THREE.Shape();
  stockShape.moveTo(-.014,-.02);stockShape.lineTo(.014,-.02);
  stockShape.quadraticCurveTo(.016,0,.014,.02);
  stockShape.lineTo(-.014,.02);
  stockShape.quadraticCurveTo(-.016,0,-.014,-.02);
  const stockGeo = new THREE.ExtrudeGeometry(stockShape,{depth:.2,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:2});
  const stock = new THREE.Mesh(stockGeo,wood);
  stock.rotation.x=-Math.PI/2;stock.position.set(0,-.008,.02);g.add(stock);

  // Buttplate
  const butt = new THREE.Mesh(new THREE.BoxGeometry(.032,.048,.006),rubber);
  butt.position.set(0,-.005,.22);g.add(butt);

  // Front sight post + hood
  const fPost = new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.03,6),darkSteel);
  fPost.position.set(0,.04,-.5);g.add(fPost);
  const fHood = new THREE.Mesh(new THREE.BoxGeometry(.016,.006,.012),darkSteel);
  fHood.position.set(0,.05,-.5);g.add(fHood);

  // Rear sight
  const rSight = new THREE.Mesh(new THREE.BoxGeometry(.018,.02,.008),steel);
  rSight.position.set(0,.042,-.04);g.add(rSight);

  // Selector
  const sel = new THREE.Mesh(new THREE.BoxGeometry(.002,.018,.006),steel);
  sel.position.set(.024,.01,-.05);g.add(sel);

  // Charging handle
  const ch = new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.012,6),steel);
  ch.rotation.z=Math.PI/2;ch.position.set(.024,.025,-.08);g.add(ch);

  // Bitcoin emblem
  const btc = new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.002,16),btcMat);
  btc.rotation.z=Math.PI/2;btc.position.set(.024,.005,-.06);g.add(btc);

  // Sling loop
  const sling = new THREE.Mesh(new THREE.TorusGeometry(.006,.0015,6,8,Math.PI),steel);
  sling.position.set(0,-.02,.18);sling.rotation.x=Math.PI/2;g.add(sling);

  scene.add(g);
  return scene;
}

function createDeagle() {
  const scene = new THREE.Scene();
  const g = new THREE.Group();
  
  const chrome = new THREE.MeshStandardMaterial({color:0xd0d0d0,roughness:.15,metalness:.95});
  const steel = new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:.3,metalness:.85});
  const darkSteel = new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.35,metalness:.9});
  const rubber = new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:.95,metalness:0});
  const redDot = new THREE.MeshStandardMaterial({color:0xff2200,emissive:0xff2200,emissiveIntensity:1});
  const btcMat = new THREE.MeshStandardMaterial({color:0xf7931a,roughness:.3,metalness:.6,emissive:0xf7931a,emissiveIntensity:.4});

  // Slide (angular, chunky)
  const slideShape = new THREE.Shape();
  slideShape.moveTo(-.018,-.02);slideShape.lineTo(.018,-.02);
  slideShape.lineTo(.019,-.015);slideShape.lineTo(.019,.015);
  slideShape.lineTo(.018,.02);slideShape.lineTo(-.018,.02);
  slideShape.lineTo(-.019,.015);slideShape.lineTo(-.019,-.015);slideShape.closePath();
  const slideGeo = new THREE.ExtrudeGeometry(slideShape,{depth:.2,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:1});
  const slide = new THREE.Mesh(slideGeo,chrome);
  slide.rotation.x=-Math.PI/2;slide.position.set(0,.015,.08);g.add(slide);

  // Serrations
  for(let i=0;i<10;i++){
    const ser = new THREE.Mesh(new THREE.BoxGeometry(.04,.001,.002),new THREE.MeshStandardMaterial({color:0xaaaaaa,roughness:.1,metalness:.95}));
    ser.position.set(0,.015,.01+i*.005);g.add(ser);
  }

  // Barrel (heavy, triangulated profile)
  const barrelPts = [];
  for(let i=0;i<=10;i++){
    const t=i/10;barrelPts.push(new THREE.Vector2(.008-t*.001,t*.25));
  }
  const barrelGeo = new THREE.LatheGeometry(barrelPts,12);
  const barrel = new THREE.Mesh(barrelGeo,darkSteel);
  barrel.rotation.x=-Math.PI/2;barrel.position.set(0,.02,-.12);g.add(barrel);

  // Barrel lug
  const lug = new THREE.Mesh(new THREE.BoxGeometry(.04,.032,.06),chrome);
  lug.position.set(0,.01,-.18);g.add(lug);

  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(.03,.022,.14),steel);
  frame.position.set(0,-.008,-.05);g.add(frame);

  // Trigger guard (angular)
  const tg = new THREE.Mesh(new THREE.BoxGeometry(.032,.003,.045),steel);
  tg.position.set(0,-.025,-.04);g.add(tg);
  const tgF = new THREE.Mesh(new THREE.BoxGeometry(.032,.018,.003),steel);
  tgF.position.set(0,-.018,-.062);g.add(tgF);

  // Trigger
  const trigger = new THREE.Mesh(new THREE.BoxGeometry(.003,.012,.006),steel);
  trigger.position.set(0,-.015,-.04);trigger.rotation.x=-.1;g.add(trigger);

  // Grip (ergonomic rubber)
  const gripPts = [
    new THREE.Vector2(.016,0),new THREE.Vector2(.017,.01),
    new THREE.Vector2(.016,.04),new THREE.Vector2(.015,.06),
    new THREE.Vector2(.014,.075),new THREE.Vector2(.013,.085)
  ];
  const gripGeo = new THREE.LatheGeometry(gripPts,10);
  const grip = new THREE.Mesh(gripGeo,rubber);
  grip.position.set(0,-.02,.01);grip.rotation.x=.2;g.add(grip);

  // Grip texture
  for(let i=0;i<6;i++){
    const gt = new THREE.Mesh(new THREE.BoxGeometry(.035,.001,.034),new THREE.MeshStandardMaterial({color:0x151515,roughness:.8}));
    gt.position.set(0,-.03-i*.009,.01);gt.rotation.x=.2;g.add(gt);
  }

  // Magazine
  const mag = new THREE.Mesh(new THREE.BoxGeometry(.02,.055,.022),steel);
  mag.position.set(0,-.055,-.01);mag.rotation.x=.2;g.add(mag);

  // Front sight (fiber optic red)
  const fSight = new THREE.Mesh(new THREE.SphereGeometry(.003,8,8),redDot);
  fSight.position.set(0,.04,-.24);g.add(fSight);

  // Rear sight notch
  const rsL = new THREE.Mesh(new THREE.BoxGeometry(.004,.01,.004),darkSteel);
  rsL.position.set(-.007,.04,0);g.add(rsL);
  const rsR = rsL.clone();rsR.position.x=.007;g.add(rsR);

  // Hammer
  const hammer = new THREE.Mesh(new THREE.BoxGeometry(.004,.014,.007),steel);
  hammer.position.set(0,.02,.04);hammer.rotation.x=-.3;g.add(hammer);

  // Ejection port
  const ep = new THREE.Mesh(new THREE.BoxGeometry(.001,.01,.02),new THREE.MeshStandardMaterial({color:0x050505}));
  ep.position.set(.02,.02,-.04);g.add(ep);

  // Safety
  const safety = new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.005,8),steel);
  safety.rotation.z=Math.PI/2;safety.position.set(.02,.005,-.02);g.add(safety);

  // Bitcoin emblem
  const btc = new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.002,16),btcMat);
  btc.rotation.z=Math.PI/2;btc.position.set(.02,.015,-.06);g.add(btc);

  scene.add(g);
  return scene;
}

function createAWP() {
  const scene = new THREE.Scene();
  const g = new THREE.Group();

  const darkSteel = new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.35,metalness:.9});
  const steel = new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:.3,metalness:.85});
  const chrome = new THREE.MeshStandardMaterial({color:0xd0d0d0,roughness:.15,metalness:.95});
  const darkWood = new THREE.MeshStandardMaterial({color:0x5a3a1a,roughness:.8,metalness:.05});
  const blackPoly = new THREE.MeshStandardMaterial({color:0x111111,roughness:.7,metalness:.2});
  const rubber = new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:.95,metalness:0});
  const scopeLens = new THREE.MeshStandardMaterial({color:0x4488ff,roughness:.05,metalness:.95,transparent:true,opacity:.5});
  const btcMat = new THREE.MeshStandardMaterial({color:0xf7931a,roughness:.3,metalness:.6,emissive:0xf7931a,emissiveIntensity:.4});

  // Heavy barrel (tapered)
  const barrelPts = [];
  for(let i=0;i<=25;i++){const t=i/25;barrelPts.push(new THREE.Vector2(.01-t*.003,t*.6));}
  const barrelGeo = new THREE.LatheGeometry(barrelPts,14);
  const barrel = new THREE.Mesh(barrelGeo,darkSteel);
  barrel.rotation.x=-Math.PI/2;barrel.position.set(0,.012,-.25);g.add(barrel);

  // Muzzle brake (ported)
  const muzzlePts = [
    new THREE.Vector2(.016,0),new THREE.Vector2(.017,.005),
    new THREE.Vector2(.013,.01),new THREE.Vector2(.017,.015),
    new THREE.Vector2(.013,.02),new THREE.Vector2(.017,.025),
    new THREE.Vector2(.013,.03),new THREE.Vector2(.017,.035),
    new THREE.Vector2(.012,.05),new THREE.Vector2(.011,.06)
  ];
  const muzzleGeo = new THREE.LatheGeometry(muzzlePts,12);
  const muzzleBrake = new THREE.Mesh(muzzleGeo,darkSteel);
  muzzleBrake.rotation.x=-Math.PI/2;muzzleBrake.position.set(0,.012,-.85);g.add(muzzleBrake);

  // Receiver (chunky action)
  const recvShape = new THREE.Shape();
  recvShape.moveTo(-.022,-.026);recvShape.lineTo(.022,-.026);
  recvShape.lineTo(.023,.026);recvShape.lineTo(-.023,.026);recvShape.closePath();
  const recvGeo = new THREE.ExtrudeGeometry(recvShape,{depth:.35,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2});
  const recv = new THREE.Mesh(recvGeo,steel);
  recv.rotation.x=-Math.PI/2;recv.position.set(0,0,.02);g.add(recv);

  // Handguard (free-float, with rail)
  const hg = new THREE.Mesh(new THREE.BoxGeometry(.04,.038,.22),blackPoly);
  hg.position.set(0,.0,-.38);g.add(hg);
  // Picatinny rail
  for(let i=0;i<14;i++){
    const rail = new THREE.Mesh(new THREE.BoxGeometry(.042,.003,.006),blackPoly);
    rail.position.set(0,.021,-.3-i*.014);g.add(rail);
  }

  // Scope mount rings (proper toroids)
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(.024,.004,8,16),darkSteel);
  ring1.position.set(0,.05,-.1);g.add(ring1);
  const ring2 = ring1.clone();ring2.position.z=-.25;g.add(ring2);

  // Scope body (smooth cylinder)
  const scopeGeo = new THREE.CylinderGeometry(.02,.02,.24,16);
  const scope = new THREE.Mesh(scopeGeo,darkSteel);
  scope.rotation.x=Math.PI/2;scope.position.set(0,.07,-.17);g.add(scope);

  // Scope front bell (flared)
  const bellPts = [
    new THREE.Vector2(.02,0),new THREE.Vector2(.022,.01),
    new THREE.Vector2(.025,.025),new THREE.Vector2(.026,.04)
  ];
  const bellGeo = new THREE.LatheGeometry(bellPts,16);
  const bell = new THREE.Mesh(bellGeo,darkSteel);
  bell.rotation.x=-Math.PI/2;bell.position.set(0,.07,-.29);g.add(bell);

  // Lenses
  const fLens = new THREE.Mesh(new THREE.CircleGeometry(.025,16),scopeLens);
  fLens.position.set(0,.07,-.331);g.add(fLens);
  const rLens = new THREE.Mesh(new THREE.CircleGeometry(.019,16),scopeLens);
  rLens.position.set(0,.07,-.05);rLens.rotation.y=Math.PI;g.add(rLens);

  // Turrets
  const turretE = new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.018,10),darkSteel);
  turretE.position.set(0,.095,-.18);g.add(turretE);
  const turretW = turretE.clone();turretW.rotation.z=Math.PI/2;turretW.position.set(.03,.07,-.18);g.add(turretW);

  // Bolt
  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.06,8),chrome);
  bolt.rotation.x=Math.PI/2;bolt.position.set(.025,.02,-.05);g.add(bolt);
  const boltKnob = new THREE.Mesh(new THREE.SphereGeometry(.009,8,8),chrome);
  boltKnob.position.set(.025,.02,-.02);g.add(boltKnob);

  // Grip
  const gripPts = [
    new THREE.Vector2(.014,0),new THREE.Vector2(.015,.01),
    new THREE.Vector2(.014,.035),new THREE.Vector2(.013,.055),
    new THREE.Vector2(.011,.07)
  ];
  const gripGeo = new THREE.LatheGeometry(gripPts,10);
  const grip = new THREE.Mesh(gripGeo,rubber);
  grip.position.set(0,-.025,0);grip.rotation.x=.12;g.add(grip);

  // Trigger guard + trigger
  const tg = new THREE.Mesh(new THREE.BoxGeometry(.033,.003,.035),steel);
  tg.position.set(0,-.028,-.02);g.add(tg);
  const trigger = new THREE.Mesh(new THREE.BoxGeometry(.003,.012,.006),steel);
  trigger.position.set(0,-.02,-.02);g.add(trigger);

  // Stock (thumbhole)
  const stockShape = new THREE.Shape();
  stockShape.moveTo(-.016,-.028);stockShape.lineTo(.016,-.028);
  stockShape.quadraticCurveTo(.018,0,.016,.028);
  stockShape.lineTo(-.016,.028);
  stockShape.quadraticCurveTo(-.018,0,-.016,-.028);
  const stockGeo = new THREE.ExtrudeGeometry(stockShape,{depth:.24,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:2});
  const stock = new THREE.Mesh(stockGeo,darkWood);
  stock.rotation.x=-Math.PI/2;stock.position.set(0,-.008,.02);g.add(stock);

  // Cheek riser
  const cheek = new THREE.Mesh(new THREE.BoxGeometry(.028,.018,.08),darkWood);
  cheek.position.set(0,.025,.16);g.add(cheek);

  // Buttpad
  const buttpad = new THREE.Mesh(new THREE.BoxGeometry(.036,.058,.008),rubber);
  buttpad.position.set(0,-.006,.26);g.add(buttpad);

  // Magazine
  const mag = new THREE.Mesh(new THREE.BoxGeometry(.024,.085,.026),steel);
  mag.position.set(0,-.07,-.1);g.add(mag);

  // Bipod legs
  const bpGeo = new THREE.CylinderGeometry(.003,.003,.12,6);
  const bpL = new THREE.Mesh(bpGeo,darkSteel);
  bpL.position.set(-.015,-.02,-.48);bpL.rotation.x=.3;g.add(bpL);
  const bpR = bpL.clone();bpR.position.x=.015;g.add(bpR);

  // Bipod feet
  const bfGeo = new THREE.BoxGeometry(.008,.003,.015);
  const bfL = new THREE.Mesh(bfGeo,rubber);bfL.position.set(-.015,-.06,-.42);g.add(bfL);
  const bfR = bfL.clone();bfR.position.x=.015;g.add(bfR);

  // Bitcoin on stock
  const btc = new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.002,16),btcMat);
  btc.rotation.z=Math.PI/2;btc.position.set(.019,-.005,.16);g.add(btc);

  scene.add(g);
  return scene;
}

async function main() {
  console.log('Generating weapon models...');
  await exportGLB(createAK47(), 'models/ak47.glb');
  await exportGLB(createDeagle(), 'models/deagle.glb');
  await exportGLB(createAWP(), 'models/awp.glb');
  console.log('Done!');
}

main().catch(e => console.error(e));
