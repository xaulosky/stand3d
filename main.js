import * as THREE from 'three';
import { OrbitControls } from './assets/vendor/OrbitControls.js';
import { brand, photos, benefits, proposals } from './config.js?v=2.0';
import { panelFiles } from './panel-data.js?v=2.0';

const $ = (id) => document.getElementById(id);
const container = $('viewer');
const NAVY = brand.navy, YELLOW = brand.yellow;
let scene, camera, renderer, controls, booth, furniture, sides, dimensions;
let current = 'ajustada', cameraMotion = null, assetImages = {}, ready = false;
let cameraScale = 1;
const query = new URL(location.href).searchParams;
let panelLayout = query.get('distribucion') === 'fila' ? 'fila' : 'cuadricula';
let benefitPhoto = query.get('foto') === 'campo' ? 'campo' : 'serviteca';
let selectedPanel = 'left';
const resourceNames = { logo: brand.logo, ...photos, ...Object.fromEntries(Object.entries(panelFiles).map(([key,src])=>['panel_'+key,src])), rearAdjusted:'assets/revision/fondo-aprobado.jpg' };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`)); img.src = src;
  });
}
function canvas(w, h, color = '#fff') {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
  return [c, ctx];
}
function text(ctx, value, x, y, size, color = NAVY, weight = 650, align = 'left') {
  ctx.fillStyle = color; ctx.font = `${weight} ${size}px Arial, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(value, x, y);
}
function cover(ctx, img, x, y, w, h) {
  const factor = Math.max(w / img.width, h / img.height);
  const sw = w / factor, sh = h / factor;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}
function contain(ctx, img, x, y, w, h) {
  const factor = Math.min(w / img.width, h / img.height);
  const dw = img.width * factor, dh = img.height * factor;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
function texture(c) {
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8); return t;
}
function imageTexture(img) {
  const t=new THREE.Texture(img);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);t.needsUpdate=true;return t;
}
function labelTexture(title, subtitle = '', color = NAVY) {
  const [c, ctx] = canvas(1024, 1040, color);
  contain(ctx, assetImages.logo, 60, 140, 904, 650);
  ctx.fillStyle = YELLOW; ctx.fillRect(0, 976, 1024, 18);
  if (subtitle) text(ctx, subtitle, 512, 890, 29, '#fff', 500, 'center');
  return texture(c);
}
function fasciaTexture() {
  const [c, ctx] = canvas(2400, 208, NAVY);
  text(ctx, brand.stand, 95, 103, 89, '#fff');
  ctx.fillStyle = '#ffffff50'; ctx.fillRect(515, 34, 2, 130);
  // Recorte del isotipo original. No se redibuja ni se deforma.
  ctx.drawImage(assetImages.logo, 0, 0, 800, 310, 620, 23, 414, 160);
  text(ctx, 'Warehouse', 1095, 106, 90, '#fff');
  text(ctx, 'Solutions', 1740, 106, 90, YELLOW);
  ctx.fillStyle = YELLOW; ctx.fillRect(0, 196, 2400, 12);
  return texture(c);
}
function tile(ctx, photo, title, x, y, w, h) {
  cover(ctx, assetImages[photo], x, y, w, h - 72);
  ctx.fillStyle = NAVY; ctx.fillRect(x, y + h - 72, w, 72);
  ctx.fillStyle = YELLOW; ctx.fillRect(x, y + h - 76, w, 5);
  text(ctx, title, x + w / 2, y + h - 33, Math.min(31, w / 12), '#fff', 650, 'center');
}
function wrappedText(ctx, value, x, y, width, size, color, weight = 500) {
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  let line = '';
  for (const word of value.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      text(ctx, line, x, y, size, color, weight); y += size * 1.25; line = word;
    } else line = next;
  }
  text(ctx, line, x, y, size, color, weight);
  return y + size * 1.25;
}
function benefitIcon(ctx, kind, x, y, size) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 100, size / 100);
  ctx.strokeStyle = YELLOW; ctx.fillStyle = YELLOW; ctx.lineWidth = 6;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
  if (kind === 'bolt') {
    ctx.moveTo(14,-48);ctx.lineTo(-32,9);ctx.lineTo(-6,9);ctx.lineTo(-20,49);ctx.lineTo(35,-12);ctx.lineTo(7,-12);ctx.closePath();ctx.fill();
  } else if (kind === 'space') {
    ctx.strokeRect(-39,-39,78,78);
    [[-23,23],[0,0],[23,-23]].forEach(([a,b])=>ctx.strokeRect(a-5,b-5,10,10));
  } else if (kind === 'shield') {
    ctx.moveTo(0,-45);ctx.quadraticCurveTo(20,-29,39,-28);ctx.lineTo(36,9);ctx.quadraticCurveTo(27,31,0,48);ctx.quadraticCurveTo(-27,31,-36,9);ctx.lineTo(-39,-28);ctx.quadraticCurveTo(-20,-29,0,-45);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(-2,15);ctx.lineTo(20,-12);ctx.stroke();
  } else {
    ctx.moveTo(-43,42);ctx.lineTo(-43,-8);ctx.lineTo(0,-43);ctx.lineTo(43,-8);ctx.lineTo(43,42);ctx.closePath();ctx.stroke();
    ctx.strokeRect(-23,-9,46,14);ctx.strokeRect(-22,17,44,25);
    ctx.beginPath();ctx.moveTo(0,42);ctx.lineTo(0,22);ctx.stroke();
  }
  ctx.restore();
}
function benefitGrid(ctx, {x=80,y=240,w=1440,h=620,dark=false}={}) {
  const color = dark ? '#fff' : NAVY, cw = w / 2, ch = h / 2;
  benefits.forEach((item,i)=>{
    const left=x+(i%2)*cw, top=y+Math.floor(i/2)*ch;
    benefitIcon(ctx,item.icon,left+75,top+65,86);
    const after=wrappedText(ctx,item.title,left+145,top+40,cw-170,43,color,700);
    wrappedText(ctx,item.detail,left+145,Math.max(after+12,top+142),cw-180,31,dark?'#cddce9':'#5d7587');
  });
  ctx.fillStyle=dark?'#ffffff30':'#d9e1e7';ctx.fillRect(x+cw,y+5,2,h-25);ctx.fillRect(x,y+ch-15,w,2);
}
function newGraphic(which) {
  const dark = current !== 'minimalista';
  const [c,ctx] = canvas(1600,1200,dark?NAVY:'#fff');
  if(current==='beneficios') {
    if(which==='back') {
      cover(ctx,assetImages.hangar,670,0,930,1200);
      const fade=ctx.createLinearGradient(620,0,1300,0);fade.addColorStop(0,NAVY);fade.addColorStop(1,'#14385800');ctx.fillStyle=fade;ctx.fillRect(620,0,700,1200);
      text(ctx,'SOLUCIONES QUE CONSTRUYEN',75,110,47,'#fff',700);
      benefits.forEach((item,i)=>{
        const y=295+i*225;benefitIcon(ctx,item.icon,115,y,92);
        text(ctx,item.title,205,y-20,45,'#fff',700);
        wrappedText(ctx,item.detail,205,y+43,650,33,'#e3edf5');
      });
    } else if(which==='left') {
      tile(ctx,'hangar','HANGARES',65,60,1470,510);
      tile(ctx,'contenedor','SOBRE CONTENEDOR',65,620,1470,515);
    } else {
      text(ctx,'CUBIERTAS DEPORTIVAS',800,95,64,'#fff',700,'center');
      cover(ctx,assetImages.cubierta,65,175,1470,650);
      ctx.fillStyle=YELLOW;ctx.fillRect(65,825,1470,8);
      text(ctx,'CONOCE NUESTRO MATERIAL',800,1110,46,'#fff',650,'center');
    }
  } else if(current==='minimalista') {
    if(which==='back') {
      ctx.fillStyle=NAVY;ctx.fillRect(195,145,1210,230);
      text(ctx,'ESPACIOS QUE CRECEN',800,255,66,'#fff',700,'center');
      ctx.fillStyle=YELLOW;ctx.fillRect(255,325,230,7);
      cover(ctx,assetImages.hangar,195,375,1210,665);
    } else if(which==='left') {
      tile(ctx,'hangar','HANGARES',95,100,1410,485);
      tile(ctx,'contenedor','SOBRE CONTENEDOR',95,630,1410,485);
    } else {
      text(ctx,'MÁS POSIBILIDADES',800,90,61,NAVY,700,'center');
      benefitGrid(ctx,{x:70,y:185,w:1460,h:530});
      ctx.fillStyle=YELLOW;ctx.fillRect(100,1070,1400,5);
      text(ctx,'Soluciones a la medida de tu proyecto',800,1130,39,NAVY,450,'center');
    }
  } else {
    if(which==='back') {
      text(ctx,'INGENIERÍA A TU ALCANCE',800,115,74,'#fff',700,'center');
      ctx.fillStyle=YELLOW;ctx.fillRect(420,188,760,6);
      benefitGrid(ctx,{x:70,y:260,w:1460,h:585,dark:true});
      // Esquema decorativo de módulos: no representa un plano constructivo.
      ctx.strokeStyle='#7195b3';ctx.lineWidth=2;
      for(let i=0;i<4;i++) {
        const x=230+i*365;
        for(let j=0;j<4;j++) {ctx.beginPath();ctx.moveTo(x-125+j*14,1135-j*14);ctx.lineTo(x-125+j*14,1030-j*14);ctx.ellipse(x+j*14,1030-j*14,125,120,0,Math.PI,Math.PI*2);ctx.lineTo(x+125+j*14,1135-j*14);ctx.stroke();}
      }
    } else if(which==='left') {
      text(ctx,'DEL DISEÑO AL MONTAJE',800,100,68,'#fff',700,'center');
      ctx.fillStyle=YELLOW;ctx.fillRect(90,172,1420,8);
      ctx.beginPath();ctx.moveTo(0,1200);ctx.lineTo(1600,390);ctx.lineTo(1600,570);ctx.lineTo(330,1200);ctx.fill();
      text(ctx,'MATERIALES Y TERMINACIONES',800,1105,47,'#fff',650,'center');
    } else {
      text(ctx,'GRANDES ESPACIOS',800,110,86,'#fff',700,'center');
      cover(ctx,assetImages.hangar,65,220,1470,860);
      ctx.fillStyle=YELLOW;ctx.fillRect(65,212,1470,8);
    }
  }
  return texture(c);
}
function graphic(which) {
  if(['beneficios','minimalista','laboratorio'].includes(current))return newGraphic(which);
  const [c, ctx] = canvas(1600, 1200, current === 'arco' ? NAVY : '#fff');
  if (which === 'back' && current === 'corporativa') {
    ctx.fillStyle = NAVY; ctx.fillRect(0, 0, 1600, 282);
    text(ctx, 'TECHOS AUTOPORTANTES', 800, 120, 73, '#fff', 700, 'center');
    text(ctx, 'Soluciones para grandes espacios', 800, 206, 41, '#fff', 500, 'center');
    ctx.fillStyle = YELLOW; ctx.fillRect(630, 260, 340, 8);
    cover(ctx, assetImages.hangar, 0, 282, 1600, 918);
  } else if (which === 'back' && current === 'arco') {
    cover(ctx, assetImages.hangar, 0, 335, 1600, 865);
    text(ctx, 'GRANDES ESPACIOS', 800, 120, 104, '#fff', 750, 'center');
    text(ctx, 'Sin pilares interiores', 800, 250, 48, YELLOW, 500, 'center');
  } else if (which === 'back') {
    text(ctx, 'UNA SOLUCIÓN PARA CADA PROYECTO', 800, 84, 54, NAVY, 700, 'center');
    ctx.fillStyle = YELLOW; ctx.fillRect(660, 138, 280, 7);
    tile(ctx, 'hangar', 'HANGAR', 55, 180, 725, 475);
    tile(ctx, 'contenedor', 'SOBRE CONTENEDOR', 820, 180, 725, 475);
    tile(ctx, 'cubierta', 'CUBIERTA', 55, 695, 725, 475);
    tile(ctx, 'serviteca', 'SERVITECA', 820, 695, 725, 475);
  } else if (which === 'left' && current === 'corporativa') {
    text(ctx, 'SOLUCIONES A TU MEDIDA', 800, 87, 61, NAVY, 700, 'center');
    tile(ctx, 'hangar', 'HANGAR', 55, 175, 725, 470);
    tile(ctx, 'contenedor', 'SOBRE CONTENEDOR', 820, 175, 725, 470);
    tile(ctx, 'cubierta', 'CUBIERTA', 55, 685, 725, 470);
    tile(ctx, 'serviteca', 'SERVITECA', 820, 685, 725, 470);
  } else if (which === 'left' && current === 'arco') {
    tile(ctx, 'hangar', 'HANGARES', 70, 65, 1460, 505);
    tile(ctx, 'contenedor', 'TECHOS SOBRE CONTENEDORES', 70, 610, 1460, 525);
  } else if (which === 'left') {
    cover(ctx, assetImages.cabana, 0, 275, 1600, 925);
    text(ctx, 'NUEVOS DESARROLLOS', 800, 110, 80, NAVY, 700, 'center');
    text(ctx, 'Casas · Cabañas · Refugios', 800, 205, 45, NAVY, 450, 'center');
    ctx.fillStyle = YELLOW; ctx.fillRect(0, 266, 1600, 9);
  } else if (current === 'corporativa') {
    text(ctx, 'POR QUÉ ELEGIRNOS', 800, 106, 66, NAVY, 700, 'center');
    const rows = [['01', 'Sin pilares interiores', 'Gran luz libre'], ['02', 'Fabricación a medida', 'Adaptada a tu proyecto'], ['03', 'Montaje rápido', 'Soluciones autoportantes']];
    rows.forEach(([n, title, sub], i) => {
      const y = 330 + i * 310;
      ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(180, y, 76, 0, Math.PI * 2); ctx.fill();
      text(ctx, n, 180, y, 52, YELLOW, 600, 'center');
      text(ctx, title, 305, y - 22, 70); text(ctx, sub, 305, y + 67, 40, '#7c8c98', 400);
      if (i < 2) { ctx.fillStyle = '#e5eaf0'; ctx.fillRect(110, y + 155, 1380, 2); }
    });
  } else if (current === 'arco') {
    tile(ctx, 'cubierta', 'CUBIERTAS DEPORTIVAS', 70, 65, 1460, 505);
    tile(ctx, 'serviteca', 'TALLERES Y SERVICIOS VEHICULARES', 70, 610, 1460, 525);
  } else {
    text(ctx, 'CONOCE NUESTROS PROYECTOS', 800, 120, 65, NAVY, 700, 'center');
    ctx.fillStyle = YELLOW; ctx.fillRect(640, 195, 320, 7);
    text(ctx, 'Tecnología y soluciones a medida', 800, 1070, 48, NAVY, 450, 'center');
  }
  return texture(c);
}

function material(color, options = {}) { return new THREE.MeshStandardMaterial({ color, roughness: .68, ...options }); }
function box(parent, w, h, d, x, y, z, color = '#fff', options = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color, options));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function cylinder(parent, r1, r2, height, x, y, z, color, segments = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, height, segments), material(color));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function plane(parent, w, h, x, y, z, map, rotation = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, side: THREE.FrontSide, toneMapped: false }));
  m.position.set(x, y, z); m.rotation.y = rotation; parent.add(m); return m;
}
function tube(parent, a, b, radius, color) {
  const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), dir = to.clone().sub(from);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 10), material(color, {metalness:.6}));
  m.position.copy(from.clone().add(to).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true; parent.add(m); return m;
}
function chair(parent, x, z, rotation = 0, color = '#fff') {
  const g = new THREE.Group(); g.position.set(x, .07, z); g.rotation.y = rotation; parent.add(g);
  cylinder(g, .225, .20, .065, 0, .44, 0, color);
  const back = box(g, .42, .35, .055, 0, .64, -.185, color); back.rotation.x = -.12;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tube(g, [sx*.18, .01, sz*.18], [sx*.13, .41, sz*.13], .013, '#b09470');
}
function table(parent, x, z) {
  cylinder(parent, .355, .355, .04, x, .79, z, '#fff');
  cylinder(parent, .029, .029, .70, x, .42, z, '#a5b0ba');
  cylinder(parent, .235, .235, .025, x, .082, z, '#9ca7ae');
  cylinder(parent, .045, .032, .07, x, .845, z, '#fff');
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.043, 12, 8), material('#6b8c70'));
    leaf.scale.set(.6,1.5,.6); leaf.position.set(x + Math.sin(i*1.4)*.032,.92 + i*.007,z + Math.cos(i*1.4)*.025); parent.add(leaf);
  }
}
function counter(parent, right = false) {
  const x = right ? .98 : -.98, z = 1.10;
  box(parent, .86, .88, .40, x, .51, z, '#f8f9fa');
  box(parent, .91, .035, .45, x, .968, z, '#fff');
  plane(parent, .83, .85, x, .51, z + .205, labelTexture());
  if (current === 'arco') box(parent, .014, .87, .39, x + .437, .51, z, YELLOW);
  box(parent, .15, .018, .20, x-.12, .997, z, NAVY);
  box(parent, .15, .008, .20, x-.12, 1.01, z, '#fafafa');
  if(current==='minimalista') {
    for(let i=0;i<5;i++)box(parent,.016,.84,.014,x-.402+i*.021,.51,z+.218,'#c4a478');
  }
}
function sample(parent, x, y, z, size = .40, rotation = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotation; parent.add(g);
  const radius = size/2;
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, size*.90, 42, 1, true, 0, Math.PI), material('#b7c2cb', {metalness:.8,roughness:.3,side:THREE.DoubleSide}));
  roof.rotation.z = Math.PI/2; roof.rotation.y = Math.PI/2; roof.position.y = 0; g.add(roof);
  // Nervaduras siguiendo la curva de la cubierta.
  for (let k = 0; k < 8; k++) {
    const path = new THREE.EllipseCurve(0, 0, radius+.002, radius+.002, 0, Math.PI, false, 0);
    const points = path.getPoints(32).map(p => new THREE.Vector3(p.x,p.y,(k/7-.5)*size*.90));
    const ring = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, .004, 4, false), material('#dce4e9',{metalness:.7,roughness:.3}));
    g.add(ring);
  }
}
function arch(parent) {
  // Marco decorativo de PVC: plano extruido, no una cubierta estructural.
  const shape = new THREE.Shape(), steps = 64;
  for (let i = 0; i <= steps; i++) {
    const t = Math.PI - i/steps*Math.PI, x = 1.45*Math.cos(t), y=1.21+1.01*Math.sin(t);
    if (!i) shape.moveTo(x,y); else shape.lineTo(x,y);
  }
  for (let i = steps; i >= 0; i--) {
    const t = Math.PI - i/steps*Math.PI; shape.lineTo(1.36*Math.cos(t),1.21+.92*Math.sin(t));
  }
  shape.closePath();
  const g = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,curveSegments:64}),material(NAVY));
  g.position.set(0,.07,1.41); g.castShadow=true; parent.add(g);
  const curve = new THREE.CatmullRomCurve3(Array.from({length:65},(_,i)=>{const t=i/64*Math.PI;return new THREE.Vector3(1.36*Math.cos(t),1.28+.92*Math.sin(t),1.451);}));
  parent.add(new THREE.Mesh(new THREE.TubeGeometry(curve,64,.012,8,false),material(YELLOW)));
  for (const sign of [-1,1]) {
    box(parent,.09,1.21,.035,sign*1.405,.675,1.427,NAVY);
    box(parent,.018,1.21,.008,sign*1.36,.675,1.452,YELLOW);
  }
}
function woodDetails(parent) {
  const colors=['#d5ba93','#d9bf9c','#ceb18b','#dec6a4'];
  for(let i=0;i<14;i++)box(parent,.207,.008,2.94,-1.365+i*.21,.080,0,colors[i%4],{roughness:.9});
  for(const sign of [-1,1]) {
    box(parent,.33,2.13,.026,sign*1.275,1.155,-1.426,'#9f825e');
    for(let i=0;i<8;i++)box(parent,.025,2.13,.035,sign*(1.132+i*.041),1.155,-1.397,colors[i%4]);
  }
}
function wallScreen(parent, sign=1, z=-.32, width=.94, height=.52) {
  box(parent,.048,height,width,sign*1.414,1.49,z,'#202a33');
  const [c,ctx]=canvas(1200,675,NAVY);cover(ctx,assetImages[sign<0?'contenedor':'serviteca'],0,0,1200,675);
  plane(parent,width-.05,height-.05,sign*1.386,1.49,z,texture(c),sign<0?Math.PI/2:-Math.PI/2);
}
function sampleShelf(parent, sign=1, y=.91, z=-.20, count=2) {
  box(parent,.30,.035,.94,sign*1.27,y,z,'#fff');
  box(parent,.044,.09,.86,sign*1.415,y-.06,z,'#f6f7f8');
  for(let i=0;i<count;i++)sample(parent,sign*1.26,y+.023,z+(i-(count-1)/2)*.30,.24,Math.PI/2);
}
function laboratoryFurniture(parent) {
  wallScreen(parent,-1,-.25,1.17,.66);
  sampleShelf(parent,-1,.99,-.25,3);sampleShelf(parent,-1,.61,-.25,2);
  const pedestal=new THREE.Group();pedestal.name='Pedestal de demostración';parent.add(pedestal);
  box(pedestal,.95,.83,.70,-.60,.485,.04,NAVY);
  box(pedestal,.956,.075,.706,-.60,.64,.04,YELLOW);
  box(pedestal,1,.04,.75,-.60,.92,.04,'#fff');
  sample(pedestal,-.60,.945,.04,.74);
  // Banco compacto contra el fondo, bajo la gráfica.
  box(parent,.84,.32,.42,.82,.265,-1.16,'#f6f7f8');
  box(parent,.86,.105,.44,.82,.477,-1.16,NAVY);
  box(parent,.86,.36,.065,.82,.65,-1.345,NAVY);
}
function disposeGroup(g) {
  if (!g) return;
  const geos = new Set(), mats = new Set(), maps = new Set();
  g.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{mats.add(m);if(m.map)maps.add(m.map);});}});
  geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());maps.forEach(x=>x.dispose());scene.remove(g);
}
function dimensionLabel(value, x, y, z) {
  const [c,ctx] = canvas(512,128,'rgba(0,0,0,0)');ctx.clearRect(0,0,512,128);
  ctx.fillStyle='#ffffffeb';ctx.beginPath();ctx.roundRect(35,16,442,96,20);ctx.fill();
  text(ctx,value,256,64,54,'#607b92',550,'center');
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:texture(c),depthTest:false,transparent:true}));
  s.position.set(x,y,z);s.scale.set(.66,.165,1);s.renderOrder=10;dimensions.add(s);
}
function line(a,b) {
  const m = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]),new THREE.LineBasicMaterial({color:'#a8b8c6',transparent:true,opacity:.9}));dimensions.add(m);
}
function makeDimensions() {
  dimensions = new THREE.Group();booth.add(dimensions);
  line([-1.5,.065,1.73],[1.5,.065,1.73]);
  [-1.5,1.5].forEach(x=>line([x,.065,1.61],[x,.065,1.83]));dimensionLabel('3,00 m',0,.09,1.83);
  line([-1.73,.065,-1.5],[-1.73,.065,1.5]);
  [-1.5,1.5].forEach(z=>line([-1.83,.065,z],[-1.61,.065,z]));dimensionLabel('3,00 m',-1.88,.09,0);
  line([1.73,.00,-1.5],[1.73,2.5,-1.5]);
  [0,2.5].forEach(y=>line([1.61,y,-1.5],[1.83,y,-1.5]));dimensionLabel('2,50 m',1.90,1.28,-1.5);
}
function buildAdjusted() {
  const steel='#67727d';
  const frames=new THREE.Group();frames.name='Bastidor independiente conceptual';booth.add(frames);
  const panels=new THREE.Group();panels.name='Paneles de PVC';booth.add(panels);
  // Paredes del recinto: blancas. Las gráficas se soportan en una estructura separada.
  box(booth,3,.07,3,0,.035,0,'#89909a',{roughness:1});
  box(booth,2.94,.008,2.94,0,.074,0,'#b5b9bd',{roughness:1});
  box(booth,2.96,2.15,.028,0,1.155,-1.477,'#f4f5f6');
  for(const sign of [-1,1]) {
    box(sides,.028,2.15,2.94,sign*1.477,1.155,0,'#d5e2ed',{transparent:true,opacity:.07,depthWrite:false});
    const [plain]=canvas(4,4,'#f7f8f9');plane(sides,2.94,2.14,sign*1.459,1.155,0,texture(plain),sign<0?Math.PI/2:-Math.PI/2);
    for(const z of [-1.48,1.48])box(booth,.04,2.23,.04,sign*1.48,1.185,z,'#aebbc6',{metalness:.7});
    box(sides,.037,.035,2.97,sign*1.48,2.244,0,'#aebbc6',{metalness:.7});
    for(const z of [-.5,.5])box(sides,.026,2.15,.018,sign*1.446,1.155,z,'#aebbc6',{metalness:.6});
    // Estructura interior en U, con apoyos dentro de la planta. Se representa sin uniones al recinto.
    for(const z of [-1.39,1.39]) {
      box(frames,.04,2.42,.04,sign*1.39,1.29,z,steel,{metalness:.65});
      box(frames,.46,.016,.13,sign*1.22,.087,z,steel,{metalness:.6});
    }
    box(frames,.036,.036,2.80,sign*1.39,2.228,0,steel,{metalness:.65});
    for(const z of [-1.16,1.16]) {
      box(frames,.03,1.96,.03,sign*1.39,1.06,z,steel,{metalness:.65});
      box(frames,.34,.012,.12,sign*1.245,.085,z,steel,{metalness:.6});
    }
    // Ancho 2,44 m y alto 1,22 m exactos. Borde inferior a 0,80 m.
    const backing=box(panels,.018,1.22,2.44,sign*1.372,1.41,0,'#f4f5f6',{transparent:true,opacity:.12,depthWrite:false});
    backing.name=sign<0?'Soporte del panel izquierdo':'Soporte del panel derecho';
    const face=plane(panels,2.44,1.22,sign*1.361,1.41,0,imageTexture(assetImages['panel_'+(sign<0?panelLayout:benefitPhoto)]),sign<0?Math.PI/2:-Math.PI/2);
    face.name=sign<0?'Panel izquierdo 244 × 122 cm':'Panel derecho 244 × 122 cm';
    face.userData={kind:'printed-panel',side:sign<0?'left':'right',width:2.44,height:1.22,bottom:.80,variant:sign<0?panelLayout:benefitPhoto};
    for(const y of [.79,2.04])box(frames,.026,.022,2.47,sign*1.38,y,0,steel,{metalness:.6});
    for(const z of [-1.234,1.234])box(frames,.026,1.27,.024,sign*1.38,1.415,z,steel,{metalness:.6});
  }
  // Fondo ilustrativo en tres paños verticales. Tamaño útil propuesto, pendiente de medir en recinto.
  box(panels,2.84,2.12,.016,0,1.15,-1.412,'#f5f5f5');
  const rear=plane(panels,2.84,2.12,0,1.15,-1.402,imageTexture(assetImages.rearAdjusted));
  rear.name='Gigantografía de fondo';rear.userData={kind:'backdrop',width:2.84,height:2.12,sections:3};
  for(const x of [-2.84/6,2.84/6])box(panels,.003,2.12,.002,x,1.15,-1.400,'#9aabba',{transparent:true,opacity:.42});
  for(const x of [-1.39,0,1.39])box(frames,.035,2.12,.035,x,1.15,-1.432,steel,{metalness:.65});
  box(frames,2.82,.035,.035,0,2.228,-1.42,steel,{metalness:.65});
  box(frames,2.82,.035,.035,0,.085,-1.42,steel,{metalness:.65});
  // Cenefa en el pórtico independiente, dentro de los 2,5 m totales.
  box(frames,2.82,.254,.030,0,2.373,1.397,NAVY);
  plane(frames,2.82,.254,0,2.373,1.414,fasciaTexture());
  for(const x of [-.95,0,.95]) {
    cylinder(frames,.02,.02,.11,x,2.17,1.31,steel);
    const lamp=cylinder(frames,.04,.04,.14,x,2.10,1.28,'#fff');lamp.rotation.x=-.40;
  }
  counter(furniture);
  table(furniture,.39,-.65);chair(furniture,-.08,-.62,Math.PI/2);chair(furniture,.87,-.62,-Math.PI/2);
  makeDimensions();syncVisibility();
}
function build() {
  disposeGroup(booth);booth = new THREE.Group();scene.add(booth);
  sides = new THREE.Group();booth.add(sides);
  furniture = new THREE.Group();booth.add(furniture);
  if(current==='ajustada'){buildAdjusted();return;}
  // La envolvente completa incluyendo la tarima y cenefa mide 3 × 3 × 2,5 m.
  box(booth,3,.07,3,0,.035,0,'#89909a',{roughness:1});
  box(booth,2.94,.008,2.94,0,.074,0,'#b3b8bd',{roughness:1});
  if(current==='minimalista')woodDetails(booth);
  box(booth,2.96,2.15,.028,0,1.155,-1.477,'#f4f5f6');
  plane(booth,2.94,2.14,0,1.155,-1.459,graphic('back'));
  for (const sign of [-1,1]) {
    // Cara externa tenue: permite ver el interior al orbitar por fuera del stand.
    // La gráfica interior conserva su opacidad y sólo se muestra desde su lado frontal.
    box(sides,.028,2.15,2.94,sign*1.477,1.155,0,'#d5e2ed',{transparent:true,opacity:.07,depthWrite:false});
    plane(sides,2.94,2.14,sign*1.459,1.155,0,graphic(sign<0?'left':'right'),sign<0?Math.PI/2:-Math.PI/2);
    box(booth,.04,2.23,.04,sign*1.48,1.185,1.48,'#aebbc6',{metalness:.7});
    box(booth,.04,2.23,.04,sign*1.48,1.185,-1.48,'#aebbc6',{metalness:.7});
    box(sides,.037,.035,2.97,sign*1.48,2.244,0,'#aebbc6',{metalness:.7});
    for (const z of [-.5,.5])box(sides,.026,2.15,.018,sign*1.446,1.155,z,'#aebbc6',{metalness:.6});
  }
  for (const x of [-.5,.5])box(booth,.018,2.15,.012,x,1.155,-1.45,'#bcc7cf',{metalness:.6});
  box(booth,3,.025,.045,0,2.244,-1.48,'#aebbc6',{metalness:.7});
  box(booth,3,.256,.05,0,2.372,1.475,NAVY);
  plane(booth,2.98,.254,0,2.372,1.503,fasciaTexture());
  box(booth,3,.023,.058,0,2.238,1.473,'#bac4cc',{metalness:.6});
  for (const x of [-1,0,1]) {
    cylinder(booth,.02,.02,.11,x,2.17,1.31,'#adb6bf');
    const lamp = cylinder(booth,.04,.04,.14,x,2.10,1.28,'#fff');lamp.rotation.x = -.40;
  }
  if (current === 'arco') arch(booth);
  counter(furniture,['galeria','beneficios','laboratorio'].includes(current));
  if(current==='laboratorio') {
    laboratoryFurniture(furniture);
  } else if(current==='beneficios') {
    table(furniture,.29,-.79);chair(furniture,-.17,-.74,Math.PI/2);chair(furniture,.79,-.74,-Math.PI/2);
    sampleShelf(furniture,1,.79,.05,2);
  } else if(current==='minimalista') {
    table(furniture,.52,-.72);chair(furniture,.05,-.66,Math.PI/2);chair(furniture,1,-.67,-Math.PI/2);
    sampleShelf(furniture,1,.82,.26,2);
  } else if(current==='galeria') {
    table(furniture,-.64,-.62);chair(furniture,-1.01,-.20,-.50,NAVY);chair(furniture,-.15,-.72,-2.05,NAVY);
    wallScreen(furniture);
    box(furniture,.29,.032,1.12,1.28,.95,-.32,'#fff');
    for(let i=0;i<3;i++)sample(furniture,1.27,.97,-.65+i*.33,.23,-Math.PI/2);
  } else {
    table(furniture,.36,-.61);chair(furniture,-.03,-.58,Math.PI/2);chair(furniture,.89,-.59,-Math.PI/2);
    if(current==='arco') {
      box(furniture,.43,.91,.72,1.14,.535,-.30,NAVY);
      box(furniture,.48,.025,.77,1.14,1.005,-.30,'#fff');sample(furniture,1.14,1.025,-.30,.38,Math.PI/2);
    } else {
      box(furniture,.30,.035,.90,1.27,.91,-.20,'#fff');
      box(furniture,.045,.77,.83,1.415,.50,-.20,'#f6f7f8');
      sample(furniture,1.26,.93,-.42,.24,Math.PI/2);sample(furniture,1.26,.93,-.05,.24,Math.PI/2);
    }
  }
  makeDimensions();syncVisibility();
}
function syncVisibility() {
  if(!ready && !booth)return;
  furniture.visible=$('furniture').checked;sides.visible=$('walls').checked;dimensions.visible=$('dimensions').checked;
  if(controls)controls.autoRotate=$('rotate').checked;
}
function setProposal(id, updateUrl = true) {
  if(!proposals[id])return;const previous=current;current=id;
  document.querySelectorAll('[data-proposal]').forEach(b=>{const active=b.dataset.proposal===id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('description').textContent=proposals[id].description;$('proposal-title').textContent=proposals[id].title;
  $('tags').replaceChildren(...proposals[id].tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s;}));
  $('thumbnail').src=proposals[id].render;$('thumbnail').alt=`Render conceptual: ${proposals[id].title}`;
  $('fallback-image').src=proposals[id].render;$('fallback-image').alt=`Propuesta ${proposals[id].title} del stand`;
  $('revision-controls').hidden=id!=='ajustada';
  if(id!=='ajustada')$('previous-proposals').open=true;
  syncPanelUI();
  if(ready){build();if(id==='ajustada'&&previous!==id)setView('perspective',false);}
  if(updateUrl)writeUrl();
}
function writeUrl(){const url=new URL(location.href);url.searchParams.set('propuesta',current);if(current==='ajustada'){url.searchParams.set('distribucion',panelLayout);url.searchParams.set('foto',benefitPhoto);}else{url.searchParams.delete('distribucion');url.searchParams.delete('foto');}history.replaceState({},'',url);}
function panelDetails() {
  if(selectedPanel==='left')return {title:'Panel izquierdo · '+(panelLayout==='cuadricula'?'Cuadrícula 2 × 2':'Cuatro fotos en fila'),src:panelFiles[panelLayout],size:'244 × 122 cm · horizontal'};
  if(selectedPanel==='right')return {title:'Panel derecho · '+(benefitPhoto==='serviteca'?'Serviteca':'Galpón en el campo'),src:panelFiles[benefitPhoto],size:'244 × 122 cm · horizontal'};
  return {title:'Gigantografía de fondo',src:resourceNames.rearAdjusted,size:'Fondo propuesto: 284 × 212 cm · 3 paños verticales'};
}
function syncPanelUI() {
  $('panel-layout').value=panelLayout;$('modal-layout').value=panelLayout;
  $('benefit-photo').value=benefitPhoto;$('modal-photo').value=benefitPhoto;
  const info=panelDetails();$('panel-title').textContent=info.title;$('panel-image').src=info.src;$('panel-image').alt=info.title;$('panel-size').textContent=info.size;
  $('panel-download').href=info.src;$('panel-original').href=info.src.replace('.jpg','.svg');$('panel-original').hidden=selectedPanel==='back';
  $('modal-layout').parentElement.hidden=selectedPanel!=='left';$('modal-photo').parentElement.hidden=selectedPanel!=='right';
  $('panel-image-wrap').classList.toggle('back-panel',selectedPanel==='back');
  $('panel-note').textContent=selectedPanel==='back'?'Recreación frontal del fondo aprobado. Despiece y medidas útiles por confirmar antes de imprimir.':'Gráfica de revisión. Las fotos conservan la calidad del material recibido. Preparación final para impresión pendiente.';
  document.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.panel===selectedPanel)));
}
function changePanels(kind,value) {
  if(kind==='layout'&&['cuadricula','fila'].includes(value))panelLayout=value;
  if(kind==='photo'&&['serviteca','campo'].includes(value))benefitPhoto=value;
  syncPanelUI();if(ready&&current==='ajustada')build();writeUrl();
}
const presets = {
  perspective:{position:[3.5,2.4,6.3],target:[0,1.04,0],name:'Perspectiva'},
  front:{position:[0,1.7,7.8],target:[0,1.12,0],name:'Frontal'},
  top:{position:[0,8,.001],target:[0,.05,0],name:'Planta'},
  inside:{position:[0,1.65,3.6],target:[0,1.2,-1.3],name:'Interior'},
};
function setView(id, animate=true) {
  if(!ready)return;
  let p=presets[id];if(!p)return;
  if(current==='ajustada'&&id==='perspective')p={...p,position:[.72,2.32,6.3],target:[0,1.15,0]};
  const target=new THREE.Vector3(...p.target);
  const position=new THREE.Vector3(...p.position).sub(target).multiplyScalar(cameraScale).add(target);
  $('rotate').checked=false;controls.autoRotate=false;
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('view-name').textContent=p.name;
  if(animate&&!reducedMotion)cameraMotion={start:performance.now(),from:camera.position.clone(),to:position,fromTarget:controls.target.clone(),toTarget:target};
  else {camera.position.copy(position);controls.target.copy(target);controls.update();}
}
function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const scale=Math.max(1,.95/camera.aspect);if(scale!==cameraScale){cameraMotion=null;camera.position.sub(controls.target).multiplyScalar(scale/cameraScale).add(controls.target);cameraScale=scale;controls.maxDistance=14*scale;controls.update();}}
function animate(now) {
  requestAnimationFrame(animate);
  if(cameraMotion){const t=Math.min((now-cameraMotion.start)/650,1),e=1-Math.pow(1-t,3);camera.position.lerpVectors(cameraMotion.from,cameraMotion.to,e);controls.target.lerpVectors(cameraMotion.fromTarget,cameraMotion.toTarget,e);if(t===1)cameraMotion=null;}
  controls.update();renderer.render(scene,camera);
}
function bindUI() {
  ['panel-layout','modal-layout'].forEach(id=>$(id).addEventListener('change',e=>changePanels('layout',e.target.value)));
  ['benefit-photo','modal-photo'].forEach(id=>$(id).addEventListener('change',e=>changePanels('photo',e.target.value)));
  $('open-panels').addEventListener('click',()=>{syncPanelUI();$('panels-modal').showModal();});
  $('close-panels').addEventListener('click',()=>$('panels-modal').close());
  document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>{selectedPanel=b.dataset.panel;syncPanelUI();}));
  $('panel-zoom').addEventListener('click',()=>{const zoomed=$('panel-image-wrap').classList.toggle('zoomed');$('panel-zoom').setAttribute('aria-pressed',String(zoomed));$('panel-zoom').textContent=zoomed?'Ajustar al ancho':'Ampliar gráfica';});
  $('panels-modal').addEventListener('click',e=>{if(e.target===$('panels-modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  document.querySelectorAll('[data-proposal]').forEach(b=>b.addEventListener('click',()=>setProposal(b.dataset.proposal)));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  ['furniture','walls','dimensions','rotate'].forEach(id=>$(id).addEventListener('change',syncVisibility));
  $('reset').addEventListener('click',()=>setView('perspective'));
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(container.requestFullscreen)await container.requestFullscreen();else throw new Error('unavailable');}catch{toast('Tu navegador no permite pantalla completa.');}});
  $('capture').addEventListener('click',()=>{
    if(!ready)return;
    renderer.render(scene,camera);renderer.domElement.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=`Warehouse-${current}-2-D02.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);},'image/png');
  });
  const dialog=$('reference-modal');
  const showReference=()=>{$('modal-title').textContent=proposals[current].title;$('reference-image').src=proposals[current].render;dialog.showModal();};
  $('reference').addEventListener('click',showReference);$('reference-mobile').addEventListener('click',showReference);
  $('close-modal').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  addEventListener('popstate',()=>{const q=new URL(location.href).searchParams;panelLayout=q.get('distribucion')==='fila'?'fila':'cuadricula';benefitPhoto=q.get('foto')==='campo'?'campo':'serviteca';const id=q.get('propuesta');setProposal(proposals[id]?id:'ajustada',false);});
}
function toast(message){const old=$('toast');if(old)old.remove();const el=document.createElement('div');el.id='toast';el.textContent=message;el.setAttribute('role','status');Object.assign(el.style,{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',background:NAVY,color:'#fff',padding:'12px 18px',borderRadius:'8px',zIndex:99,fontSize:'12px',maxWidth:'90vw'});document.body.append(el);setTimeout(()=>el.remove(),3500);}
async function init() {
  try {
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
    container.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Vista interactiva del stand');
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.05,100);
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=2.0;controls.maxDistance=14;controls.maxPolarAngle=Math.PI/2-.02;controls.autoRotateSpeed=.65;controls.enablePan=true;
    controls.addEventListener('start',()=>{cameraMotion=null;$('view-name').textContent='Vista libre';document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));});
    scene.add(new THREE.HemisphereLight('#f0f7ff','#b4bcc6',2.2));scene.add(new THREE.AmbientLight('#fff',.7));
    const sun=new THREE.DirectionalLight('#fff8ee',3.1);sun.position.set(-3,7,5);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:20});sun.shadow.bias=-.0004;sun.shadow.normalBias=.02;scene.add(sun);
    const fill=new THREE.DirectionalLight('#dae9ff',1.1);fill.position.set(4,3,-2);scene.add(fill);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.15}));ground.rotation.x=-Math.PI/2;ground.position.y=-.002;ground.receiveShadow=true;scene.add(ground);
    const entries=await Promise.all(Object.entries(resourceNames).map(async([key,src])=>[key,await loadImage(src)]));assetImages=Object.fromEntries(entries);
    ready=true;build();setView('perspective',false);resize();new ResizeObserver(resize).observe(container);$('loading').hidden=true;requestAnimationFrame(animate);
    // Estado legible para comprobaciones del visor y futuras integraciones.
    window.standViewer={get proposal(){return current;},get dimensions(){return {width:3,depth:3,height:2.5};},get panelOptions(){return {layout:panelLayout,photo:benefitPhoto};},get scene(){return scene;},get renderer(){return renderer;},get camera(){return camera;},get booth(){return booth;},get furniture(){return furniture;},get sides(){return sides;},setProposal,setView};
  }catch(err){console.error(err);$('loading').hidden=true;$('error').hidden=false;container.classList.add('no-webgl');['furniture','walls','dimensions','rotate'].forEach(id=>$(id).disabled=true);if(booth){ready=false;disposeGroup(booth);}}
}
const initial=new URL(location.href).searchParams.get('propuesta');
setProposal(proposals[initial]?initial:'ajustada',false);bindUI();
init();
