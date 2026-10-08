#!/usr/bin/env python3
"""Genera los datos en línea de las 5 páginas y _design-data.json desde data/tabasco/.

Uso:  python3 tools/datos.py            (desde cualquier carpeta)
      DATA_DIR=/ruta/a/data/tabasco python3 tools/datos.py

Escribe, en UNA línea cada una:
  const STORES       -> index.html, directorio.html, mapa.html
  const LOCAL_STORE  -> mapa.html
  const EVENTS       -> eventosypromociones.html
y además: texto «N tiendas» de [data-cc="tiendas"], _design-data.json,
logos que falten en images/locatarios/ y fotos que falten en images/tiendas/<slug>/N.jpg.
"""
import json
import os
import re
import shutil
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.environ.get('DATA_DIR') or os.path.join(ROOT, '..', 'data', 'tabasco')

PAGES_STORES = ['index.html', 'directorio.html', 'mapa.html']
PISO_CLAVE = {'Planta Baja': 'pb', 'Planta Alta': 'pa'}


# --- Normalización idéntica a we_norm() del motor (engine.php) -----------------
_WE_MAP = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ä': 'a', 'ë': 'e',
           'ï': 'i', 'ö': 'o', 'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u', 'ñ': 'n',
           '’': "'", '´': "'", '`': "'"}


def we_norm(t):
    t = t.strip(' \t\n\r\0\x0b').lower()          # trim() de PHP + mb_strtolower()
    t = ''.join(_WE_MAP.get(c, c) for c in t)       # strtr()
    return re.sub(r'[ \t\n\r\f\v]+', ' ', t)        # preg_replace('/\s+/') sin /u


def slug(t):
    t = t.lower().replace('´', '')                 # el acento suelto se quita, el apóstrofo separa
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def limpio(v):
    return v.strip() if isinstance(v, str) else ''


def unicos(seq):
    out = []
    for x in seq:
        if x and x not in out:
            out.append(x)
    return out


def es_telefono(t):
    return bool(re.fullmatch(r'[\d\s()+-]{7,}', t))


# --- Assets ---------------------------------------------------------------------
def asegura_logo(src_rel):
    """Copia el logo del gestor a images/locatarios/ si falta. Devuelve la ruta publicada."""
    if not src_rel:
        return ''
    nombre = os.path.basename(src_rel)
    destino = os.path.join(ROOT, 'images', 'locatarios', nombre)
    if not os.path.exists(destino):
        origen = os.path.join(DATA, src_rel)
        if not os.path.exists(origen):
            return ''
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        shutil.copyfile(origen, destino)
    return 'images/locatarios/' + nombre


def asegura_fotos(nombre, fotos):
    """Fotos de la tienda en images/tiendas/<slug>/N.jpg (JPEG ≤1200 px, q78)."""
    carpeta = os.path.join(ROOT, 'images', 'tiendas', slug(nombre))
    out = []
    for i, rel in enumerate(fotos, 1):
        destino = os.path.join(carpeta, f'{i}.jpg')
        if not os.path.exists(destino):
            origen = os.path.join(DATA, rel)
            if not os.path.exists(origen):
                continue
            from PIL import Image
            os.makedirs(carpeta, exist_ok=True)
            im = Image.open(origen)
            if im.mode != 'RGB':
                fondo = Image.new('RGB', im.size, (255, 255, 255))
                im = im.convert('RGBA')
                fondo.paste(im, mask=im.split()[3])
                im = fondo
            im.thumbnail((1200, 1200))
            im.save(destino, 'JPEG', quality=78, optimize=True, progressive=True)
        out.append(f'images/tiendas/{slug(nombre)}/{i}.jpg')
    return out


def optimiza_jpgs():
    """JPEG en CMYK o de más de 400 KB → RGB, ≤1200 px, q80. Devuelve cuántos tocó."""
    from PIL import Image
    n = 0
    for carpeta in ('images/locatarios', 'images/tiendas'):
        for raiz, _, archivos in os.walk(os.path.join(ROOT, carpeta)):
            for a in archivos:
                if not a.lower().endswith(('.jpg', '.jpeg')):
                    continue
                ruta = os.path.join(raiz, a)
                im = Image.open(ruta)
                if im.mode != 'CMYK' and os.path.getsize(ruta) <= 400 * 1024:
                    continue
                im = im.convert('RGB')
                im.thumbnail((1200, 1200))
                im.save(ruta, 'JPEG', quality=80, optimize=True, progressive=True)
                n += 1
    return n


# --- Datos ------------------------------------------------------------------------
def construir_stores(src):
    stores = []
    for s in src:
        name = limpio(s.get('name'))
        ubic = s.get('ubicaciones') or [{'piso': s.get('piso'), 'local': s.get('local')}]
        horario = limpio(s.get('horario'))
        tel = limpio(s.get('telefono'))
        if horario and es_telefono(horario):      # el gestor trae a veces el teléfono en el horario
            tel = tel or horario
            horario = ''
        imgs = asegura_fotos(name, s.get('fotos') or [])
        st = {
            'name': name,
            'cat': limpio(s.get('giro')) or 'Servicios',   # igual que ISNULL(giroComercial,'Servicios') del motor
            'img': imgs[0] if imgs else '',
            'logo': asegura_logo(s.get('logo')),
            'num': ' y '.join(unicos(limpio(u.get('local')) for u in ubic)),
            'desc': limpio(s.get('descripcion')),
            'loc': ' y '.join(unicos(limpio(u.get('piso')) for u in ubic)),
            'time': horario,
            'ig': limpio(s.get('instagram')),
            'fb': limpio(s.get('facebook')),
            'web': limpio(s.get('web')),
            'tel': tel,
            'imgs': imgs,
        }
        stores.append({k: v for k, v in st.items() if v})
    return stores


def construir_local_store(mapa, nombre_por_id):
    out = {}
    for p in mapa['pisos']:
        clave = PISO_CLAVE[p['piso']]
        sufijo = p['piso'].replace(' ', '')
        locales = {}
        nombres_fuera_svg = {}
        for l in p['locales']:
            num = l['local']
            # el SVG vivo repite el piso en algunos ids («39PlantaAlta39»)
            num = re.sub(r'^(\w+?)' + sufijo + r'\1$', r'\1', num)
            nombre = nombre_por_id.get(l.get('idCatLocatario'))
            if l.get('en_svg') is False:          # solo en el listado: da nombre al local dibujado
                nombres_fuera_svg[num] = nombre
                continue
            locales[num] = nombre
        for num, nombre in nombres_fuera_svg.items():
            if num in locales and locales[num] is None:
                locales[num] = nombre
        out[clave] = locales
    return out


def construir_events(ev):
    events = []
    for e in ev.get('eventos') or []:
        events.append({k: v for k, v in {
            'title': limpio(e.get('titulo') or e.get('title')),
            'tag': limpio(e.get('etiqueta') or e.get('tag')),
            'desc': limpio(e.get('descripcion') or e.get('desc')),
            'img': limpio(e.get('img') or e.get('imagen')),
        }.items() if v})
    return events


# --- Escritura --------------------------------------------------------------------
def js(v):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def poner_const(html, nombre, valor):
    patron = re.compile(r'^(\s*)const ' + nombre + r' = .*;[ \t]*$', re.M)
    if not patron.search(html):
        sys.exit(f'Falta «const {nombre} = …;» en una página')
    return patron.sub(lambda m: m.group(1) + f'const {nombre} = {js(valor)};', html, count=1)


def editar(pagina, fn):
    ruta = os.path.join(ROOT, pagina)
    with open(ruta, encoding='utf-8') as f:
        html = f.read()
    nuevo = fn(html)
    if nuevo != html:
        with open(ruta, 'w', encoding='utf-8') as f:
            f.write(nuevo)
    return nuevo != html


def main():
    def carga(n):
        with open(os.path.join(DATA, n), encoding='utf-8') as f:
            return json.load(f)

    src, mapa, ev = carga('stores.json'), carga('mapa.json'), carga('eventos.json')
    stores = construir_stores(src)
    nombre_por_id = {s['idCatLocatario']: limpio(s['name']) for s in src}
    local_store = construir_local_store(mapa, nombre_por_id)
    events = construir_events(ev)
    optimizadas = optimiza_jpgs()

    nombres = {s['name'] for s in stores}
    huerfanos = sorted({n for f in local_store.values() for n in f.values() if n and n not in nombres})
    if huerfanos:
        sys.exit('LOCAL_STORE nombra tiendas que no están en STORES: ' + ', '.join(huerfanos))

    tiendas = f'{len(stores)} tiendas'

    def con_tiendas(html):
        return re.sub(r'(data-cc="tiendas"[^>]*>)[^<]*(<)', lambda m: m.group(1) + tiendas + m.group(2), html)

    cambios = []
    for p in PAGES_STORES:
        def fn(html, p=p):
            html = con_tiendas(poner_const(html, 'STORES', stores))
            if p == 'mapa.html':
                html = poner_const(html, 'LOCAL_STORE', local_store)
            return html
        if editar(p, fn):
            cambios.append(p)
    if editar('eventosypromociones.html', lambda h: poner_const(h, 'EVENTS', events)):
        cambios.append('eventosypromociones.html')

    design = {'stores': {}, 'pubs': {}}
    for s in stores:
        d = {k: s[k] for k in ('img', 'logo', 'ig', 'fb', 'web', 'imgs') if k in s}
        d['soon'] = False
        design['stores'][we_norm(s['name'])] = d
    for i, e in enumerate(events):
        design['pubs'][we_norm(e.get('title', ''))] = {
            'tag': '', 'img': e.get('img', ''), 'desc': e.get('desc', ''), 'alt': e.get('title', ''),
            'modalTitle': e.get('title', ''), 'modalTag': e.get('tag', ''), 'order': i,
            'tab': e.get('tab', 'eventos')}
    with open(os.path.join(ROOT, '_design-data.json'), 'w', encoding='utf-8') as f:
        json.dump(design, f, ensure_ascii=False, indent=1)
        f.write('\n')

    n_locales = sum(len(v) for v in local_store.values())
    n_ocupados = sum(1 for v in local_store.values() for n in v.values() if n)
    print(f'STORES {len(stores)} · LOCAL_STORE {n_locales} locales ({n_ocupados} con tienda) · '
          f'EVENTS {len(events)} · JPEG optimizados {optimizadas} · páginas cambiadas: {", ".join(cambios) or "ninguna"}')


if __name__ == '__main__':
    main()
