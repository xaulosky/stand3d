# Warehouse Solutions · Stand EDIFICA 3D

Visor web interactivo para presentar dos versiones de la propuesta ajustada y seis conceptos anteriores del stand **2-D02**, con una envolvente nominal de **3 × 3 × 2,5 m**. Publicado en [GitHub Pages](https://xaulosky.github.io/stand3d/). No necesita Node, instalación de paquetes, backend ni claves de API. Three.js y OrbitControls están incluidos en el proyecto; no se cargan desde un CDN.

## Qué incluye

- Dos versiones actuales y seis conceptos históricos, con V2 Con muestras como entrada.
- Mobiliario y gráficas seleccionables: arrastre sobre el piso, flechas de movimiento, posición exacta en centímetros, altura y giro. El stand fijo conserva sus medidas.
- Deshacer/rehacer, restablecer una pieza o toda la distribución. Los movimientos permanecen al cambiar las gráficas o alternar propuestas durante la sesión.
- Vistas guardadas con nombre: distribución, cámara, gráficas y visibilidad. Se almacenan en este navegador; exportación/importación JSON para trasladarlas a otro equipo. No hay cuenta, sincronización remota ni envío de datos.
- Dos muestras plegadas de **93 cm de ancho × 56 cm de alto**, al fondo derecho y con sus apoyos hacia el interior.
- Mesón de recepción retirado de V1 y V2. Mesa y sillas desplazadas hacia el sector delantero izquierdo.
- Gráficas continuas en fondo y laterales. Cada plancha de origen mide **122 × 240 cm**. Juntas visibles con control independiente y un despiece descargable.
- Fondo definitivo: **solo la imagen que utiliza el modelo Corporativa, con el logo WS incluido en la foto**, `assets/photos/hangar.jpg`. Sin título, subtítulo ni logo adicional.
- Panel izquierdo con cuadrícula o fila; panel derecho con nueve ventajas y foto tenue de serviteca o galpón en el campo. Vistas JPG y originales SVG ampliables.
- Cámaras Perspectiva, Frontal, Planta, Interior y Muestras; exportación PNG, pantalla completa y controles de visibilidad.
- Interfaz para computador y celular; referencias estáticas y lectura de gráficas cuando no hay WebGL.
- Enlaces directos `?propuesta=muestras` o `ajustada`; `distribucion=cuadricula|fila` y `foto=serviteca|campo` conservan las gráficas seleccionadas.

## Cómo editar y guardar

1. Pulsa **Mover elementos**. Selecciona una pieza en el modelo o en la lista.
2. Arrástrala sobre el piso; también puedes usar las flechas en pantalla o en el teclado. El paso se elige entre 1, 5 y 10 cm. Mayús + flecha multiplica el paso por cinco.
3. Ajusta X, altura, fondo o giro con los campos numéricos. X y fondo se miden desde el centro de la planta, positivo hacia la derecha y el frente; altura indica el origen del elemento sobre el nivel del piso. Los desplazamientos se limitan al recinto de 3 × 3 × 2,5 m. No se resuelven automáticamente choques entre piezas.
4. **Deshacer** / **Rehacer** (Ctrl/Cmd Z / Mayús Z) recorren hasta 50 movimientos por propuesta. **Restablecer pieza** vuelve a su ubicación inicial; **Restablecer** devuelve distribución y cámara iniciales y permite deshacer el cambio de posiciones.
5. **Guardar vista** conserva distribución, cámara, gráficas y visibilidad con un nombre. **Vistas guardadas → Abrir** la recupera incluso después de recargar. Hasta 20 vistas por navegador. **Exportar vista** descarga un JSON; **Importar vista** lo abre, y puede guardarse luego en el navegador actual.
6. El botón de descarga del visor guarda una imagen PNG de la cámara actual. Las vistas guardadas son independientes de esos archivos de imagen.

En V1/V2 son editables la mesa, cada silla, las tres composiciones de pared y el expositor completo en V2. Se mueve cada pared como un conjunto para preservar la continuidad de sus tres paños. En los conceptos históricos también se pueden mover gráficas, mesa, sillas, mesón, pantallas, repisas, pedestal, banco y exhibición de producto según la propuesta. Las partes estructurales del recinto permanecen fijas.

## Revisión del 9 de octubre de 2026

### Planchas y fondo definitivo

Se corrige la interpretación anterior de 244 × 122 cm: **122 × 240 cm es el tamaño de la plancha de origen, no el de la gráfica completa**. Se propone un área útil de **290 × 240 cm por pared**, dentro de los 300 cm nominales. Cada pared combina anchos **122 + 122 + 46 cm**. Las tres caras suman **9 paños instalados** y una estimación de **8 planchas de origen**: seis completas y dos para obtener las tres franjas de 46 cm. Confirmar las medidas útiles entre perfiles y las tolerancias antes de producir.

Cada paño se modela por separado, con UV que continúan la misma imagen. No se repite el dibujo en cada plancha. El control **Juntas** muestra las divisiones reales de la propuesta; **Ver gráficas y despiece** abre las composiciones y el esquema de corte. El despiece corresponde siempre a la distribución inicial, aunque se muevan elementos en el editor.

Se conserva la composición del Excel: cuatro usos e imágenes a la izquierda, dibujos AutoCAD agrupados, nueve ventajas con iconos y Nuevos desarrollos a la derecha. La imagen de esquiadores corresponde a Techo contenedor. El fondo ahora usa `assets/photos/hangar.jpg`, exactamente la imagen usada por el modelo Corporativa, que incluye el logo WS. La composición anterior con títulos se conserva únicamente como archivo histórico.

### Expositor y montaje

La indicación «56 × 93 ancho» se interpreta como **56 cm de alto × 93 cm de ancho por muestra**. Las piezas siguen `assets/revision/muestras-referencia.png`. La proyección de **38 cm** y los pliegues son aproximaciones visuales. Las muestras tienen sus centros a **0,62 y 1,35 m** del piso.

El expositor se coloca en el **fondo derecho**, con bases y apoyos orientados hacia el interior. Se retira el mesón de V1/V2. Las cotas de las muestras acompañan al expositor cuando se mueve. El bastidor independiente, bases, uniones y estabilidad deben definirse con el montajista; el modelo no constituye un diseño estructural.

`assets/concepts/muestras-v3.jpg`, `muestras-detalle-v3.jpg` y `ajustada-v3.jpg` son capturas de la distribución inicial del modelo 3D. Los seis conceptos anteriores conservan sus renders históricos.

Las nueve ventajas son textos facilitados por el cliente. Revisar su redacción técnica y la calidad de las fotos antes de producir. Las descargas son composiciones de revisión; faltan sangrado y preparación final de imprenta.

Los SVG actuales se generan con `node tools/build-wall-panels.mjs` a partir de `panel-data.js`, `wall-layout.js` y las fotos locales. Exportar JPG a 2400 px de ancho desde los SVG. El generador anterior `tools/build-panels.mjs` queda como histórico. El visor sólo necesita los archivos estáticos ya exportados.

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
| `sample-display.js` | Geometría de las dos muestras, medidas y expositor independiente. |
| `wall-layout.js` | Tamaño de las planchas y despiece útil propuesto. |
| `layout-editor.js` | Selección, arrastre, límites, historial, vistas guardadas e importación/exportación. |
| `tools/build-wall-panels.mjs` | Generador de las composiciones actuales y del despiece en SVG. |
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

Comprobado en Chromium con WebGL: ocho propuestas, carga desde una subcarpeta, recursos locales sin peticiones externas, enlaces directos, controles de visibilidad, cambios de cámara, giro con mouse, modal de referencia y descarga PNG. Revisado en formatos de escritorio y celular. El mobiliario está dentro de la planta de 3 × 3 m. Se comprueba además la geometría de los nueve paños (122/46 × 240 cm), la de las dos muestras (93 × 56 cm), la envolvente del expositor, cambios reales de texturas, persistencia de variantes al recargar, descargas y lectura de paneles sin WebGL. También se verifican selección por clic, arrastre con mouse y pantalla táctil, movimiento por centímetros, límites del recinto, giro, deshacer/rehacer, restablecer y conservar cambios al cambiar gráficas o propuestas. Guardado local, recuperación tras recargar, cámara, importación/exportación JSON y rechazo de archivos inválidos comprobados. La cámara Muestras sigue al expositor movido. Despliegue automático en GitHub Pages mediante Actions.
