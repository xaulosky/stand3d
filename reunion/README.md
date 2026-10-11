# Propuestas adicionales de la reunión

Página independiente: `/stand3d/reunion/`. No reemplaza ni modifica las versiones de la raíz.

- **V3 · Laterales bajos:** una bandeja en cada costado, pantalla al frente izquierdo, mesa con mantel negro al fondo y dos sillas.
- **V4 · Muestras al fondo:** expositor bajo posterior de dos niveles, mesa izquierda y pantalla derecha.
- **V5 · Atril inclinado:** dos bandejas inclinadas atrás a la izquierda, mesa derecha y pantalla al frente izquierdo.

## Criterios incorporados

Stand de 3 × 3 × 2,5 m. Televisor de 93 × 56 cm: esas medidas no corresponden a las muestras de acero. Dos bandejas azul/gris, una lisa y otra corrugada, distintas de las pequeñas maquetas plásticas sobre la mesa. Mesón WS retirado sólo en estas propuestas.

Fondo con la imagen de la propuesta Corporativa, que incluye el logo WS. Mensaje principal: “Fábrica de techos y bodegas autoportantes”. Cuatro paños de PVC: uno horizontal en cada costado y dos horizontales unidos en el fondo. Borde impreso, sin añadir el bastidor decorativo de versiones anteriores. Cenefa 240 × 24 cm con marca, actividad y número 2-D02.

Panel izquierdo en cuadrícula. Se conserva el orden de las cuatro aplicaciones; el uso de Techo Serviteca cambia a “Centros de logística y distribución”. Los dos dibujos técnicos comparten el título “Geometría de la cubierta”. Se elimina el subtítulo “Aplicaciones y espacios de uso”. Nueve ventajas con textos abreviados; el plazo de montaje se corrige a “Menor a 3 semanas”, sujeto a revisión comercial antes de imprimir.

## Supuestos visibles en el visor

- Se puede comparar plancha 122 × 240 cm y 122 × 244 cm: ambas medidas se mencionaron. Por defecto se mantiene el largo de 240 cm indicado por escrito. Fondo compuesto: 240/244 cm de ancho × 244 cm de alto, con junta horizontal a la mitad. Comprobar altura útil y fijación con el recinto.
- Las muestras tienen 150 cm de largo de trabajo; también se discutió acortarlas. Ancho de 60 cm, perfil, ligera curvatura, corrugado, inclinación y soportes son ilustrativos.
- Mesa de referencia: 105 × 52 cm. Confirmar la mesa disponible, sillas y soporte móvil de TV. La pantalla permite comparar orientación horizontal y vertical.
- Las imágenes actuales permiten evaluar composición. Quedan pendientes la selección de dos imágenes finales de nuevos desarrollos y los retoques del hangar y de la cubierta. La pantalla muestra una composición estática de referencia; no contiene el video de proyectos solicitado en la reunión.
- Resolver el montaje permitido sin pegar ni perforar el recinto. El visor no calcula estructuras ni fijaciones.

## Archivos

`config.js` contiene propuestas, medidas y textos. `main.js` contiene el modelo y controles. `assets/` contiene nuevas gráficas SVG/JPG y capturas del modelo. Los SVG combinan textos y dibujos vectoriales con fotografías incrustadas: no son artes finales de imprenta. No se incluyen audios ni transcripciones de la reunión.

El visor usa Three.js y OrbitControls ya presentes en `../assets/vendor/`; no necesita compilación ni dependencias de red. Se publica junto con el sitio mediante el flujo existente de GitHub Pages. Para editar las gráficas, ejecutar `node reunion/tools/build-artwork.mjs` desde la raíz con `sharp` instalado. Este generador sólo escribe en `reunion/assets/`.
