// Edita textos y rutas de imágenes aquí. Las geometrías del stand están en main.js.
export const brand = {
  name: 'Warehouse Solutions', stand: '2-D02', event: 'EDIFICA',
  navy: '#143858', yellow: '#ecab00', logo: 'assets/logo.jpg',
};
export const photos = {
  hangar: 'assets/photos/hangar.jpg', contenedor: 'assets/photos/contenedor.jpg',
  cubierta: 'assets/photos/cubierta.jpg', serviteca: 'assets/photos/serviteca.jpg',
  cabana: 'assets/photos/cabana.jpg',
};
export const proposals = {
  corporativa: {
    title: 'Corporativa', description: 'La marca y una gran imagen de hangar reciben al visitante. Las soluciones y sus beneficios se distribuyen en los laterales, dejando espacio para conversar.',
    tags: ['Gráfica en PVC', 'Fondo protagonista', 'Montaje sencillo'],
    render: 'assets/concepts/corporativa.jpg',
  },
  arco: {
    title: 'Arco industrial', description: 'Un arco decorativo evoca los techos autoportantes de Warehouse Solutions. El azul y el amarillo dan presencia al stand, con un área para exhibir una muestra a escala.',
    tags: ['Arco decorativo', 'Identidad industrial', 'Muestra de producto'],
    render: 'assets/concepts/arco.jpg',
  },
  galeria: {
    title: 'Galería de proyectos', description: 'Cuatro aplicaciones se presentan como una galería. Un lateral introduce casas, cabañas y refugios; el otro incorpora una pantalla y muestras del material.',
    tags: ['Cuatro soluciones', 'Pantalla', 'Nuevos desarrollos'],
    render: 'assets/concepts/galeria.jpg',
  },
};
