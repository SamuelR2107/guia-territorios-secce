# Guía de Territorios | San José de Secce

Guía informativa de **19 territorios** de la campaña de predicación en San José de Secce, Huanta, Ayacucho. Incluye búsqueda por nombres y aliases, ordenamiento, fichas detalladas y enlaces a Google Maps. San José de Secce es la base de referencia.

## Estructura

```text
index.html          Página y metadatos
css/styles.css      Diseño responsive
js/data.js          Datos de los 19 lugares
js/app.js           Búsqueda, ordenamiento y modal
assets/images/      Carpeta reservada para imágenes
assets/icons/       Carpeta reservada para iconos
README.md           Instrucciones
```

## Modificar datos

Edita el objeto del pueblo correspondiente en `js/data.js`, dentro de `window.TERRITORIOS`. Conserva los identificadores `id` y una sola base con `esBase: true`.

- `nombre`, `aliases` y `distrito`: nombre, nombres alternativos y distrito.
- `coordenadas`: `{ lat: número, lng: número }`; los enlaces Maps se generan automáticamente.
- `altitud`: metros sobre el nivel del mar, como número sin unidades.
- `distanciaKm`, `tipoDistancia`, `direccion`: distancia desde la base, tipo y orientación.
- `tiempoMin`: `{ minimo: número, maximo: número }`, en minutos referenciales.
- `descripcion`, `acceso`: textos del detalle.
- `recomendaciones`: lista de textos del detalle.

Mantén la sintaxis de JavaScript: comillas para textos, comas entre campos y números sin unidades. Usa `null` únicamente para información pendiente; `zona` permanece en `null`. No es necesario editar HTML para actualizar los datos.

Las distancias son aproximadas en línea recta y los tiempos son referenciales; no equivalen a una ruta calculada por carretera. La búsqueda ignora tildes y mayúsculas y reconoce aliases. Los valores desconocidos se colocan al final al ordenar.

## Ejecutar localmente

Descomprime la carpeta completa y abre `index.html` en un navegador moderno. No requiere instalación, Node.js, backend, variables de entorno ni proceso de build. Los archivos locales funcionan sin Internet; Google Maps necesita conexión. Visitar el sitio publicado no garantiza que esté disponible sin conexión.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube el **contenido de esta carpeta** a la rama `main`: `index.html` debe quedar en la raíz del repositorio, junto a `css/` y `js/`, sin una carpeta contenedora adicional. Confirma los archivos con un commit.
3. Abre **Settings → Pages**.
4. En **Source**, selecciona **Deploy from a branch**.
5. En **Branch**, selecciona **main** y **/ (root)** —la raíz— y pulsa **Save**.
6. Espera a que GitHub complete la publicación y abre la dirección que indica Pages: `https://USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

Los cambios posteriores se publican al confirmar archivos en `main`. Todos los recursos del sitio usan rutas relativas; no hay dependencias externas ni mapas embebidos. Google Maps se abre únicamente al pulsar sus enlaces. Los metadatos Open Graph incluyen título y descripción, sin imagen.
