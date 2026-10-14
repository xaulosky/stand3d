// Importa los diez TIFF 4× del cliente sin cambiar encuadres ni dimensiones.
// Uso: node reunion/tools/import-upscaled.mjs /ruta/a/los/tiff
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json') : import.meta.url);
const sharp=require('sharp');
const input=process.argv[2];
if(!input)throw Error('Indica la carpeta que contiene los diez TIFF escalados.');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'reunion/assets/imagenes-hd');
await fs.mkdir(out,{recursive:true});
const entries=[
  ['02_Techo_hangar','hangar',5792,4344],
  ['03_Techo_contenedor','contenedor',5792,4344],
  ['04_Techo_cubierta','cubierta',8684,2896],
  ['05_Techo_serviteca','serviteca',6400,3600],
  ['06_AutoCAD_luces','cad-luces',4944,2272],
  ['07_AutoCAD_configuraciones','cad-configuraciones',2196,716],
  ['08_Galpon_campo','campo',6400,3600],
  ['09_Nuevos_desarrollos_superior','cabana',6744,3216],
  ['10_Nuevos_desarrollos_inferior','lodge',6744,3228],
  ['11_Fondo_corporativo','corporativa',5496,4580],
];
const images=[];
for(const [name,key,width,height] of entries){
  const source=`grande${name}-high fidelity v2-4x.tiff`;
  const buffer=await fs.readFile(path.join(input,source));
  const metadata=await sharp(buffer).metadata();
  if(metadata.width!==width||metadata.height!==height)throw Error(`Dimensiones inesperadas en ${source}`);
  const file=`${key}.jpg`,quality=['cabana','cubierta'].includes(key)?95:96;
  await sharp(buffer).toColourspace('srgb').withMetadata({density:300})
    .jpeg({quality,chromaSubsampling:'4:4:4',mozjpeg:true}).toFile(path.join(out,file));
  const converted=await sharp(path.join(out,file)).metadata();
  if(converted.width!==width||converted.height!==height)throw Error(`Cambió la resolución de ${file}`);
  images.push({key,file,source,width,height,quality,sourceSha256:createHash('sha256').update(buffer).digest('hex')});
  console.log(`${file}: ${width} × ${height}`);
}
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({date:'2026-10-14',source:'TIFF escalados 4× entregados por el cliente',conversion:'JPEG calidad 95–96, color sRGB, muestreo 4:4:4. Sin redimensionar ni recortar. Los TIFF originales se conservan por separado.',images},null,2)+'\n');
