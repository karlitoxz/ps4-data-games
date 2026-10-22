const assert = require('node:assert/strict');
const fs = require('node:fs');
const { normalizeGames, safeUrl } = require('./catalogo.js');
const raw = JSON.parse(fs.readFileSync(require('node:path').join(__dirname, 'ps4_games_expanded.json'), 'utf8'));
const result = normalizeGames(raw);
assert.equal(result.games.length + result.skipped, raw.length);
assert(result.games.every(game => Array.isArray(game.links)));
assert(result.games.find(game => game.name === 'Aca Neo Geo Big Tournament Golf').links.length > 0);
const partial = normalizeGames([
  null, {}, { name: 'https://example.com' }, { name: 'Empty' },
  { name: 'Partial', download_links: { other: ['https://filecrypt.cc/test', 'https://filecrypt.cc/test', 'javascript:alert(1)', null] } },
  { name: 'Wrong types', download_links: { mediafire: 'https://example.com', other: null } }
]);
assert.equal(partial.skipped, 3);
assert.equal(partial.games.find(game => game.name === 'Empty').links.length, 0);
assert.equal(partial.games.find(game => game.name === 'Wrong types').links.length, 0);
assert.equal(partial.games.find(game => game.name === 'Partial').links.length, 1);
assert.equal(safeUrl('javascript:alert(1)'), null);
assert.equal(safeUrl('https://user:password@example.com'), null);
assert.throws(() => normalizeGames({}));
console.log('Pruebas correctas: datos reales, categorías ausentes, tipos incorrectos, duplicados y protocolos.');
