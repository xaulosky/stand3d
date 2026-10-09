import * as THREE from 'three';

// 93 cm de ancho × 56 cm de alto, según la medida facilitada.
// La profundidad y los pliegues son aproximaciones visuales de la referencia.
export const sampleSpec = Object.freeze({width:.93,height:.56,projection:.38,count:2});
export const displayPosition = Object.freeze({x:.80,y:.08,z:-1.32});
export const sampleLevels = Object.freeze([.54,1.27]);

function block(parent,w,h,d,x,y,z,color,metalness=.35) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,metalness,roughness:.46}));
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function strut(parent,a,b,width,color) {
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  const mesh=block(parent,width,delta.length(),width,0,0,0,color);
  mesh.position.copy(start.add(end).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
}
function caption(parent,value,subtitle,width,height,x,y,z,navy,accent) {
  const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=Math.round(1400*height/width);
  const ctx=canvas.getContext('2d');ctx.fillStyle=navy;ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle=accent;ctx.fillRect(0,canvas.height-7,canvas.width,7);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
  ctx.font=`700 ${subtitle?77:65}px Arial, sans-serif`;ctx.fillText(value,700,canvas.height*(subtitle ? .36 : .48));
  if(subtitle){ctx.font='400 46px Arial, sans-serif';ctx.fillStyle='#d4e0e9';ctx.fillText(subtitle,700,canvas.height*.73);}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map,toneMapped:false}));
  face.position.set(x,y,z);parent.add(face);
}
function foldedSheet(number) {
  const group=new THREE.Group();group.name=`Muestra ${number} · 93 × 56 cm`;
  group.userData={kind:'folded-sample',number,...sampleSpec,projectionApproximate:true};
  // Sección abierta: pestaña superior, pared, base inclinada y retorno frontal.
  const profile=[[.28,0],[.245,.08],[-.04,.09],[-.28,.28],[-.21,.38],[-.17,.31]];
  const vertices=[];
  for(let i=0;i<profile.length-1;i++) {
    const [y1,z1]=profile[i],[y2,z2]=profile[i+1],half=sampleSpec.width/2;
    vertices.push(-half,y1,z1, half,y1,z1, half,y2,z2,
                  -half,y1,z1, half,y2,z2, -half,y2,z2);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
  const sheet=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#b4bdc4',metalness:.38,roughness:.37,side:THREE.DoubleSide}));
  sheet.name='Chapa plegada';sheet.castShadow=true;sheet.receiveShadow=true;group.add(sheet);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,16),new THREE.LineBasicMaterial({color:'#536370',transparent:true,opacity:.8}));
  group.add(edges);return group;
}
export function createSampleDisplay({navy='#143858',accent='#ecab00'}={}) {
  const group=new THREE.Group();group.name='Expositor independiente · Dos muestras';
  group.position.set(displayPosition.x,displayPosition.y,displayPosition.z);
  group.userData={kind:'sample-display',count:sampleSpec.count,freestanding:true};
  const steel='#314757';
  // Base completa dentro de la tarima y sin fijaciones al stand del recinto.
  block(group,.995,.028,.51,0,.021,.17,steel);
  for(const x of [-.45,.45]) {
    block(group,.035,1.88,.035,x,.955,-.025,steel);
    strut(group,[x,.04,.35],[x,.52,-.025],.025,steel);
    block(group,.12,.009,.12,x,.006,.32,'#28313a',0);
  }
  block(group,.93,.026,.028,0,1.65,-.025,steel);
  block(group,.985,.23,.025,0,1.77,-.025,navy);
  caption(group,'MUESTRAS DE CUBIERTA','93 cm ancho × 56 cm alto',.97,.222,0,1.77,-.01,navy,accent);
  sampleLevels.forEach((level,i)=>{
    block(group,.93,.029,.029,0,level+.09,-.023,steel);
    for(const x of [-.32,.32]) {
      strut(group,[x,level-.09,.09],[x,level-.32,.28],.015,steel);
      strut(group,[x,level-.32,.28],[x,level-.35,-.025],.019,steel);
      strut(group,[x,level-.35,-.025],[x,level-.09,.09],.019,steel);
    }
    const number=sampleLevels.length-i;
    const sample=foldedSheet(number);sample.position.y=level;group.add(sample);
    block(group,.93,.075,.022,0,level-.345,.385,navy);
    caption(group,`MUESTRA 0${number}   ·   93 × 56 cm`,'',.925,.07,0,level-.345,.397,navy,accent);
  });
  return group;
}
