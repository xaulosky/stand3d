import * as THREE from 'three';
import {OrbitControls} from '../assets/vendor/OrbitControls.js';
import {proposals,dimensions as spec} from './config.js';

const $=id=>document.getElementById(id), N='#143858', Y='#ecab00';
const ART_REV='5',asset=file=>`assets/${file}?v=${ART_REV}`;
const viewer=$('viewer'), query=new URL(location.href).searchParams;
let current=proposals[query.get('propuesta')]?query.get('propuesta'):'laterales';
let sheet=query.get('plancha')==='244'?2.44:2.40, orientation=query.get('pantalla')==='vertical'?'portrait':'landscape';
let scene,camera,renderer,controls,booth,samples,furniture,sides,measurements,planLabels;
let ready=false,currentView='perspective',motion=null,selectedPanel='izquierdo';
let tvVideo,tvTexture,tvPoster,tvScreen,wantsTVPlaying=true;
const images={},reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const panelTitles={izquierdo:'Aplicaciones y geometría',derecho:'Ventajas y nuevos desarrollos',fondo:'Fondo corporativo',cenefa:'Cenefa de identificación'};

function canvas(w,h,color=N){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,w,h);return[c,ctx];}
function text(ctx,s,x,y,size=32,color='#fff',weight=600,align='left'){ctx.font=`${weight} ${size}px Arial, sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(s,x,y);}
function cover(ctx,img,x,y,w,h){const k=Math.max(w/img.width,h/img.height),sw=w/k,sh=h/k;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h);}
function tex(img){const t=img instanceof HTMLCanvasElement?new THREE.CanvasTexture(img):new THREE.Texture(img);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);t.needsUpdate=true;return t;}
function material(color,options={}){return new THREE.MeshStandardMaterial({color,roughness:.72,...options});}
function group(parent,name){const g=new THREE.Group();g.name=name;parent.add(g);return g;}
function box(parent,w,h,d,x,y,z,color='#fff',options={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color,options));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,r,h,x,y,z,color='#667885'){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),material(color,{metalness:.5,roughness:.5}));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function tube(parent,a,b,r=.012,color='#667885'){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),dir=end.clone().sub(start);const m=cylinder(parent,r,dir.length(),0,0,0,color);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return m;}
function plane(parent,w,h,x,y,z,map,rotation=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,side:THREE.FrontSide,toneMapped:false}));m.position.set(x,y,z);m.rotation.y=rotation;parent.add(m);return m;}
function dispose(g){if(!g)return;const geos=new Set(),mats=new Set(),maps=new Set();g.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)for(const m of [o.material].flat()){mats.add(m);if(m.map&&m.map!==tvTexture&&m.map!==tvPoster)maps.add(m.map);}});geos.forEach(g=>g.dispose());maps.forEach(m=>m.dispose());mats.forEach(m=>m.dispose());g.removeFromParent();}

function shell(){
  box(booth,3,.04,3,0,.02,0,'#83909a',{roughness:.95});
  box(booth,2.96,.006,2.96,0,.043,0,'#b8bfc3',{roughness:1});
  box(booth,2.96,2.44,.022,0,1.27,-1.479,'#f3f5f7');
  for(const sign of [-1,1]){
    const wall=box(sides,.022,2.44,2.96,sign*1.479,1.27,0,'#c8d9e5',{transparent:true,opacity:.045,depthWrite:false});wall.castShadow=false;
    const [white]=canvas(4,4,'#f8fafb');plane(sides,2.96,2.44,sign*1.466,1.27,0,tex(white),sign<0?Math.PI/2:-Math.PI/2);
    for(const z of [-1.48,1.48])box(booth,.025,2.46,.025,sign*1.48,1.27,z,'#a9b7c1',{metalness:.6});
    box(sides,.025,.025,2.96,sign*1.48,2.477,0,'#a9b7c1',{metalness:.6});
    for(const z of [-.5,.5])box(sides,.018,2.44,.016,sign*1.454,1.27,z,'#c3cdd5',{metalness:.4});
    const side=plane(sides,sheet,spec.panel.height,sign*1.438,spec.panel.bottom+.61,0,tex(images[sign<0?'izquierdo':'derecho']),sign<0?Math.PI/2:-Math.PI/2);
    side.name=sign<0?'PVC izquierdo':'PVC derecho';side.userData={kind:'printed-panel',width:sheet,height:1.22,thickness:.003};
  }
  box(booth,2.96,.025,.025,0,2.477,-1.48,'#a9b7c1',{metalness:.6});
  // Dos planchas apaisadas, no tres franjas inventadas. Textura continua y junta real a 122 cm.
  const back=box(booth,sheet,2.44,.003,0,1.27,-1.461,'#fff');back.name='PVC fondo · dos planchas';
  const art=plane(booth,sheet,2.44,0,1.27,-1.458,tex(images.fondo));art.name='Fondo corporativo';art.userData={kind:'backdrop',width:sheet,height:2.44,sections:2,orientation:'horizontal'};
  const joint=box(booth,sheet,.002,.001,0,1.27,-1.456,'#6e8191',{transparent:true,opacity:.36});joint.castShadow=false;
  const fascia=group(booth,'Cenefa 240 × 24 cm');
  box(fascia,3,.025,.025,0,2.24,1.48,'#a9b7c1',{metalness:.6});
  box(fascia,2.40,.24,.003,0,2.365,1.46,N);
  plane(fascia,2.40,.24,0,2.365,1.463,tex(images.cenefa));
  for(const x of [-1,0,1]){tube(fascia,[x,2.26,1.38],[x,2.15,1.32],.012,'#9dacb6');const lamp=cylinder(fascia,.035,.095,x,2.13,1.30,'#fff');lamp.rotation.x=-.55;}
}

function sampleMesh(color,corrugated=false){
  // Sección de bandeja de acero, no un techo en miniatura. Perfil ilustrativo.
  const profile=[[-.30,.12],[-.245,.12],[-.195,0],[.195,0],[.245,.12],[.30,.12]],len=spec.sample.length,steps=64;
  const pos=[],idx=[];
  for(let j=0;j<=steps;j++){
    const t=j/steps,z=(t-.5)*len;
    const curve=corrugated?.037*(1-(2*t-1)**2):0;
    for(let i=0;i<profile.length;i++){
      const [x,y]=profile[i];const rib=corrugated?(Math.sin(t*Math.PI*44)*.0035):0;
      pos.push(x,y+curve+rib,z);
    }
  }
  for(let j=0;j<steps;j++)for(let i=0;i<profile.length-1;i++){
    const a=j*profile.length+i,b=a+1,c=a+profile.length,d=c+1;idx.push(a,c,b,b,c,d);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,material(color,{side:THREE.DoubleSide,metalness:.66,roughness:.38}));m.castShadow=true;m.receiveShadow=true;return m;
}
function realSample(p,index){
  const g=group(samples,index?'Bandeja gris corrugada':'Bandeja azul lisa');g.position.set(p.x,.047,p.z);g.rotation.y=p.rotation;
  g.userData={kind:'real-sample',length:1.5,width:.6,widthProvisional:true,profileProvisional:true};
  const tilt=p.tilt||0,mid=p.y+Math.sin(tilt)*.75,leaf=group(g,'Pieza de acero');leaf.position.y=mid;leaf.rotation.x=tilt;
  leaf.add(sampleMesh(index?'#99a5b0':'#276293',index===1));
  // Apoyos esquemáticos sujetos a fabricación; toda la huella permanece dentro de 3 × 3 m.
  for(const t of [-.50,.50]){
    const z=t*Math.cos(tilt),h=mid-t*Math.sin(tilt);
    box(g,.62,.033,.05,0,h-.045,z,'#66717a',{metalness:.6});
    for(const x of p.rearSupports?[.27]:[-.245,.245])tube(g,[x,.03,z],[x,h-.06,z],.012,'#69747d');
    box(g,.57,.017,.20,0,.013,z,'#79848b',{metalness:.4});
  }
  if(tilt)for(const x of [-.245,.245])tube(g,[x,.03,.50*Math.cos(tilt)],[x,mid+.5*Math.sin(tilt)-.06,-.50*Math.cos(tilt)],.009,'#7b858e');
}

function roofModel(parent,x,z,kind){
  const g=group(parent,'Maqueta plástica '+kind);g.position.set(x,.785,z);
  box(g,.27,.012,.235,0,0,0,'#cbd4db');
  const radius=.12,height=kind==='contenedor'?.06:kind==='cubierta'?.065:0;
  if(kind==='contenedor')for(const sign of [-1,1]){
    box(g,.055,.055,.205,sign*.092,.032,0,'#66859c');
    for(let j=0;j<9;j++)box(g,.002,.041,.008,sign*.122,.032,-.083+j*.021,'#a3b8c6');
  }
  const positions=[],indices=[];
  for(let j=0;j<2;j++)for(let i=0;i<=32;i++){const t=i/32*Math.PI;positions.push(Math.cos(t)*radius,Math.sin(t)*(kind==='cubierta'?.065:.105)+height+.015,(j-.5)*.195);}
  for(let i=0;i<32;i++)indices.push(i,i+1,33+i,i+1,34+i,33+i);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
  const roof=new THREE.Mesh(geo,material('#e3e9ed',{side:THREE.DoubleSide,roughness:.5}));roof.castShadow=true;g.add(roof);
  if(kind==='cubierta')for(const sx of [-1,1])for(const sz of [-1,1])tube(g,[sx*.115,.012,sz*.09],[sx*.115,.077,sz*.09],.005,'#ced8df');
  for(let k=0;k<7;k++){
    const points=Array.from({length:33},(_,i)=>{const t=i/32*Math.PI;return new THREE.Vector3(Math.cos(t)*(radius+.001),Math.sin(t)*(kind==='cubierta'?.065:.105)+height+.018,(k/6-.5)*.195);});
    const ring=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.0015,4,false),material('#9caebc'));g.add(ring);
  }
}
function clothPanel(parent,w,h,x,y,z,rotation){
  const geo=new THREE.PlaneGeometry(w,h,60,6),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const yy=p.getY(i),xx=p.getX(i),wave=Math.sin(xx*77)*.007*(.4+(h/2-yy)/h);p.setZ(i,wave);p.setY(i,yy+Math.cos(xx*62)*.003*(h/2-yy)/h);}
  geo.computeVertexNormals();const m=new THREE.Mesh(geo,material('#171e24',{side:THREE.DoubleSide,roughness:1}));m.position.set(x,y,z);m.rotation.y=rotation;m.castShadow=true;m.receiveShadow=true;parent.add(m);
}
function table(p){
  const g=group(furniture,'Mesa con mantel negro y maquetas');g.position.set(p.x,.047,p.z);g.rotation.y=p.rotation;g.userData={kind:'table',...spec.table};
  box(g,1.05,.025,.52,0,.75,0,'#202831',{roughness:1});
  for(const sign of [-1,1]){
    clothPanel(g,1.055,.68,0,.397,sign*.263,sign<0?Math.PI:0);
    clothPanel(g,.525,.68,sign*.529,.397,0,sign<0?-Math.PI/2:Math.PI/2);
  }
  roofModel(g,-.34,-.04,'hangar');roofModel(g,0,-.04,'contenedor');roofModel(g,.34,-.04,'cubierta');
  box(g,.16,.014,.10,.31,.779,.158,'#f0f4f8');box(g,.16,.002,.10,.31,.788,.158,N);
  box(g,.15,.013,.105,-.26,.779,.156,'#e4e9ed');
}
function chair(p){const g=group(furniture,'Silla');g.position.set(p.x,.047,p.z);g.rotation.y=p.rotation;
  box(g,.40,.055,.39,0,.43,0,'#e5e9eb');const back=box(g,.40,.32,.035,0,.625,-.175,'#e5e9eb');back.rotation.x=-.1;
  for(const x of [-.16,.16])for(const z of [-.15,.15])tube(g,[x*1.12,0,z*1.12],[x,.408,z],.01,'#8a969e');
}
function updateTVControl(){
  const b=$('tv-play');b.disabled=!tvVideo;
  b.textContent=tvVideo?.error?'Reintentar video TV':tvVideo?.paused?'Reproducir video TV':'Pausar video TV';
  b.title=tvVideo?.error?'No se pudo cargar el video. Pulsa para reintentar.':'Video de aplicaciones · 60 segundos · sin audio · en bucle';
}
async function playTV(){
  if(!tvVideo)return;wantsTVPlaying=true;if(tvVideo.error)tvVideo.load();
  try{await tvVideo.play();}catch{/* El botón permite iniciar si el navegador bloquea la reproducción automática. */}
  updateTVControl();
}
function initTVVideo(){
  tvVideo=document.createElement('video');tvVideo.id='tv-video';tvVideo.hidden=true;
  tvVideo.muted=true;tvVideo.defaultMuted=true;tvVideo.autoplay=true;tvVideo.loop=true;tvVideo.playsInline=true;tvVideo.preload='auto';
  tvVideo.setAttribute('muted','');tvVideo.setAttribute('playsinline','');tvVideo.setAttribute('webkit-playsinline','');
  tvVideo.poster=asset('video/poster.jpg');tvVideo.src=asset('video/ws-aplicaciones-3d.mp4');document.body.append(tvVideo);
  // Una sola textura y un solo reloj sobreviven a los cambios de propuesta y orientación.
  tvTexture=new THREE.VideoTexture(tvVideo);tvTexture.colorSpace=THREE.SRGBColorSpace;
  tvPoster=tex(images.tvPoster);
  const showVideo=()=>{if(tvScreen){tvScreen.material.map=tvTexture;tvScreen.material.needsUpdate=true;}updateTVControl();};
  tvVideo.addEventListener('loadeddata',showVideo);tvVideo.addEventListener('playing',showVideo);
  tvVideo.addEventListener('pause',updateTVControl);
  tvVideo.addEventListener('error',()=>{if(tvScreen){tvScreen.material.map=tvPoster;tvScreen.material.needsUpdate=true;}updateTVControl();});
  document.addEventListener('pointerdown',()=>{if(ready&&wantsTVPlaying&&tvVideo.paused&&!tvVideo.error)void playTV();},{passive:true});
  void playTV();
}
function television(p){
  const g=group(furniture,'Televisor 93 × 56 cm');g.position.set(p.x,.047,p.z);g.rotation.y=p.rotation;
  const portrait=orientation==='portrait',w=portrait?.56:.93,h=portrait?.93:.56;
  g.userData={kind:'television',width:w,height:h,orientation};
  box(g,.51,.035,.40,0,.055,0,'#4d5963',{metalness:.5});
  for(const x of [-.20,.20])for(const z of [-.15,.15]){const caster=cylinder(g,.029,.03,x,.03,z,'#252d34');caster.rotation.z=Math.PI/2;}
  box(g,.052,1.27,.045,0,.70,-.025,'#626f7a',{metalness:.7});
  box(g,w,h,.045,0,1.36,0,'#171f26',{metalness:.2});
  const sw=w-.027,sh=h-.027,videoWidth=Math.min(sw,sh*16/9),videoHeight=videoWidth*9/16;
  const black=plane(g,sw,sh,0,1.36,.024,null);black.material.color.set('#000000');
  tvScreen=plane(g,videoWidth,videoHeight,0,1.36,.0245,tvVideo.readyState>=2&&!tvVideo.error?tvTexture:tvPoster);
  tvScreen.name='Video de aplicaciones WS';tvScreen.userData={kind:'tv-screen',aspect:16/9};
  box(g,.011,.004,.002,w*.39,1.36-h/2+.008,.024,'#8abb9a');
}

function line(a,b){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]),new THREE.LineBasicMaterial({color:'#9baebb',transparent:true,opacity:.8}));measurements.add(l);}
function label(parent,s,x,y,z,scale=.58){const w=Math.max(300,s.length*38+70),[c,ctx]=canvas(w,125);ctx.clearRect(0,0,w,125);ctx.fillStyle='#fffffff0';ctx.beginPath();ctx.roundRect(5,8,w-10,109,20);ctx.fill();text(ctx,s,w/2,64,62,'#476b84',500,'center');const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(c),depthTest:false,transparent:true,toneMapped:false}));sprite.position.set(x,y,z);sprite.scale.set(scale,scale*125/w,1);sprite.renderOrder=10;parent.add(sprite);}
function dimensionGuides(){
  measurements=group(booth,'Cotas generales');line([-1.5,.035,1.74],[1.5,.035,1.74]);for(const x of [-1.5,1.5])line([x,.035,1.62],[x,.035,1.83]);label(measurements,'3,00 m',0,.07,1.88,.64);
  line([-1.74,.035,-1.5],[-1.74,.035,1.5]);for(const z of [-1.5,1.5])line([-1.85,.035,z],[-1.64,.035,z]);label(measurements,'3,00 m',-1.87,.08,0,.64);
  line([1.74,.025,-1.5],[1.74,2.5,-1.5]);for(const y of [0,2.5])line([1.65,y,-1.5],[1.84,y,-1.5]);label(measurements,'2,50 m',1.90,1.28,-1.5,.64);
  planLabels=group(booth,'Rótulos de planta');const p=proposals[current];
  label(planLabels,'MESA + MAQUETAS',p.table.x,.88,p.table.z,.7);
  label(planLabels,'TV 93 × 56',p.tv.x,1.85,p.tv.z,.65);
  for(let i=0;i<2;i++){const s=p.samples[i];label(planLabels,i?'CORRUGADA':'LISA',s.x,s.y+.27,s.z,.48);}
}
function build(){dispose(booth);booth=group(scene,'Stand '+proposals[current].version);samples=group(booth,'Muestras reales');furniture=group(booth,'Mobiliario');sides=group(booth,'Laterales del recinto y gráficas');
  shell();const p=proposals[current];p.samples.forEach(realSample);table(p.table);p.chairs.forEach(chair);television(p.tv);dimensionGuides();visibility();
}
function visibility(){if(!ready)return;samples.visible=$('show-samples').checked;furniture.visible=$('show-furniture').checked;sides.visible=$('show-sides').checked;measurements.visible=$('show-dimensions').checked;planLabels.visible=currentView==='top'&&$('show-dimensions').checked;planLabels.children.forEach((o,i)=>o.visible=i>1?samples.visible:furniture.visible);}
function urlState(push=true){const u=new URL(location.href);u.searchParams.set('propuesta',current);u.searchParams.set('plancha',String(Math.round(sheet*100)));u.searchParams.set('pantalla',orientation==='portrait'?'vertical':'horizontal');history[push?'pushState':'replaceState']({},'',u);}
function updateUI(){const p=proposals[current];$('proposal-title').textContent=p.version+' · '+p.title;$('description').textContent=p.description;$('tradeoff').textContent=p.tradeoff;$('tags').replaceChildren(...p.tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s;}));
  document.querySelectorAll('[data-proposal]').forEach(b=>{b.classList.toggle('active',b.dataset.proposal===current);b.setAttribute('aria-pressed',b.dataset.proposal===current);});
  $('sheet-size').value=sheet.toFixed(2);$('tv-orientation').value=orientation;updateFallback();
}
function updateFallback(){const p=proposals[current];$('fallback-image').src=asset(`${p.version.toLowerCase()}${currentView==='perspective'?'':'-'+currentView}.jpg`);$('fallback-image').alt=`${p.title} · ${currentView==='top'?'planta':currentView==='front'?'frontal':currentView==='samples'?'muestras':'perspectiva'}`;}
function setProposal(id,push=true){if(!proposals[id])return;current=id;currentView='perspective';updateUI();if(ready){build();setView('perspective',false);}else setView('perspective',false);if(push)urlState();}
const viewNames={perspective:'Perspectiva',front:'Frontal',top:'Planta',samples:'Muestras'};
function viewPose(id){const aspect=viewer.clientWidth/viewer.clientHeight,k=Math.max(1,1.2/aspect);let pos,target;
  if(id==='front'){pos=[.001,1.64,7.3*k];target=[0,1.23,0];}
  else if(id==='top'){pos=[0,7.4*k,.002];target=[0,0,0];}
  else if(id==='samples'){pos=current==='fondo'?[2.7,2.4,3.7]:[2.3,2.5,3.7];target=current==='atril'?[-.53,.62,-.65]:[0,.52,-.28];pos=[pos[0]*k,pos[1]*k,pos[2]*k];}
  else{pos=[4.9*k,3.7*k,6.8*k];target=[0,1.15,0];}
  return{pos:new THREE.Vector3(...pos),target:new THREE.Vector3(...target)};
}
function setView(id,animate=true){if(!viewNames[id])return;currentView=id;$('view-name').textContent=viewNames[id];document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===id);b.setAttribute('aria-pressed',b.dataset.view===id);});updateFallback();if(!ready)return;const to=viewPose(id);controls.maxPolarAngle=Math.PI/2-.005;
  if(animate&&!reducedMotion)motion={start:performance.now(),from:camera.position.clone(),fromTarget:controls.target.clone(),...to};else{motion=null;camera.position.copy(to.pos);controls.target.copy(to.target);controls.update();}visibility();
}
function resize(){if(!renderer)return;const w=viewer.clientWidth,h=viewer.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(ready&&currentView)setView(currentView,false);}
function animate(now){requestAnimationFrame(animate);if(motion){const t=Math.min(1,(now-motion.start)/600),e=1-(1-t)**3;camera.position.lerpVectors(motion.from,motion.pos,e);controls.target.lerpVectors(motion.fromTarget,motion.target,e);if(t===1)motion=null;}controls.update();renderer.render(scene,camera);}
function panel(id=selectedPanel){selectedPanel=id;$('panel-title').textContent=panelTitles[id];$('panel-image').src=asset(`${id}.jpg`);$('panel-image').alt=panelTitles[id];$('download-jpg').href=asset(`${id}.jpg`);$('download-svg').href=asset(`${id}.svg`);
  $('panel-size').textContent=id==='fondo'?`${Math.round(sheet*100)} × 244 cm · dos planchas horizontales`:id==='cenefa'?'240 × 24 cm · cenefa':`${Math.round(sheet*100)} × 122 cm · una plancha horizontal`;
  document.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.panel===id));
}
let toastTimer;function toast(s){clearTimeout(toastTimer);$('toast').textContent=s;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
function bind(){
  document.querySelectorAll('[data-proposal]').forEach(b=>b.addEventListener('click',()=>setProposal(b.dataset.proposal)));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>panel(b.dataset.panel)));
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('open-panels').addEventListener('click',()=>{panel();$('panels-modal').showModal();});$('open-brief').addEventListener('click',()=>$('brief-modal').showModal());
  for(const id of ['show-samples','show-furniture','show-sides','show-dimensions'])$(id).addEventListener('change',visibility);
  $('sheet-size').addEventListener('change',()=>{sheet=Number($('sheet-size').value);if(ready)build();urlState();});
  $('tv-orientation').addEventListener('change',()=>{orientation=$('tv-orientation').value;if(ready)build();urlState();});
  $('tv-play').addEventListener('click',()=>{if(!tvVideo)return;if(tvVideo.paused||tvVideo.error)void playTV();else{wantsTVPlaying=false;tvVideo.pause();}});
  $('reset').addEventListener('click',()=>setView('perspective'));
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(viewer.requestFullscreen)await viewer.requestFullscreen();else toast('La pantalla completa no está disponible.');}catch{toast('La pantalla completa no está disponible.');}});
  $('capture').addEventListener('click',()=>{const a=document.createElement('a');if(ready){renderer.render(scene,camera);a.href=renderer.domElement.toDataURL('image/png');a.download=`WS-${proposals[current].version}-${currentView||'libre'}.png`;}else{a.href=$('fallback-image').src;a.download=`WS-${proposals[current].version}.jpg`;}a.click();});
  addEventListener('popstate',()=>{const q=new URL(location.href).searchParams;sheet=q.get('plancha')==='244'?2.44:2.40;orientation=q.get('pantalla')==='vertical'?'portrait':'landscape';setProposal(proposals[q.get('propuesta')]?q.get('propuesta'):'laterales',false);});
}
async function init(){try{
  const files={...Object.fromEntries(['izquierdo','derecho','fondo','cenefa'].map(k=>[k,asset(`${k}.jpg`)])),tvPoster:asset('video/poster.jpg')};
  await Promise.all(Object.entries(files).map(([k,src])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[k]=img;resolve();};img.onerror=()=>reject(new Error('No se pudo cargar '+src));img.src=src;})));
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  viewer.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Modelo interactivo del stand');
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.05,80);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=2.2;controls.maxDistance=20;
  controls.addEventListener('start',()=>{motion=null;currentView=null;$('view-name').textContent='Vista libre';document.querySelectorAll('[data-view]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});visibility();});
  scene.add(new THREE.HemisphereLight('#eff7ff','#b8c3cc',2.3));scene.add(new THREE.AmbientLight('#fff',.7));
  const sun=new THREE.DirectionalLight('#fff8ee',3);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:20});sun.shadow.bias=-.0004;sun.shadow.normalBias=.017;scene.add(sun);
  const fill=new THREE.DirectionalLight('#dcecff',1);fill.position.set(4,4,-2);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.15}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.position.y=-.004;scene.add(ground);
  initTVVideo();ready=true;build();resize();setView('perspective',false);new ResizeObserver(resize).observe(viewer);$('loading').hidden=true;requestAnimationFrame(animate);
  window.standMeeting={get proposal(){return current;},get scene(){return scene;},get booth(){return booth;},get renderer(){return renderer;},get camera(){return camera;},get samples(){return samples;},get furniture(){return furniture;},get video(){return tvVideo;},get settings(){return{sheet,orientation};},spec,setProposal,setView};
}catch(err){console.error(err);ready=false;tvVideo?.pause();$('loading').hidden=true;$('fallback').hidden=false;$('viewer-type').textContent='VISTA DEL MODELO';if(renderer)renderer.domElement.remove();for(const id of ['show-samples','show-furniture','show-sides','show-dimensions','sheet-size','tv-orientation','tv-play'])$(id).disabled=true;$('tv-play').textContent='Video TV · requiere 3D';}}
updateUI();bind();init();
