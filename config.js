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
// Textos de la última referencia facilitada por el cliente.
export const benefits = [
  { icon: 'bolt', title: 'MONTAJE RÁPIDO', detail: 'Instalación en menos de 2 semanas.' },
  { icon: 'space', title: 'LUZ LIBRE TOTAL', detail: 'Sin columnas interiores.' },
  { icon: 'shield', title: 'ALTA RESISTENCIA', detail: 'Acero galvanizado 1,2 mm.' },
  { icon: 'modular', title: 'DISEÑO MODULAR', detail: 'Ampliaciones según requerimiento.' },
];
export const proposals = {
  ajustada: {
    title: 'Propuesta ajustada', description: 'Dos paneles horizontales de 244 × 122 cm: aplicaciones y dibujos técnicos a la izquierda; nueve ventajas y nuevos desarrollos a la derecha. El fondo conserva la bodega curva. Bastidor independiente como propuesta de montaje.',
    tags: ['Paneles 244 × 122 cm', 'Nueve ventajas', 'Bastidor independiente'],
    render: 'assets/concepts/ajustada.jpg',
  },
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
  beneficios: {
    title: 'Cuatro beneficios', description: 'Los cuatro beneficios de la última referencia comparten el fondo con una gran imagen de hangar. La recepción se sitúa a la derecha y los laterales presentan aplicaciones y muestras.',
    tags: ['Cuatro beneficios', 'Recepción lateral', 'Gráfica en PVC'],
    render: 'assets/concepts/beneficios.jpg',
  },
  minimalista: {
    title: 'Minimalista', description: 'Una propuesta luminosa con fondo blanco, piso de aspecto madera y listones decorativos. La imagen del hangar centra el mensaje, con una mesa de reunión y muestras en el lateral.',
    tags: ['Blanco y madera', 'Listones decorativos', 'Mesa de reunión'],
    render: 'assets/concepts/minimalista.jpg',
  },
  laboratorio: {
    title: 'Laboratorio de soluciones', description: 'Una maqueta de cubierta sobre un pedestal invita a descubrir el sistema. La pantalla y las muestras explican el producto, acompañadas por los cuatro beneficios y un banco de espera.',
    tags: ['Maqueta protagonista', 'Pantalla y muestras', 'Banco de espera'],
    render: 'assets/concepts/laboratorio.jpg',
  },
};
