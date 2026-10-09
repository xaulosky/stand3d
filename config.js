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
  muestras: {
    title: 'Versión 2 · Con muestras', description: 'Dos muestras de 93 × 56 cm en el fondo derecho, con apoyos hacia el interior y acceso despejado. Gráficas continuas sobre planchas de 122 × 240 cm. El fondo utiliza solo la imagen de Corporativa con su logo WS.',
    tags: ['Planchas 122 × 240 cm', 'Muestras al fondo', 'Elementos editables'],
    render: 'assets/concepts/muestras-v3.jpg',
    referenceCaption: 'Vista del modelo 3D con las dos muestras. Ancho y alto a escala; profundidad, pliegues y soportes aproximados a partir de la imagen recibida. Las variantes gráficas se revisan en el visor.',
  },
  ajustada: {
    title: 'Versión 1 · Gráficas', description: 'Planchas de 122 × 240 cm unidas para cubrir fondo y laterales. Aplicaciones y dibujos técnicos a la izquierda; nueve ventajas y nuevos desarrollos a la derecha. Fondo Corporativa con su logo WS y espacio de conversación abierto.',
    tags: ['Planchas 122 × 240 cm', 'Imagen continua', 'Elementos editables'],
    render: 'assets/concepts/ajustada-v3.jpg',
    referenceCaption: 'Captura de la distribución inicial del modelo 3D. Área útil propuesta: 290 × 240 cm por pared; medidas de instalación por confirmar.',
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
