# Warehouse Solutions · Stand EDIFICA 3D

Visor web interactivo para presentar la propuesta ajustada y seis conceptos anteriores del stand **2-D02**, con una envolvente nominal de **3 × 3 × 2,5 m**. Publicado en [GitHub Pages](https://xaulosky.github.io/stand3d/). No necesita Node, instalación de paquetes, backend ni claves de API. Three.js y OrbitControls están incluidos en el proyecto; no se cargan desde un CDN.

## Qué incluye

- Propuesta ajustada como vista inicial y seis modelos anteriores: Corporativa, Arco industrial, Galería de proyectos, Cuatro beneficios, Minimalista y Laboratorio de soluciones.
- Dos paneles laterales de **244 × 122 cm**, con el borde inferior a **80 cm** del piso.
- Comparación de fotos en cuadrícula 2 × 2 o en fila; foto de apoyo de serviteca o galpón en el campo.
- Vista plana ampliable de ambos paneles y del fondo, con descargas JPG y originales SVG de los laterales.
- Giro, zoom y desplazamiento mediante mouse o pantalla táctil.
- Vistas en perspectiva, frontal, planta e interior.
- Controles para mostrar mobiliario, laterales, dimensiones y giro automático.
- Exportación PNG de la vista actual y pantalla completa cuando el navegador lo admite.
- Render conceptual de referencia para cada alternativa.
- Logo original y fotografías extraídas del Excel entregado por el cliente.
- Diseño adaptable a computador, tablet y celular.
- Enlaces directos mediante `?propuesta=` seguido de `ajustada`, `corporativa`, `arco`, `galeria`, `beneficios`, `minimalista` o `laboratorio`. En la ajustada, `distribucion=cuadricula|fila` y `foto=serviteca|campo` conservan las variantes elegidas.
- Vista de renders cuando el navegador no puede inicializar los gráficos 3D.

## Revisión del 9 de octubre de 2026

Se aplica el Excel actualizado y la transcripción de las indicaciones de Claudia:

- **Izquierda:** una plancha horizontal con las cuatro aplicaciones y una columna de dibujos técnicos originales. La cuadrícula 2 × 2 es la composición inicial. Los títulos y usos quedan fuera de las fotografías.
- **Derecha:** otra plancha horizontal del mismo tamaño, con las nueve ventajas numeradas en el Excel, ahora con iconos y descripciones. Incluye Gran luz libre y un bloque de Nuevos desarrollos (casas, cabañas, lodge y refugios de montaña). La serviteca es la fotografía de apoyo inicial. Se ofrece una segunda composición con el galpón en el campo.
- **Fondo:** recreación frontal de la gigantografía del hangar aprobada visualmente, con título y subtítulo conservados. Se representa un área útil provisional de **284 × 212 cm**, dividida en **tres paños verticales**.
- **Montaje:** bastidor interior independiente en U, soportes y bases ilustrativos, sin adhesivos ni uniones modeladas a las paredes del recinto. El bastidor y la cenefa respetan la envolvente nominal de 3 × 3 × 2,5 m. El montajista debe definir perfiles, uniones y estabilidad; la representación no constituye un diseño estructural ni una autorización del organizador.

Decisiones de diseño adoptadas: panel derecho del mismo tamaño que el izquierdo; Nuevos desarrollos dentro de la misma plancha; uso de Serviteca redactado como talleres y servicios automotrices para corresponder con la fotografía. Las fotografías de esquiadores permanecen bajo Techo contenedor, conforme a la indicación de Claudia. Los retoques fotográficos quedan para cuando el cliente entregue las versiones definitivas.

Las nueve ventajas provienen del Excel actualizado y se mantienen como textos del cliente. Revisar su redacción técnica antes de producción. Las descargas son originales de composición y vistas de revisión; faltan validación de medidas útiles, resolución final de las fotos, sangrado y preparación de imprenta.

Los SVG se generan con `node tools/build-panels.mjs` a partir de `panel-data.js` y `assets/revision/`. Los JPG se exportan de esos SVG. El visor sólo usa archivos estáticos y no necesita ejecutar el generador.

## Conceptos anteriores

| Propuesta | Distribución y elementos |
| --- | --- |
| Cuatro beneficios | Fondo con los cuatro mensajes de la última referencia, recepción a la derecha, mesa y muestras. |
| Minimalista | Blanco, piso de aspecto madera, listones, recepción a la izquierda y mesa de reunión. |
| Laboratorio de soluciones | Pedestal con maqueta, pantalla y muestras a la izquierda, banco al fondo y recepción a la derecha. |

Los cuatro textos de los conceptos anteriores se conservan en `config.js` y siguen la primera imagen de beneficios: instalación en menos de 2 semanas, sin columnas interiores, acero galvanizado de 1,2 mm y ampliaciones según requerimiento. Son mensajes facilitados por el cliente, pendientes de su validación final para impresión.

## Subir a GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `warehouse-stand-3d`.
2. Descomprime el ZIP. Sube **el contenido** de la carpeta `warehouse-stand-3d` a la raíz del repositorio. `index.html` debe quedar en la raíz, junto a `main.js`, `styles.css`, `config.js`, `assets/` y `.github/`.
3. En el repositorio, abre **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. En **Actions**, ejecuta el flujo **Publicar visor en GitHub Pages**, o sube un cambio a `main`. Si tu rama principal tiene otro nombre, edita la lista `branches` del flujo.
5. Al terminar el despliegue, el enlace aparece en **Settings → Pages**. Para un repositorio de proyecto tendrá la forma `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

Alternativa simple: no subas `.github/` y elige **Deploy from a branch → main → / (root)** en Settings → Pages. `.nojekyll` evita el procesamiento de Jekyll. Si una cuenta o una organización restringe GitHub Pages, primero habilítalo para ese repositorio.

### Desde Git

```bash
cd warehouse-stand-3d
git init
git add .
git commit -m "Crear visor 3D de stand Warehouse Solutions"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

Estos comandos son para un repositorio nuevo vacío. Si lo creaste con un README, clónalo primero y copia estos archivos dentro de él, en lugar de forzar un push.

## Revisar localmente

Con Python instalado, desde esta carpeta:

```bash
python -m http.server 8000
```

Abre `http://localhost:8000`. En algunos equipos el comando es `python3` o `py`. La página utiliza módulos ES y debe servirse mediante HTTP; abrir `index.html` con doble clic puede bloquear su carga. Se requiere un navegador con WebGL habilitado.

## Personalización

| Archivo | Contenido |
| --- | --- |
| `config.js` | Textos, descripción de propuestas, colores y rutas de recursos. |
| `panel-data.js` | Nueve ventajas, aplicaciones y rutas de las composiciones revisadas. |
| `tools/build-panels.mjs` | Generador reproducible de los cuatro SVG laterales. |
| `assets/panels/` | Dos distribuciones izquierdas y dos composiciones derechas, en SVG y JPG. |
| `assets/revision/` | Recursos extraídos del Excel actualizado y recreación del fondo. |
| `main.js` | Geometría 3D, posiciones de objetos, cámaras y gráficas de los paneles. Las unidades son metros. |
| `styles.css` | Diseño de la interfaz y adaptación a celulares. |
| `assets/logo.jpg` | Logo original entregado por Warehouse Solutions. |
| `assets/photos/` | Fotografías originales del Excel. |
| `assets/concepts/` | Renders conceptuales generados para esta propuesta. |
| `assets/stand-original.jpg` | Referencia de la estructura modular entregada. |
| `assets/vendor/` | Dependencias locales y licencia MIT de Three.js 0.170.0. |

Los paneles de la propuesta ajustada usan los JPG exportados de los originales SVG. En los conceptos anteriores, las texturas se generan con Canvas a partir de fotos y textos. Las gráficas son de revisión y todavía requieren preparación para impresión. El arco se modela como un marco decorativo plano. Las pantallas de Galería y Laboratorio muestran imágenes fijas; no reproducen un video. Los listones, piso de aspecto madera, banco y pedestal se modelan con volumen. La cubierta del pedestal es una maqueta simplificada. No hay captura de datos, analítica ni conexiones a servicios externos.

Las caras exteriores de los laterales se representan atenuadas para poder explorar el interior al girar el modelo. La gráfica interior permanece opaca. El control Laterales permite retirar esas paredes por completo para revisar la distribución.

## Alcance del modelo

Este proyecto sirve para discutir distribución, apariencia y ubicación de la gráfica. El mobiliario y las muestras son sugeridos y se representan de forma simplificada. Las fotos del Excel conservan la calidad de los archivos originales. Los renders de referencia usan imágenes ilustrativas y pueden diferir del modelo 3D, que usa las imágenes originales.

Antes de producción, confirmar medidas útiles entre perfiles, cenefa, espesor y fijación del PVC, altura libre del arco, dimensiones del mobiliario, ubicación eléctrica, permisos de pantalla y condiciones del organizador. La envolvente de referencia es de 3 × 3 × 2,5 m; este visor no sustituye planos de montaje ni cálculos estructurales.

## Derechos de los recursos

Three.js y OrbitControls: licencia MIT, incluida en `assets/vendor/THREE-LICENSE.txt`. El logo y las fotos se aportaron para este proyecto y no se conceden derechos de redistribución general. Los renders conceptuales fueron creados para explorar las propuestas.

## Verificación de esta entrega

Comprobado en Chromium con WebGL: siete propuestas, carga desde una subcarpeta, recursos locales sin peticiones externas, enlaces directos, controles de visibilidad, cambios de cámara, giro con mouse, modal de referencia y descarga PNG. Revisado en formatos de escritorio y celular. El mobiliario está dentro de la planta de 3 × 3 m. Se comprueba además la geometría de ambos paneles (244 × 122 cm), su altura, la envolvente de todos los volúmenes, cambios reales de texturas, persistencia de variantes al recargar, descargas y lectura de paneles sin WebGL. Despliegue automático en GitHub Pages mediante Actions.
