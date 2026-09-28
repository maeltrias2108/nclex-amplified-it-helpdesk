const test = require('node:test');
const assert = require('node:assert/strict');
const { isDueForArchive } = require('./announcement-archive.cjs');

test('archives an announcement at its expiration instant', () => {
  const now = Date.parse('2026-09-27T04:00:00.000Z');
  assert.equal(isDueForArchive({ expirationDate: { toMillis: () => now } }, now), true);
  assert.equal(isDueForArchive({ expirationDate: '2026-09-27T04:00:00.000Z' }, now), true);
  assert.equal(isDueForArchive({ expirationDate: { toMillis: () => now + 1 } }, now), false);
});

test('leaves unexpired, archived, and non-expiring announcements unchanged', () => {
  const now = Date.parse('2026-09-27T04:00:00.000Z');
  assert.equal(isDueForArchive({ expirationDate: { toMillis: () => now + 1 } }, now), false);
  assert.equal(isDueForArchive({ archived: true, expirationDate: { toMillis: () => now } }, now), false);
  assert.equal(isDueForArchive({ expirationDate: null }, now), false);
});