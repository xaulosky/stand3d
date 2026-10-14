// Genera sólo los nuevos artes de reunion/assets. Requiere sharp.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {applications, benefits} from '../config.js';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json') : import.meta.url);
const sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'reunion/assets');await fs.mkdir(out,{recursive:true});
const N='#143858',Y='#ecab00',W='#fff',M='#cbd9e4';
const assets={},photoSizes={};
const files={
  logo:'assets/logo.jpg',
  ...Object.fromEntries(['contenedor','serviteca','campo','cad-luces','cad-configuraciones'].map(k=>[k,`assets/revision/${k}.jpg`])),
  ...Object.fromEntries(Object.entries({hangar:'hangar-cliente-20261014',cubierta:'cubierta-retocada',corporativa:'fondo-corporativo-natural',cabana:'desarrollo-cabana',lodge:'desarrollo-lodge'}).map(([k,f])=>[k,`reunion/assets/imagenes/${f}.jpg`]))
};
for(const [k,f] of Object.entries(files)){
  let img=sharp(path.join(root,f));
  photoSizes[k]=await img.metadata();
  const b=await img.resize({width:k==='corporativa'?1536:1100,withoutEnlargement:true}).jpeg({quality:88}).toBuffer();
  assets[k]='data:image/jpeg;base64,'+b.toString('base64');
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rect=(x,y,w,h,c,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" rx="${r}"/>`;
const text=(s,x,y,size=32,c=N,weight=400,anchor='start')=>`<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${c}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`;
const lines=(arr,x,y,size=30,c=N,weight=400,anchor='start')=>arr.map((s,i)=>text(s,x,y+i*size*1.24,size,c,weight,anchor)).join('');
const photo=(k,x,y,w,h,fit='xMidYMid slice')=>{
  // El encuadre alto del adjunto conserva la cima del arco en la casilla apaisada.
  if(k==='hangar'){
    const imageHeight=w*photoSizes[k].height/photoSizes[k].width;
    return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden"><image href="${assets[k]}" x="0" y="${-(imageHeight-h)*.22}" width="${w}" height="${imageHeight}" preserveAspectRatio="xMidYMid meet"/></svg>`;
  }
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden"><image href="${assets[k]}" width="${w}" height="${h}" preserveAspectRatio="${fit}"/></svg>`;
};
const svg=(body,w,h,title)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>${esc(title)}</title>${body}</svg>`;
function header(title,subtitle){return rect(0,0,2400,1220,N)+rect(16,16,2368,1188,'#edf1f4')+rect(16,16,2368,190,N)+photo('logo',60,26,280,156,'xMidYMid meet')+rect(380,42,2,113,'#59788f')+text(title,430,94,52,W,700)+text(subtitle,433,155,28,M)+rect(16,204,2368,6,Y);}
function left(){let b=header('TECHOS Y BODEGAS AUTOPORTANTES','Cuatro soluciones para distintos proyectos');
  applications.forEach((a,i)=>{const x=56+(i%2)*801,y=250+Math.floor(i/2)*448,w=769,h=411;
    b+=rect(x,y,w,h,W,8)+photo(a.photo,x,y,w,273)+rect(x,y+273,w,5,Y)+text(a.title,x+w/2,y+327,36,N,700,'middle')+lines(a.use,x+w/2,y+368,26,'#597489',400,'middle');
  });
  b+=rect(1683,250,659,859,N,8)+text('SOLUCIONES TÉCNICAS',2012,310,35,W,700,'middle')+text('Luces y configuraciones',2012,357,27,M,400,'middle');
  b+=rect(1710,395,605,303,W,5)+photo('cad-luces',1726,410,573,273,'xMidYMid meet');
  b+=rect(1710,729,605,244,W,5)+photo('cad-configuraciones',1726,742,573,218,'xMidYMid meet');
  b+=text('GEOMETRÍA DE LA CUBIERTA',2012,1044,28,W,600,'middle');
  b+=text('WAREHOUSE SOLUTIONS',59,1168,25,N,700)+text('FABRICACIÓN A MEDIDA',2342,1168,25,'#647f92',400,'end');
  return svg(b,2400,1220,'Aplicaciones y geometría · una plancha horizontal');
}
const icons={
 bolt:'<path d="M57 5 18 52h26L33 95l48-58H55Z" fill="currentColor" stroke="none"/>',
 strength:'<path d="M23 16h54M23 84h54M40 16v68M60 16v68M23 30h54M23 70h54"/>',
 value:'<circle cx="50" cy="50" r="35"/><path d="M61 32c-22-12-37 12-11 18s10 31-13 17M50 22v56"/>',
 weather:'<path d="M50 8 83 21v31q-7 24-33 39Q24 76 17 52V21Z"/><path d="M37 44q6-10 13-19 24 30 7 38-21 11-20-19Z"/>',
 bird:'<path d="M24 61q1-25 21-24 9-19 22-6l14 8-16 4q2 19-21 23l-15 15M20 61l16 5"/><circle cx="50" cy="50" r="41"/><path d="m20 80 60-60"/>',
 dust:'<path d="m16 79 25-50h21l25 50M37 56h30"/><circle cx="19" cy="31" r="3"/><circle cx="76" cy="20" r="3"/><path d="m10 90 80-80"/>',
 shield:'<path d="M50 8 83 21v31q-7 24-33 39Q24 76 17 52V21Z"/><path d="m32 48 13 13 26-29"/>',
 maintenance:'<path d="M67 13a23 23 0 0 0-30 30L11 70a11 11 0 0 0 17 17l27-27a23 23 0 0 0 31-28L72 46 56 31Z"/>',
 measure:'<path d="M13 23h74v53H13Z"/><path d="M24 23v15m13-15v10m13-10v15m13-15v10m13-10v15"/>',
};
function icon(k,x,y){return `<g transform="translate(${x} ${y}) scale(.78)" fill="none" color="${Y}" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">${icons[k]}</g>`;}
function right(){let b=rect(0,0,2400,1220,N)+photo('logo',55,30,300,160,'xMidYMid meet')+text('VENTAJAS COMPETITIVAS',423,102,57,W,700)+text('ESPACIOS LIBRES · FABRICACIÓN A MEDIDA',427,160,28,Y)+rect(55,211,2290,4,'#4c6c85');
 // En el costado derecho, el borde derecho del arte queda hacia el acceso.
 const developmentX=1783;
 b+=text('NUEVOS DESARROLLOS',developmentX,287,35,W,700)+text('Casas · Cabañas · Lodge',developmentX,336,27,M);
 b+=photo('cabana',developmentX,379,562,268)+rect(developmentX,647,562,5,Y)+text('CABAÑA · PROPUESTA CONCEPTUAL',developmentX,677,21,M,500);
 b+=photo('lodge',developmentX,700,562,269)+rect(developmentX,969,562,5,Y)+text('LODGE · PROPUESTA CONCEPTUAL',developmentX,999,21,M,500);
 b+=text('Nuevas formas de habitar',developmentX,1055,29,W)+rect(1733,261,2,830,'#4c6c85');
 benefits.forEach((a,i)=>{const x=75+(i%3)*544,y=284+Math.floor(i/3)*259;
  b+=icon(a.icon,x,y)+lines(a.title,x,y+129,30,W,700)+lines(a.detail,x,y+208,25,M);
 });
 b+=photo('campo',54,1093,1640,86)+rect(54,1093,1640,86,'#143858b3')+text('SIN COLUMNAS INTERIORES · SOLUCIONES PARA TU PROYECTO',100,1150,29,W,600);
 return svg(b,2400,1220,'Nueve ventajas y nuevos desarrollos · una plancha horizontal');
}
function rear(){let b=rect(0,0,2400,2440,N)+photo('corporativa',18,359,2364,2063)+rect(18,18,2364,341,N)+text('FÁBRICA DE TECHOS',1200,132,94,W,700,'middle')+text('Y BODEGAS AUTOPORTANTES',1200,258,91,W,700,'middle')+rect(100,326,2200,8,Y);return svg(b,2400,2440,'Fondo corporativo · dos planchas horizontales');}
function fascia(){const b=rect(0,0,2400,240,N)+photo('logo',30,22,355,196,'xMidYMid meet')+rect(426,41,2,153,'#5d7b91')+text('FÁBRICA DE TECHOS Y BODEGAS',497,108,61,W,700)+text('AUTOPORTANTES',497,179,61,W,700)+text('2-D02',2280,145,77,Y,700,'end')+rect(0,230,2400,10,Y);return svg(b,2400,240,'Cenefa · 240 × 24 cm');}
for(const [name,body] of [['izquierdo',left()],['derecho',right()],['fondo',rear()],['cenefa',fascia()]]){
 await fs.writeFile(path.join(out,name+'.svg'),body);
 await sharp(Buffer.from(body)).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(path.join(out,name+'.jpg'));
 console.log(name);
}
