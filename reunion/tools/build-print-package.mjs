// Crea el ZIP de imprenta al publicar, sin guardar archivos grandes en Git.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json') : import.meta.url);
const sharp=require('sharp');
sharp.concurrency(2);
sharp.cache({memory:128});
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'descargas');
const target=path.join(output,'WS_Paneles_completos_para_imprimir.zip');
const work=await fs.mkdtemp(path.join(os.tmpdir(),'ws-print-'));
const panels=[
  {id:'izquierdo',name:'01_Lateral_izquierdo_240x122cm',w:2400,h:1220,y:0},
  {id:'derecho',name:'02_Lateral_derecho_240x122cm',w:2400,h:1220,y:0},
  {id:'fondo',name:'03_Fondo_completo_240x244cm',w:2400,h:2440,y:0},
  {id:'fondo',name:'04_Fondo_superior_240x122cm',w:2400,h:1220,y:0},
  {id:'fondo',name:'05_Fondo_inferior_240x122cm',w:2400,h:1220,y:1220},
  {id:'cenefa',name:'06_Cenefa_240x24cm',w:2400,h:240,y:0},
];

async function completeSVG(id){
  let body=await fs.readFile(path.join(root,'assets',id+'.svg'),'utf8');
  const refs=new Set([...body.matchAll(/<image\b[^>]*\bhref="([^"]+)"/g)].map(m=>m[1]));
  for(const href of refs){
    if(href.startsWith('data:image/'))continue;
    if(!/^imagenes-hd\/[a-z-]+\.jpg$/.test(href))throw Error('Referencia de imagen inesperada: '+href);
    const bytes=await fs.readFile(path.join(root,'assets',href));
    body=body.replaceAll(`href="${href}"`,`href="data:image/jpeg;base64,${bytes.toString('base64')}"`);
  }
  return body;
}

try{
  await fs.mkdir(output,{recursive:true});
  await fs.mkdir(path.join(work,'JPG_150ppp'));
  await fs.mkdir(path.join(work,'SVG_imagenes_HD'));
  const records=[];
  for(const p of panels){
    let body=await completeSVG(p.id);
    body=body.replace(/<svg\b[^>]*>/,tag=>tag
      .replace(/\bwidth="[^"]*"/,`width="${p.w}mm"`)
      .replace(/\bheight="[^"]*"/,`height="${p.h}mm"`)
      .replace(/\bviewBox="[^"]*"/,`viewBox="0 ${p.y} ${p.w} ${p.h}"`)
      .replace(/>$/,' overflow="hidden">'));
    body=body.replace(/<title>[^<]*<\/title>/,`<title>Warehouse Solutions · ${p.name.replaceAll('_',' ')}</title>`);
    await fs.writeFile(path.join(work,'SVG_imagenes_HD',p.name+'.svg'),body);

    // La copia SVG usa mm. Rasterizar con unidades lógicas evita aplicar dos
    // veces la densidad. Nimbus Sans reproduce la fuente del primer paquete.
    const raster=body.replace(/<svg\b[^>]*>/,tag=>tag
      .replace(/\bwidth="[^"]*"/,`width="${p.w}"`)
      .replace(/\bheight="[^"]*"/,`height="${p.h}"`))
      .replaceAll('font-family="Arial, Helvetica, sans-serif"','font-family="Nimbus Sans, Arial, Helvetica, sans-serif"');
    const jpg=path.join(work,'JPG_150ppp',p.name+'.jpg');
    // Sólo SVG locales conocidos: sus fotografías base64 superan el límite
    // predeterminado de tamaño de atributo del lector XML.
    await sharp(Buffer.from(raster),{density:72*150/25.4,unlimited:true})
      .withMetadata({density:150})
      .jpeg({quality:95,chromaSubsampling:'4:4:4'}).toFile(jpg);
    const m=await sharp(jpg).metadata();
    if(Math.abs(m.width-p.w/25.4*150)>1||Math.abs(m.height-p.h/25.4*150)>1||m.density!==150){
      throw Error('Dimensiones de impresión incorrectas: '+p.name);
    }
    records.push([p.name,p.w/10,p.h/10,m.width,m.height,150,'sRGB']);
    console.log(`${p.name}: ${m.width} × ${m.height} px · 150 ppp`);
  }
  await fs.writeFile(path.join(work,'MEDIDAS.csv'),'\uFEFFarchivo;ancho_cm;alto_cm;ancho_px;alto_px;ppp;color\n'
    +records.map(r=>r.join(';')).join('\n')+'\n');
  await fs.copyFile(path.join(root,'tools','LEEME_IMPRENTA.txt'),path.join(work,'LEEME_IMPRENTA.txt'));
  execFileSync('python3',['-c',`
import sys, zipfile
from pathlib import Path
source, target = map(Path, sys.argv[1:])
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for item in sorted(source.rglob('*')):
        if item.is_file():
            archive.write(item, item.relative_to(source))
with zipfile.ZipFile(target) as archive:
    assert len(archive.namelist()) == 14, 'Se esperaban 14 archivos'
    assert archive.testzip() is None, 'ZIP dañado'
`,work,target+'.tmp'],{stdio:'inherit'});
  await fs.rename(target+'.tmp',target);
  console.log(`ZIP listo: ${target} (${(await fs.stat(target)).size} bytes)`);
}finally{
  await fs.rm(work,{recursive:true,force:true});
  await fs.rm(target+'.tmp',{force:true});
}
