# PS4 Data Games

Catálogo estático de títulos y enlaces externos. Interfaz en español, búsqueda sin distinción de tildes, paginación de 40 títulos y opción para mostrar títulos sin enlaces.

Repositorio: [karlitoxz/ps4-data-games](https://github.com/karlitoxz/ps4-data-games).

## Descargar el proyecto

```sh
git clone https://github.com/karlitoxz/ps4-data-games.git
cd ps4-data-games
```

La versión actual se mantiene en la rama `main`. Para ejecutar la aplicación necesitas Python 3 y un navegador moderno; Node.js solo es necesario para las pruebas.

## Ejecutar localmente

Desde la carpeta del repositorio:

```sh
python -m http.server 8000
```

Abre http://127.0.0.1:8000/. Si tenías abierta la versión anterior, recarga con Ctrl+F5.

No requiere instalar dependencias ni configurar una base de datos. `index.html` carga `catalogo.js`, `catalogo.css` y `ps4_games_expanded.json`.

## Datos incompletos

La interfaz acepta categorías de enlaces ausentes, vacías o con tipos incorrectos. Omite registros sin nombre o cuyo nombre es una URL. Elimina enlaces duplicados por título, acepta solo HTTP/HTTPS y muestra el dominio real como etiqueta. Los títulos sin enlaces se ocultan inicialmente y se pueden incluir con el filtro.

Los JSON originales se conservan. Esta normalización no verifica que cada registro sea un juego real ni que cada dirección lleve a un archivo descargable: los datos de origen también contienen guías y páginas de navegación. Los enlaces se abren directamente en otra pestaña, sin el redireccionador antiguo.

Con la base incluida, la aplicación identifica 6.639 títulos, de los cuales 6.450 tienen al menos un enlace con formato HTTP/HTTPS válido. Omite 10.426 registros cuyo nombre es una URL. Estas cifras describen el contenido del catálogo, no la disponibilidad de las descargas.

## Solución de problemas

- Abre la aplicación mediante el servidor HTTP, no con doble clic en `index.html`.
- Si aparece un error de carga, comprueba que ejecutaste Python desde la carpeta del proyecto y que `ps4_games_expanded.json` está presente. El botón **Volver a intentar** permite repetir la carga.
- Si ves la interfaz anterior, recarga con **Ctrl+F5**.
- Si un sitio externo no abre o un archivo ya no existe, consulta otro enlace o la página de origen del título.

## Comprobaciones

Con Node.js instalado:

```sh
node --check catalogo.js
node catalogo.test.cjs
```

Las pruebas cubren los datos reales y registros con categorías ausentes, tipos incorrectos y enlaces duplicados o con protocolos no admitidos.

Las páginas `ps4-games-optimized.html`, `ps4-pwa-optimized.html` y los documentos PWA son versiones heredadas; la nueva aplicación se abre desde `index.html`. No incorpora todavía modo sin conexión ni soporte de mando.

Los archivos de juegos no están incluidos ni alojados aquí. La disponibilidad de cada enlace depende del sitio externo.
