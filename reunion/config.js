// Propuestas nuevas. La raíz del proyecto conserva todas las versiones anteriores.
export const proposals = {
  laterales: {
    version: 'V3', title: 'Laterales bajos', label: 'Recomendada',
    description: 'Una bandeja azul y otra gris a baja altura, una a cada lado. El acceso queda libre al centro; la mesa de maquetas y conversación se recoge al fondo.',
    tags: ['Muestras a los costados', 'Acceso central', 'Pantalla al frente'],
    tradeoff: 'La pantalla se acerca al pasillo para atraer visitas. Las muestras quedan disponibles para mostrarlas al entrar.',
    samples: [{x:-1.06,z:-.24,y:.17,rotation:0,tilt:0},{x:1.06,z:-.24,y:.17,rotation:0,tilt:0}],
    tv: {x:-.97,z:1.04,rotation:.1}, table: {x:0,z:-1.04,rotation:0},
    chairs: [{x:-.30,z:-.38,rotation:Math.PI},{x:.30,z:-.38,rotation:Math.PI}],
  },
  fondo: {
    version: 'V4', title: 'Muestras al fondo', label: 'Más espacio al entrar',
    description: 'Las dos bandejas se agrupan en un soporte bajo de dos niveles al fondo. La mesa lateral reúne las maquetas y los folletos; la pantalla recibe desde la derecha.',
    tags: ['Expositor bajo', 'Mesa lateral', 'Pantalla a la derecha'],
    tradeoff: 'Libera ambos lados del acceso. El expositor tapa parte del borde inferior de la imagen, manteniendo visibles el techo y el logo.',
    samples: [{x:-.38,z:-.76,y:.17,rotation:Math.PI/2,tilt:0},{x:-.38,z:-1.10,y:.47,rotation:Math.PI/2,tilt:0,rearSupports:true}],
    tv: {x:1.0,z:.91,rotation:-.12}, table: {x:-1.10,z:.48,rotation:Math.PI/2},
    chairs: [{x:-.40,z:.48,rotation:-Math.PI/2}],
  },
  atril: {
    version: 'V5', title: 'Atril inclinado', label: 'Alternativa de exhibición',
    description: 'Un atril en la zona posterior izquierda levanta las bandejas para apreciar los pliegues y la diferencia entre la pieza lisa y la corrugada. La mesa queda a la derecha.',
    tags: ['Atril por fabricar', 'Piezas visibles', 'Mesa con maquetas'],
    tradeoff: 'Da mayor presencia al producto, a cambio de ocupar más volumen delante del fondo. La inclinación y el soporte son una propuesta de diseño.',
    samples: [{x:-1.05,z:-.73,y:.18,rotation:0,tilt:.76},{x:-.39,z:-.73,y:.18,rotation:0,tilt:.76}],
    tv: {x:-.97,z:1.04,rotation:.1}, table: {x:1.10,z:.56,rotation:Math.PI/2},
    chairs: [{x:.40,z:.56,rotation:Math.PI/2}],
  },
};

export const dimensions = {
  booth: {width:3,depth:3,height:2.5},
  tv: {width:.93,height:.56},
  // Largo de trabajo de la reunión; ancho, perfil y mobiliario aún por medir.
  sample: {length:1.50,width:.60,profileHeight:.12,approximate:true},
  table: {width:1.05,depth:.52,height:.76,approximate:true},
  panel: {height:1.22,thickness:.003,bottom:.86},
  fascia: {width:2.40,height:.24,approximate:true},
};

export const applications = [
  {photo:'hangar',title:'TECHO HANGAR',use:['Centros de eventos y','almacenamiento agroindustrial']},
  {photo:'contenedor',title:'TECHO CONTENEDOR',use:['Instalaciones de faena','y talleres']},
  {photo:'cubierta',title:'TECHO CUBIERTA',use:['Canchas deportivas','y talleres abiertos']},
  {photo:'serviteca',title:'TECHO SERVITECA',use:['Centros de logística','y distribución']},
];
export const benefits = [
  {icon:'bolt',title:['MONTAJE RÁPIDO'],detail:['Menor a 3 semanas']},
  {icon:'strength',title:['ALTA RESISTENCIA'],detail:['Acero estructural tratado']},
  {icon:'value',title:['PRECIO / CALIDAD'],detail:['Soluciones eficientes por m²']},
  {icon:'weather',title:['HERMETICIDAD'],detail:['Frente al viento, agua y nieve']},
  {icon:'bird',title:['MENOR ACCESO','DE AVES Y ROEDORES'],detail:['Sin cerchas interiores']},
  {icon:'dust',title:['MENOS ACUMULACIÓN','DE POLVO'],detail:['Diseño sin cerchas']},
  {icon:'shield',title:['SEGURIDAD'],detail:['Acero de 1,2 mm']},
  {icon:'maintenance',title:['BAJO MANTENIMIENTO'],detail:['Sin fijaciones atornilladas']},
  {icon:'measure',title:['FABRICACIÓN A MEDIDA'],detail:['En terreno, según el proyecto']},
];
