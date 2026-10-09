// Composiciones completas, independientes de las juntas entre planchas.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {applications, competitiveBenefits} from '../panel-data.js';
import {wallLayout as spec} from '../wall-layout.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets/panels');
const navy='#143858', yellow='#ecab00', white='#fff', muted='#c8d6e2';
const assets={};
for(const key of ['hangar','contenedor','cubierta','serviteca','campo','cabana','cad-luces','cad-configuraciones'])assets[key]='data:image/jpeg;base64,'+(await fs.readFile(path.join(root,'assets/revision',key+'.jpg'))).toString('base64');
for(const [key,file] of [['logo','assets/logo.jpg'],['corporativa','assets/photos/hangar.jpg']])assets[key]='data:image/jpeg;base64,'+(await fs.readFile(path.join(root,file))).toString('base64');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rect=(x,y,w,h,fill,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`;
const text=(s,x,y,size=36,fill=navy,weight=400,anchor='start')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="Arial, Helvetica, sans-serif">${esc(s)}</text>`;
const lines=(a,x,y,size=34,fill=navy,weight=400,anchor='start')=>a.map((s,i)=>text(s,x,y+i*size*1.3,size,fill,weight,anchor)).join('');
const photo=(key,x,y,w,h,fit='xMidYMid slice')=>key==='cabana'
 ? `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 105 736 480" preserveAspectRatio="xMidYMid slice" overflow="hidden"><image href="${assets[key]}" width="736" height="736"/></svg>`
 : `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden"><image href="${assets[key]}" width="${w}" height="${h}" preserveAspectRatio="${fit}"/></svg>`;
const svg=(body,title)=>`<svg xmlns="http://www.w3.org/2000/svg" width="2900" height="2400" viewBox="0 0 2900 2400" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${body}</svg>`;
function header(title,subtitle){return rect(0,0,2900,2400,'#eef2f5')+rect(0,0,2900,280,navy)+photo('logo',65,30,375,207,'xMidYMid meet')+rect(490,48,2,177,'#54718a')+text(title,550,125,66,white,700)+text(subtitle,553,203,38,muted)+rect(0,276,2900,7,yellow);}
function tile(app,x,y,w,h){const ph=h-215;return rect(x,y,w,h,white,15)+photo(app.photo,x,y,w,ph)+rect(x,y+ph,w,7,yellow)+text(app.title,x+w/2,y+ph+68,46,navy,700,'middle')+lines(app.use,x+w/2,y+ph+124,35,'#597083',400,'middle');}
function cad(x,y,w,h,key,title){return rect(x,y,w,h,white,12)+photo(key,x+20,y+30,w-40,h-132,'xMidYMid meet')+text(title,x+w/2,y+h-46,34,navy,500,'middle');}
function left(layout){let b=header('FABRICACIÓN DE BODEGAS CURVAS','Cuatro soluciones para distintos proyectos');
 if(layout==='cuadricula'){
  applications.forEach((app,i)=>b+=tile(app,70+(i%2)*959,350+Math.floor(i/2)*940,918,895));
  b+=rect(2028,350,802,1835,navy,18)+text('SOLUCIONES',2080,440,46,white,700)+text('TÉCNICAS',2080,500,46,white,700)+text('Luces y configuraciones',2080,565,34,muted);
  b+=cad(2070,630,718,710,'cad-luces','Geometría de la cubierta');
  b+=cad(2070,1385,718,710,'cad-configuraciones','Espacios de uso');
 }else{
  applications.forEach((app,i)=>b+=tile(app,70+i*700,350,660,910));
  b+=rect(70,1320,2760,865,navy,18)+text('SOLUCIONES TÉCNICAS · DISTINTAS LUCES Y CONFIGURACIONES',122,1410,46,white,700);
  b+=cad(115,1465,1320,670,'cad-luces','Geometría de la cubierta');
  b+=cad(1475,1465,1310,670,'cad-configuraciones','Aplicaciones y espacios de uso');
 }
 b+=text('WAREHOUSE SOLUTIONS',70,2315,34,navy,700)+text('TECHOS AUTOPORTANTES',2830,2315,34,'#597083',400,'end');
 return svg(b,'Muro izquierdo · '+layout+' · 290 × 240 cm');}
const iconPaths={
 bolt:'<path d="M57 5 18 52h26L33 95l48-58H55Z" fill="currentColor" stroke="none"/>',
 strength:'<path d="M23 16h54M23 84h54M40 16v68M60 16v68M23 30h54M23 70h54"/>',
 value:'<circle cx="50" cy="50" r="35"/><path d="M61 32c-22-12-37 12-11 18s10 31-13 17M50 22v56"/>',
 weather:'<path d="M50 8 83 21v31q-7 24-33 39Q24 76 17 52V21Z"/><path d="M37 44q6-10 13-19 24 30 7 38-21 11-20-19Z"/>',
 bird:'<path d="M24 61q1-25 21-24 9-19 22-6l14 8-16 4q2 19-21 23l-15 15M20 61l16 5"/><circle cx="50" cy="50" r="41"/><path d="m20 80 60-60"/>',
 dust:'<path d="m16 79 25-50h21l25 50M37 56h30"/><circle cx="19" cy="31" r="3"/><circle cx="76" cy="20" r="3"/><path d="m10 90 80-80"/>',
 shield:'<path d="M50 8 83 21v31q-7 24-33 39Q24 76 17 52V21Z"/><path d="m32 48 13 13 26-29"/>',
 maintenance:'<path d="M67 13a23 23 0 0 0-30 30L11 70a11 11 0 0 0 17 17l27-27a23 23 0 0 0 31-28L72 46 56 31Z"/><path d="m12 13 75 75"/>',
 measure:'<path d="M13 23h74v53H13Z"/><path d="M24 23v15m13-15v10m13-10v15m13-15v10m13-10v15M25 62l12-12m-12 0 12 12"/>',
};
function right(image){let b=rect(0,0,2900,2400,navy)+`<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${navy}"/><stop offset="1" stop-color="${navy}" stop-opacity=".22"/></linearGradient></defs>`;
 b+=photo(image,0,1620,2050,780)+rect(0,1620,2050,780,'url(#fade)');
 b+=photo('logo',62,45,354,195,'xMidYMid meet')+text('VENTAJAS COMPETITIVAS',67,342,66,white,700)+text('GRAN LUZ LIBRE · SOLUCIONES A MEDIDA',70,420,38,yellow,500)+rect(70,470,1900,3,'#52708a');
 competitiveBenefits.forEach((item,i)=>{const col=Math.floor(i/3),row=i%3,x=70+col*647,y=555+row*405;
  b+=`<g transform="translate(${x} ${y}) scale(1.04)" fill="none" color="${yellow}" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">${iconPaths[item.icon]}</g>`;
  b+=lines(item.title,x,y+165,38,white,700)+lines(item.detail,x,y+282,32,muted);
 });
 b+=text('TECHOS AUTOPORTANTES',70,2305,38,white,700);
 b+=rect(2050,0,850,2400,'#f2f5f7')+rect(2050,0,8,2400,yellow)+text('NUEVOS',2118,160,48,navy,500)+text('DESARROLLOS',2118,236,65,navy,700)+text('Casas · Cabañas · Lodge',2118,321,42,navy)+text('Refugios de montaña',2118,382,40,navy);
 b+=photo('cabana',2115,495,720,850)+rect(2115,1345,720,7,yellow)+photo('cabana',2115,1400,720,605)+text('Nuevas formas de habitar',2118,2145,42,navy,600)+text('Diseño y nuevas aplicaciones',2118,2220,34,'#597083');
 return svg(b,'Muro derecho · Nueve ventajas y nuevos desarrollos · '+image);}
function cutting(){let b=rect(0,0,2900,2400,'#f5f7f9')+rect(0,0,2900,340,navy)+text('DESPIECE PROPUESTO',95,145,80,white,700)+text('Plancha de origen: 122 × 240 cm · impresión continua por pared',98,246,43,muted);
 for(const [i,label] of ['FONDO','LATERAL IZQUIERDO','LATERAL DERECHO'].entries()){
  const x=95+i*935,y=510,scale=2.78; b+=text(label,x,y-60,37,navy,700);let offset=0;
  for(const [j,width] of spec.widths.entries()){const w=width*100*scale;b+=rect(x+offset*scale,y,w,240*scale,j===2?'#ecab00':'#d7e3eb')+`<rect x="${x+offset*scale}" y="${y}" width="${w}" height="${240*scale}" fill="none" stroke="white" stroke-width="5"/>`+text(String(Math.round(width*100)),x+(offset+width*50)*scale,y+330,42,navy,700,'middle');offset+=width*100;}
  b+=text('122 + 122 + 46 = 290 cm',x,y+755,37,navy,600)+text('Alto: 240 cm',x,y+818,35,'#597083');
 }
 b+=rect(95,1450,2710,510,white,18)+text('9 PAÑOS INSTALADOS · 8 PLANCHAS ESTIMADAS',155,1550,58,navy,700)+lines(['6 planchas completas + 3 franjas de 46 × 240 cm.','Dos franjas salen de una plancha; la tercera, de otra.','Las imágenes se alinean en las juntas, sin repetir la composición.'],155,1650,44,'#597083');
 b+=text('ÁREA ÚTIL PROVISIONAL',95,2110,45,navy,700)+lines(['Se proponen 290 cm dentro del stand nominal de 300 cm.','Confirmar perfiles, holguras, cortes y sangrado antes de imprimir.'],95,2185,43,'#597083');
 return svg(b,'Despiece de planchas de 122 × 240 cm');}
const files={
 'muro-izquierdo-cuadricula':left('cuadricula'),'muro-izquierdo-fila':left('fila'),
 'muro-derecho-serviteca':right('serviteca'),'muro-derecho-campo':right('campo'),
 'fondo-corporativo':svg(photo('corporativa',0,0,2900,2400,'xMaxYMid slice'),'Fondo final · Imagen Corporativa con su logo WS'),
 'despiece-planchas':cutting(),
};
await fs.mkdir(out,{recursive:true});
for(const [name,body] of Object.entries(files))await fs.writeFile(path.join(out,name+'.svg'),body);
console.log('Creados seis SVG en assets/panels. Exportar JPG a 2400 px de ancho.');
