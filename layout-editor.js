// Edición local: no se envían distribuciones ni vistas a ningún servidor.
export function createLayoutEditor({THREE,scene,camera,controls,canvas,toast,stopCamera,resetCamera,getContext,restoreContext,freeCamera}) {
  const $=id=>document.getElementById(id), key='ws-stand-views-v1';
  const states=new Map(), defaults=new Map(), histories=new Map();
  let entries=[], proposal='', selected=null, enabled=false, drag=null, views=[];
  const ray=new THREE.Raycaster(), pointer=new THREE.Vector2(), horizontal=new THREE.Plane();
  const selectionBox=new THREE.Box3(), helper=new THREE.Box3Helper(selectionBox,0xecab00);
  helper.material.depthTest=false;helper.material.transparent=true;helper.material.opacity=.95;helper.renderOrder=50;helper.visible=false;scene.add(helper);
  const round=n=>Math.round(n*10000)/10000;
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  function bounds(object){
    const b=new THREE.Box3();object.updateWorldMatrix(true,true);
    object.traverse(o=>{if(!o.isMesh)return;for(let p=o;p&&p!==object;p=p.parent)if(p.userData.helper)return;
      if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));});return b;
  }
  function snapshot(){return Object.fromEntries(entries.map(({id,object})=>[id,{position:object.position.toArray().map(round),rotation:round(object.rotation.y)}]));}
  function apply(data){for(const {id,object} of entries){const t=data[id];if(t){object.position.fromArray(t.position);object.rotation.y=t.rotation;}}refresh();}
  function history(){if(!histories.has(proposal))histories.set(proposal,{past:[],future:[]});return histories.get(proposal);}
  function remember(before){const after=snapshot();if(JSON.stringify(before)!==JSON.stringify(after)){const h=history();h.past.push(before);if(h.past.length>50)h.past.shift();h.future=[];states.set(proposal,after);}refresh();}
  function constrain(object){
    const b=bounds(object), size=b.getSize(new THREE.Vector3());
    if(size.x>3.001||size.z>3.001||size.y>2.501)return false;
    for(const axis of ['x','z'])object.position[axis]+=b.min[axis]<-1.5?-1.5-b.min[axis]:b.max[axis]>1.5?1.5-b.max[axis]:0;
    object.position.y+=b.min.y<0?-b.min.y:b.max.y>2.5?2.5-b.max.y:0;return true;
  }
  function mutate(fn){if(!selected||!visible(selected.object))return;const before=snapshot();fn(selected.object);
    if(!constrain(selected.object)){apply(before);toast('Ese giro supera los límites del stand.');return;}remember(before);}
  function select(id){selected=entries.find(e=>e.id===id)||null;if(selected&&!visible(selected.object)){selected=null;toast('Activa la visibilidad del elemento para moverlo.');}refresh();}
  function setEnabled(value){enabled=value;stopCamera();if(!enabled){finishDrag();selected=null;}canvas.classList.toggle('editing',enabled);$('edit-mode').setAttribute('aria-pressed',String(enabled));$('element-tools').hidden=!enabled;$('editor-help').textContent=enabled?'Selecciona y arrastra. Las flechas mueven sobre el piso.':'Gira el modelo o activa «Mover elementos».';document.querySelector('.gesture').textContent=enabled?'Arrastra el elemento · Arrastra el fondo vacío para girar':'Arrastra para girar · Rueda o pellizco para acercar';refresh();}
  function refresh(){
    if(selected&&!visible(selected.object))selected=null;
    $('element-select').value=selected?.id||'';$('selected-name').textContent=selected?.name||'Selecciona un elemento';
    document.querySelectorAll('[data-transform], [data-nudge], [data-turn], #reset-element').forEach(b=>b.disabled=!selected);
    if(selected){for(const a of ['x','y','z'])$(`position-${a}`).value=(selected.object.position[a]*100).toFixed(1);$('position-angle').value=Math.round(THREE.MathUtils.radToDeg(selected.object.rotation.y));}
    const h=histories.get(proposal);$('undo-layout').disabled=!h?.past.length;$('redo-layout').disabled=!h?.future.length;
    helper.visible=enabled&&!!selected;update();
  }
  function update(){if(helper.visible&&selected)selectionBox.copy(bounds(selected.object));}
  function undo(redo=false){finishDrag();const h=history(),from=redo?h.future:h.past,to=redo?h.past:h.future;if(!from.length)return;to.push(snapshot());apply(from.pop());states.set(proposal,snapshot());refresh();}
  function resetAll(){finishDrag();const before=snapshot();apply(defaults.get(proposal));remember(before);resetCamera();toast('Distribución y cámara restablecidas. Puedes deshacer el cambio.');}
  function coordinates(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);}
  function down(e){
    if(!enabled||e.button!==0||drag)return;coordinates(e);
    const hit=ray.intersectObjects(entries.filter(x=>visible(x.object)).map(x=>x.object),true).find(h=>h.object.isMesh&&!(h.object.material.transparent&&h.object.material.opacity<.2));
    if(!hit){select('');return;}
    let object=hit.object;while(object&&!object.userData.editorId)object=object.parent;if(!object)return;
    select(object.userData.editorId);stopCamera();e.preventDefault();e.stopImmediatePropagation();controls.enabled=false;
    horizontal.set(new THREE.Vector3(0,1,0),-hit.point.y);
    const start=new THREE.Vector3();if(!ray.ray.intersectPlane(horizontal,start)){controls.enabled=true;return;}
    drag={pointerId:e.pointerId,start,original:object.position.clone(),before:snapshot(),clientX:e.clientX,clientY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);
  }
  function move(e){if(!drag||e.pointerId!==drag.pointerId)return;e.preventDefault();e.stopImmediatePropagation();
    if(Math.hypot(e.clientX-drag.clientX,e.clientY-drag.clientY)<4&&!drag.moved)return;drag.moved=true;coordinates(e);
    const point=new THREE.Vector3();if(!ray.ray.intersectPlane(horizontal,point))return;const step=Number($('move-step').value)/100;
    for(const a of ['x','z'])selected.object.position[a]=Math.round((drag.original[a]+point[a]-drag.start[a])/step)*step;
    constrain(selected.object);refresh();
  }
  function finishDrag(e){if(!drag||e&&e.pointerId!==drag.pointerId)return;
    e?.preventDefault();e?.stopImmediatePropagation();const old=drag;drag=null;
    if(canvas.hasPointerCapture(old.pointerId))canvas.releasePointerCapture(old.pointerId);controls.enabled=true;remember(old.before);
  }
  canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('pointermove',move,true);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,finishDrag,true);
  function validView(v){
    const finite=(a,length)=>Array.isArray(a)&&a.length===length&&a.every(x=>Number.isFinite(x)&&Math.abs(x)<=100);
    const c=v?.context;
    return v?.schema===1&&typeof v.name==='string'&&v.name.length<=80&&c&&['muestras','ajustada','corporativa','arco','galeria','beneficios','minimalista','laboratorio'].includes(c.proposal)&&['cuadricula','fila'].includes(c.panelLayout)&&['serviteca','campo'].includes(c.benefitPhoto)&&Number.isFinite(c.cameraScale)&&c.cameraScale>=1&&c.cameraScale<=10&&c.visibility&&['furniture','walls','dimensions','samples','seams'].every(k=>typeof c.visibility[k]==='boolean')&&Object.keys(c.visibility).length===5&&finite(v.camera?.position,3)&&finite(v.camera?.target,3)&&v.layout&&typeof v.layout==='object'&&Object.keys(v.layout).length<50&&Object.values(v.layout).every(t=>finite(t?.position,3)&&Number.isFinite(t.rotation)&&Math.abs(t.rotation)<=Math.PI*20);
  }
  try{const stored=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(stored))views=stored.filter(validView).slice(0,20);}catch{/* Unavailable storage does not block editing. */}
  function saveList(){try{localStorage.setItem(key,JSON.stringify(views));return true;}catch{toast('El navegador no permite guardar aquí. Usa «Exportar vista» para conservarla.');return false;}}
  function refreshViews(){const select=$('saved-views'),previous=select.value;select.replaceChildren(new Option('Elige una vista guardada…',''));views.forEach((v,i)=>select.add(new Option(v.name,String(i))));select.value=previous;['load-view','delete-view'].forEach(id=>$(id).disabled=select.value==='');}
  function capture(name){finishDrag();return {schema:1,name:name.trim().slice(0,80)||'Vista del stand',createdAt:new Date().toISOString(),context:getContext(),layout:snapshot(),camera:{position:camera.position.toArray(),target:controls.target.toArray()}};}
  function restore(v){if(!validView(v)){toast('El archivo no contiene una vista válida del stand.');return false;}
    finishDrag();stopCamera();restoreContext(v.context);const before=snapshot();apply(v.layout);
    // Los archivos externos sólo pueden colocar elementos dentro de la envolvente.
    for(const {object} of entries)if(!constrain(object)){apply(before);toast('La distribución importada supera los límites del stand.');return false;}
    remember(before);const ratio=getContext().cameraScale/v.context.cameraScale;controls.target.fromArray(v.camera.target);camera.position.fromArray(v.camera.position).sub(controls.target).multiplyScalar(ratio).add(controls.target);freeCamera();controls.update();refresh();toast('Vista recuperada: '+v.name);return true;
  }
  function download(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  $('edit-mode').addEventListener('click',()=>setEnabled(!enabled));
  $('element-select').addEventListener('change',e=>select(e.target.value));
  document.querySelectorAll('[data-nudge]').forEach(b=>b.addEventListener('click',()=>mutate(o=>o.position[b.dataset.nudge]+=Number(b.dataset.sign)*Number($('move-step').value)/100)));
  document.querySelectorAll('[data-turn]').forEach(b=>b.addEventListener('click',()=>mutate(o=>o.rotation.y+=THREE.MathUtils.degToRad(Number(b.dataset.turn)))));
  document.querySelectorAll('[data-transform]').forEach(input=>input.addEventListener('change',()=>{if(input.value.trim()===''||!Number.isFinite(Number(input.value))){refresh();return;}mutate(o=>{if(input.dataset.transform==='angle')o.rotation.y=THREE.MathUtils.degToRad(Math.max(-360,Math.min(360,Number(input.value))));else o.position[input.dataset.transform]=Number(input.value)/100;});}));
  $('reset-element').addEventListener('click',()=>mutate(o=>{const d=defaults.get(proposal)[selected.id];o.position.fromArray(d.position);o.rotation.y=d.rotation;}));
  $('undo-layout').addEventListener('click',()=>undo());$('redo-layout').addEventListener('click',()=>undo(true));$('reset-layout').addEventListener('click',resetAll);
  $('save-view').addEventListener('click',()=>{finishDrag();stopCamera();$('view-save-name').value=`${getContext().proposal==='muestras'?'Con muestras':'Stand'} · ${new Date().toLocaleString('es-CL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}`;$('save-view-modal').showModal();$('view-save-name').select();});
  $('save-view-form').addEventListener('submit',e=>{e.preventDefault();const view=capture($('view-save-name').value);if(views.length>=20){toast('Ya tienes 20 vistas. Exporta o elimina una antes de guardar otra.');return;}views.push(view);const saved=saveList();refreshViews();$('saved-views').value=String(views.length-1);$('saved-views').dispatchEvent(new Event('change'));$('saved-panel').open=true;$('save-view-modal').close();if(saved)toast('Vista guardada en este navegador.');});
  $('cancel-save-view').addEventListener('click',()=>$('save-view-modal').close());
  $('saved-views').addEventListener('change',()=>['load-view','delete-view'].forEach(id=>$(id).disabled=$('saved-views').value===''));
  $('load-view').addEventListener('click',()=>{const v=views[Number($('saved-views').value)];if(v)restore(v);});
  $('delete-view').addEventListener('click',()=>{const i=$('saved-views').value;if(i==='')return;views.splice(Number(i),1);saveList();refreshViews();});
  $('export-view').addEventListener('click',()=>download(capture('Distribución '+getContext().proposal),'Warehouse-vista-'+getContext().proposal+'.json'));
  $('import-view').addEventListener('click',()=>$('view-file').click());
  $('view-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>200000)throw Error('size');const v=JSON.parse(await file.text());restore(v);}catch{toast('No se pudo abrir el archivo de vista. Selecciona un JSON exportado del visor.');}e.target.value='';});
  document.addEventListener('keydown',e=>{
    if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||document.querySelector('dialog[open]'))return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo(e.shiftKey);return;}
    if(e.key==='Escape'){select('');return;}if(!enabled||!selected)return;
    const steps={ArrowLeft:['x',-1],ArrowRight:['x',1],ArrowUp:['z',-1],ArrowDown:['z',1]};const step=steps[e.key];if(step){e.preventDefault();mutate(o=>o.position[step[0]]+=step[1]*Number($('move-step').value)/100*(e.shiftKey?5:1));}
  });
  refreshViews();
  return {
    beforeBuild(){finishDrag();if(proposal)states.set(proposal,snapshot());selected=null;helper.visible=false;},
    setObjects(id,objects){proposal=id;entries=objects;defaults.set(id,snapshot());if(states.has(id))apply(states.get(id));$('element-select').replaceChildren(new Option('Selecciona en el modelo o aquí…',''),...entries.map(e=>new Option(e.name,e.id)));refresh();},
    refresh,update,select,setEnabled,undo,resetAll,capture,restore,
    withoutSelection(callback){const previous=helper.visible;helper.visible=false;try{return callback();}finally{helper.visible=previous;}},
    get objects(){return entries;},get selected(){return selected?.id||null;},get enabled(){return enabled;},get layout(){return snapshot();},
  };
}
