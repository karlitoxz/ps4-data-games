(function () {
  'use strict';
  function safeUrl(value) {
    if (typeof value !== 'string') return null;
    try {
      var url = new URL(value);
      return /^(https?:)$/.test(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch (_) { return null; }
  }
  function normalizeGames(data) {
    if (!Array.isArray(data)) throw new Error('La base de datos no contiene una lista de juegos.');
    var skipped = 0, games = [];
    data.forEach(function (record) {
      if (!record || typeof record.name !== 'string' || !record.name.trim() || /^https?:\/\//i.test(record.name.trim())) { skipped++; return; }
      var groups = record.download_links, links = [], seen = new Set();
      if (groups && typeof groups === 'object' && !Array.isArray(groups)) {
        Object.keys(groups).forEach(function (key) {
          if (!Array.isArray(groups[key])) return;
          groups[key].forEach(function (value) {
            var url = safeUrl(value);
            if (url && !seen.has(url)) {
              seen.add(url);
              links.push({ url: url, host: new URL(url).hostname.replace(/^www\./, '') });
            }
          });
        });
      }
      games.push({ name: record.name.trim(), links: links, page: safeUrl(record.page_url) });
    });
    games.sort(function (a, b) { return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }); });
    return { games: games, skipped: skipped };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { normalizeGames: normalizeGames, safeUrl: safeUrl };
  if (typeof document === 'undefined') return;
  var games = [], skipped = 0, page = 1, pageSize = 40;
  var search = document.getElementById('search'), includeEmpty = document.getElementById('include-empty');
  var container = document.getElementById('games'), status = document.getElementById('status');
  var error = document.getElementById('error'), pagination = document.getElementById('pagination');
  function fold(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function externalLink(url, label, className) {
    var link = document.createElement('a');
    link.href = url; link.textContent = label; link.target = '_blank'; link.rel = 'noopener noreferrer';
    if (className) link.className = className;
    return link;
  }
  function render() {
    var query = fold(search.value.trim());
    var filtered = games.filter(function (game) { return (includeEmpty.checked || game.links.length > 0) && fold(game.name).includes(query); });
    var pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(page, pages);
    container.replaceChildren();
    var fragment = document.createDocumentFragment();
    filtered.slice((page - 1) * pageSize, page * pageSize).forEach(function (game) {
      var card = document.createElement('article'); card.className = 'game';
      var title = document.createElement('h2'); title.textContent = game.name; card.appendChild(title);
      var links = document.createElement('div'); links.className = 'links';
      var hosts = {};
      game.links.forEach(function (link) {
        hosts[link.host] = (hosts[link.host] || 0) + 1;
        links.appendChild(externalLink(link.url, link.host + ' · ' + hosts[link.host]));
      });
      if (!game.links.length) {
        var empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Sin enlaces disponibles en la base de datos.'; card.appendChild(empty);
      }
      card.appendChild(links);
      if (game.page) card.appendChild(externalLink(game.page, 'Ver página de origen ↗', 'source'));
      fragment.appendChild(card);
    });
    if (!filtered.length) {
      var empty = document.createElement('p'); empty.className = 'no-results'; empty.textContent = 'No hay títulos que coincidan con estos filtros.'; fragment.appendChild(empty);
    }
    container.appendChild(fragment);
    status.textContent = filtered.length.toLocaleString('es') + ' títulos encontrados · ' + games.length.toLocaleString('es') + ' títulos en el catálogo · ' + skipped.toLocaleString('es') + ' registros sin título válido omitidos';
    pagination.hidden = !filtered.length;
    document.getElementById('page-info').textContent = 'Página ' + page + ' de ' + pages;
    document.getElementById('previous').disabled = page <= 1;
    document.getElementById('next').disabled = page >= pages;
  }
  async function load() {
    error.hidden = true; pagination.hidden = true; status.textContent = 'Cargando catálogo…';
    container.replaceChildren(); search.disabled = true; includeEmpty.disabled = true;
    try {
      var response = await fetch('ps4_games_expanded.json');
      if (!response.ok) throw new Error('No se pudo cargar el archivo JSON (HTTP ' + response.status + ').');
      var result = normalizeGames(await response.json());
      games = result.games; skipped = result.skipped; page = 1;
    } catch (cause) {
      console.error('Error al cargar el catálogo:', cause);
      status.textContent = 'No se pudo cargar el catálogo.';
      document.getElementById('error-message').textContent = location.protocol === 'file:' ? 'Abre esta aplicación mediante tu servidor local: http://127.0.0.1:8000/.' : 'Comprueba que ps4_games_expanded.json esté disponible y sea un JSON válido. ' + cause.message;
      error.hidden = false; return;
    }
    search.disabled = false; includeEmpty.disabled = false;
    render();
  }
  search.addEventListener('input', function () { page = 1; render(); });
  includeEmpty.addEventListener('change', function () { page = 1; render(); });
  document.getElementById('previous').addEventListener('click', function () { page--; render(); container.scrollIntoView({ block: 'start' }); });
  document.getElementById('next').addEventListener('click', function () { page++; render(); container.scrollIntoView({ block: 'start' }); });
  document.getElementById('retry').addEventListener('click', load);
  load();
})();
