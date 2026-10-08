# Plaza Altabrisa Tabasco — guía de diseño (ley para las 5 páginas)

Concepto: «Luxury Fashion Mall» en clave editorial de moda. Blanco puro + negro del logo, gris del logo
solo para filetes y rótulos. Líneas de 1 px, esquinas rectas (radio 0), mucho aire, fotos en B/N que
recuperan el color al pasar el ratón. Manda también CONTRATO-DISENO.md (enchufes data-cc, STORES, EVENTS…).

## Fuentes (Google Fonts, ya enlazadas en `_shell.html`)
- **Jost** 300/400/500 → títulos (300), rótulos en mayúsculas (500, tracking `--track`), botones.
- **Archivo** 400/500/600 → texto corrido, formularios, pie.

## Tokens (`:root` en css/site.css) — no escribir colores ni tamaños sueltos
`--ink #000` · `--ink-2` · `--grey #adadac` (logo; filetes y texto sobre negro) · `--grey-text #6b6b6a` (texto
secundario sobre blanco) · `--line` · `--line-dark` · `--paper #fff` · `--mist #f4f4f4` (bandas) · `--ink-soft` (texto largo sobre blanco) ·
`--paper-soft` (texto sobre negro) · `--overlay` / `--overlay-strong` (fondos de modal y lightbox).
Tamaños: `--fs-xs … --fs-xl`, `--fs-hero` (index), `--fs-page` (páginas internas, enorme). Espacio: `--s1…--s8`,
`--gutter`, `--maxw`, `--hh` (alto cabecera). `--r: 0`. Prohibido: radios, sombras (el modal lleva filete `--line`), degradados, cursivas.

## Esqueleto de cada página
1. `<head>` y cabecera/pie: copiar TAL CUAL de `_shell.html`; mover `aria-current="page"` al enlace propio.
2. `<main>` (ya trae padding-top de la cabecera fija) → primer bloque = hero interno:
```html
<section class="page-hero"><div class="wrap"><span class="kicker" data-cc="nombre">Plaza Altabrisa Tabasco</span>
<h1 class="page-hero__title">Directorio</h1></div><div class="page-hero__media"></div></section>
```
   La foto de `.page-hero__media` va en un `<style>` del propio HTML (`.page-hero__media{background-image:url(images/...)}`).
   Usar `images/home/slot-2.jpg` (directorio), `slot-3.jpg` (mapa), `slot-4.jpg` (eventos), `slot-1.jpg` (contacto).
3. Secciones: `<section class="section">` (+ `section--mist` / `section--dark`) con `<div class="wrap">`.
   Encabezado de sección: `h2.h-section` solo, o `.kicker` + `h2.h-section` cuando el rótulo aporte (el kicker ya no lleva
   rayita delante; no repetir el mismo texto en kicker y título). Banda negra de datos: `section.section--dark.band`. Animación opcional: clase `reveal`.
4. Al final: datos en línea (`const STORES/EVENTS/LOCAL_STORE`, una línea cada uno) y luego
   `<script src="Scripts/site.js" defer></script>`. No añadir otras librerías.

## Componentes y clases
- Botones: `.btn` (negro) · `.btn--ghost` (contorno) · `.btn--light` (sobre negro) · enlace `.link-line`.
- Directorio: `.dir-bar > .wrap > #dirTabs.tabs` + `label.search > svg + input#dirSearch`; debajo
  `.wrap > p#dirCount.dir-count + #dirGrid.dir-grid + p#dirEmpty.dir-empty[hidden]`. Las pestañas, tarjetas
  (`.store-card`, solo logo), contador, buscador sin acentos, modal con galería y deep links `?cat=` / `?tienda=`
  los pinta site.js desde `STORES`. No escribir tarjetas a mano ni filtros extra.
- Familias: `GIRO_FAMILIA` en site.js (giro normalizado → Compras/Gastronomía/Entretenimiento/Servicios;
  desconocido → Compras). Si aparece un giro nuevo, añadirlo ahí, no en la página.
- Mapa: pestañas `.tabs > button.tab[data-level="pb"]` + planos `.map-wrap > .map-floor[data-level="pb"]` (los demás
  con `hidden`); site.js alterna niveles. Locales `<g data-floor data-local>`: site.js los conecta a `LOCAL_STORE` y abre el modal de tienda.
- Eventos y promociones: marcado EXACTO del contrato (`.pub-section/.pub-h2/.pub-grid/.e-card`). El cartel se ve
  entero; `.e-card-overlay` está oculto y `.e-card-body` va debajo. `openPub()` y el lightbox con flechas están en
  site.js. Sin publicaciones: `<p class="pub-empty">` con rotulación funcional, sin inventar.
- Contacto: `.contact-grid` (2 columnas), campos `.field` (sin etiqueta visible: placeholder + aria-label),
  casilla `label.check > input + span`, `.btn` para enviar, `.rent-card` para renta de locales, `iframe.map-embed`.
- Redes: `.social` (cuadros de 44 px con borde). Modal/lightbox: los crea site.js, no maquetarlos.

## Reglas
- Título interno SIEMPRE `.page-hero__title` (mayúsculas, `--fs-page`); nunca el tamaño del index.
- Nada de texto inventado: copy de data/tabasco/cc.json o rotulación funcional. Sin horario si la fuente no lo da.
- Sin «01/02», sin monospace, sin píldoras, sin comillas decorativas, sin © ni año en el pie.
- Imágenes .jpg/.webp optimizadas, `loading="lazy"` fuera del primer pantallazo, `alt` real. Rutas relativas.
- Probar a 390/768/1440: 0 errores de consola, sin scroll horizontal. Zonas de toque ≥ 44 px (ya resueltas en el CSS común).
- Fotos SIEMPRE en B/N (también el hero, `grayscale(1)`); recuperan color al pasar el ratón solo en las tarjetas.
- El lema «Luxury Fashion Mall» solo va en el logo y en `.hero__lema` del index: no repetirlo en pie, rótulos ni textos verticales.
  El pie termina en un filete vacío (`<div class="footer-bottom" aria-hidden="true"></div>`, ya en `_shell.html`).
- `data-cc="nombre"` lo sustituye el motor por el nombre del gestor («Altabrisa Tabasco», sin «Plaza»): usarlo solo en rótulos
  pequeños (kicker, título del pie), nunca en un H1 que deba coincidir con el logo.
- STORES con el esquema del contrato (`cat/num/loc/desc/fb/ig/imgs`), no con los campos de `data/tabasco/stores.json`
  (`giro/local/piso/descripcion/facebook/instagram/fotos`). Logos copiados a `images/locatarios/<id>.<ext>` (ya están).
- Pestañas, modal, lightbox, menú y `.e-card` sin href: la accesibilidad (roles, flechas, `inert`, foco) la pone site.js.
