// Genera originales SVG editables. Las imágenes JPG de previsualización se exportan desde estos SVG.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {applications,competitiveBenefits} from '../panel-data.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets/panels');await fs.mkdir(out,{recursive:true});
const navy='#143858',yellow='#ecab00',white='#ffffff',muted='#c8d6e2';
const assets={};
for(const key of ['hangar','contenedor','cubierta','serviteca','campo','cabana','modular','cad-luces','cad-configuraciones'])assets[key]='data:image/jpeg;base64,'+(await fs.readFile(path.join(root,'assets/revision',key+'.jpg'))).toString('base64');
assets.logo='data:image/jpeg;base64,'+(await fs.readFile(path.join(root,'assets/logo.jpg'))).toString('base64');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rect=(x,y,w,h,fill,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`;
const text=(s,x,y,size=32,fill=navy,weight=400,anchor='start')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="Arial, Helvetica, sans-serif">${esc(s)}</text>`;
const lines=(arr,x,y,size=28,fill=navy,weight=400,anchor='start')=>arr.map((s,i)=>text(s,x,y+i*size*1.23,size,fill,weight,anchor)).join('');
const photo=(key,x,y,w,h,fit='xMidYMid slice')=>key==='cabana'
  ? `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 105 736 480" preserveAspectRatio="xMidYMid slice" overflow="hidden"><image href="${assets[key]}" width="736" height="736"/></svg>`
  : `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden"><image href="${assets[key]}" width="${w}" height="${h}" preserveAspectRatio="${fit}"/></svg>`;
function svg(content,title){return `<svg xmlns="http://www.w3.org/2000/svg" width="2440" height="1220" viewBox="0 0 2440 1220" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${content}</svg>`;}
function header(title,subtitle){return rect(0,0,2440,1220,'#eef2f5')+rect(0,0,2440,198,navy)+photo('logo',62,20,300,162,'xMidYMid meet')+rect(397,38,2,115,'#54718a')+text(title,449,91,57,white,700)+text(subtitle,452,148,29,muted,400)+rect(0,195,2440,7,yellow);}
function tile(app,x,y,w,h,small=false){
 const ph=h-(small?175:136);return rect(x,y,w,h,white,12)+photo(app.photo,x,y,w,ph)+rect(x,y+ph,w,5,yellow)+text(app.title,x+w/2,y+ph+49,small?30:38,navy,700,'middle')+lines(small?(app.useNarrow??app.use):app.use,x+w/2,y+ph+89,small?25:27,'#597083',400,'middle');
}
function cadColumn(x,y,w,h){return rect(x,y,w,h,navy,14)+text('SOLUCIONES TÉCNICAS',x+34,y+62,34,white,700)+text('Distintas luces y configuraciones',x+34,y+109,25,muted)+rect(x+32,y+151,w-64,312,white,8)+photo('cad-luces',x+43,y+172,w-86,266,'xMidYMid meet')+text('Geometría de la cubierta',x+w/2,y+500,26,white,400,'middle')+rect(x+32,y+546,w-64,238,white,8)+photo('cad-configuraciones',x+43,y+565,w-86,196,'xMidYMid meet')+text('Aplicaciones y espacios de uso',x+w/2,y+827,25,white,400,'middle');}
function left(layout){let body=header('FABRICACIÓN DE BODEGAS CURVAS','Cuatro soluciones para distintos proyectos');
 if(layout==='cuadricula'){
  applications.forEach((app,i)=>{body+=tile(app,60+(i%2)*808,242+Math.floor(i/2)*457,775,424);});
  body+=cadColumn(1710,242,670,881);
 } else {
  applications.forEach((app,i)=>{body+=tile(app,60+i*408,242,385,659,true);});
  body+=rect(60,937,1609,186,white,12)+text('UNA CUBIERTA, MÚLTIPLES APLICACIONES',105,1009,37,navy,700)+text('Fabricación a medida para distintos espacios y actividades.',105,1070,31,'#597083');
  body+=cadColumn(1710,242,670,881);
 }
 body+=text('WAREHOUSE SOLUTIONS',60,1180,25,navy,700)+text('TECHOS AUTOPORTANTES',2380,1180,25,'#597083',400,'end');
 return svg(body,'Panel izquierdo · '+(layout==='cuadricula'?'cuadrícula 2 × 2':'cuatro fotografías en fila')+' · 244 × 122 cm');}
const iconPaths={
 bolt:'<path d="M57 5 18 52h26L33 95l48-58H55Z" fill="currentColor" stroke="none"/>',
 strength:'<path d="M23 16h54M23 84h54M40 16v68M60 16v68M23 30h54M23 70h54"/><path d="m12 46-6 6 6 6m76-12 6 6-6 6"/>',
 value:'<circle cx="50" cy="50" r="35"/><path d="M61 32c-22-12-37 12-11 18s10 31-13 17M50 22v56"/>',
 weather:'<path d="M50 8 83 21v31q-7 24-33 39Q24 76 17 52V21Z"/><path d="M37 44q6-10 13-19 24 30 7 38-21 11-20-19Z"/>',
 bird:'<path d="M24 61q1-25 21-24 9-19 22-6l14 8-16 4q2 19-21 23l-15 15M20 61l16 5"/><circle cx="61" cy="34" r="1"/><circle cx="50" cy="50" r="41"/><path d="m20 80 60-60"/>',
 dust:'<path d="m16 79 25-50h21l25 50M37 56h30"/><circle cx="19" cy="31" r="3"/><circle cx="76" cy="20" r="3"/><circle cx="80" cy="46" r="2"/><path d="m10 90 80-80"/>',
 shield:'<path d="M50 8 83 21v31q-7 24-33 39Q24 76 17 52V21Z"/><path d="m32 48 13 13 26-29"/>',
 maintenance:'<path d="M67 13a23 23 0 0 0-30 30L11 70a11 11 0 0 0 17 17l27-27a23 23 0 0 0 31-28L72 46 56 31Z"/><path d="m12 13 75 75"/>',
 measure:'<path d="M13 23h74v53H13Z"/><path d="M24 23v15m13-15v10m13-10v15m13-15v10m13-10v15M25 62l12-12m-12 0 12 12m26 0 12-12m-12 0 12 12"/>',
};
function icon(kind,x,y){return `<g transform="translate(${x} ${y}) scale(.72)" fill="none" color="${yellow}" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">${iconPaths[kind]}</g>`;}
function right(image){
 let b=rect(0,0,2440,1220,navy)+`<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${navy}"/><stop offset="1" stop-color="${navy}" stop-opacity=".25"/></linearGradient></defs>`;
 b+=photo(image,0,873,1810,347)+rect(0,873,1810,347,'url(#fade)');
 b+=photo('logo',60,25,290,164,'xMidYMid meet')+rect(387,42,2,116,'#54718a')+text('VENTAJAS COMPETITIVAS',438,89,57,white,700)+text('GRAN LUZ LIBRE · SOLUCIONES A MEDIDA',440,148,29,yellow,500)+rect(60,218,1690,3,'#52708a');
 competitiveBenefits.forEach((item,i)=>{
  const col=Math.floor(i/3),row=i%3,x=61+col*581,y=274+row*222;
  b+=icon(item.icon,x,y+2)+lines(item.title,x+92,y+32,31,white,700)+lines(item.detail,x+92,y+(item.title.length>1?125:95),27,muted);
 });
 b+=text('TECHOS AUTOPORTANTES',62,1157,30,white,700);
 b+=rect(1820,0,620,1220,'#f2f5f7')+rect(1820,0,8,1220,yellow)+text('NUEVOS',1870,75,38,navy,500)+text('DESARROLLOS',1870,130,45,navy,700)+text('Casas · Cabañas · Lodge',1870,182,30,navy)+text('Refugios de montaña',1870,225,30,navy);
 b+=photo('cabana',1866,270,528,455)+rect(1866,725,528,5,yellow)+photo('cabana',1866,758,528,269)+text('Nuevas formas de habitar',1870,1098,32,navy,600)+text('Diseño y nuevas aplicaciones',1870,1150,26,'#597083');
 return svg(b,'Panel derecho · Nueve ventajas y nuevos desarrollos · Fondo '+image+' · 244 × 122 cm');
}
for(const layout of ['cuadricula','fila'])await fs.writeFile(path.join(out,'izquierdo-'+layout+'.svg'),left(layout));
for(const image of ['serviteca','campo'])await fs.writeFile(path.join(out,'derecho-'+image+'.svg'),right(image));
console.log('Creados cuatro originales SVG en assets/panels.');
