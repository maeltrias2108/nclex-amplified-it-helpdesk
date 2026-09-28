import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fromManilaDateTimeInput,
  isAnnouncementActive,
  isAnnouncementExpired,
  toManilaDateTimeInput,
  validateAnnouncementTimes
} from './announcement-time.js';

test('converts Manila wall time to and from a UTC instant', () => {
  const instant = fromManilaDateTimeInput('2026-09-27T12:00');
  assert.equal(instant.toISOString(), '2026-09-27T04:00:00.000Z');
  assert.equal(toManilaDateTimeInput(instant), '2026-09-27T12:00');
});

test('validates scheduled and instant publication and expiration ordering', () => {
  const now = new Date('2026-09-27T04:00:00.000Z');
  const scheduled = validateAnnouncementTimes({ publishedAt: '2026-09-27T13:00' }, now);
  assert.equal(scheduled.publishedAt, '2026-09-27T05:00:00.000Z');

  const instant = validateAnnouncementTimes({ publishedAt: '2026-09-27T11:00', instantPublish: true }, now);
  assert.equal(instant.publishedAt, now.toISOString());

  assert.match(
    validateAnnouncementTimes({ publishedAt: '2026-09-27T11:00' }, now).error,
    /must be in the future/
  );
  assert.match(
    validateAnnouncementTimes({ publishedAt: '2026-09-27T13:00', expirationDate: '2026-09-27T12:30' }, now).error,
    /later than the publication/
  );
  assert.match(
    validateAnnouncementTimes({ publishedAt: '2026-09-27T13:00', expirationDate: '2026-09-27T12:00' }, now).error,
    /later than the current time/
  );
});

test('preserves exact saved timestamps when existing date fields are untouched', () => {
  const now = new Date('2026-09-27T04:00:00.000Z');
  const preservedPublishedAt = '2026-09-20T08:22:37.000Z';
  const preservedExpirationDate = '2026-10-01T12:13:47.000Z';
  const result = validateAnnouncementTimes({
    publishedAt: '2026-09-20T16:22',
    expirationDate: '2026-10-01T20:13',
    preservedPublishedAt,
    preservedExpirationDate
  }, now);
  assert.equal(result.publishedAt, preservedPublishedAt);
  assert.equal(result.expirationDate, preservedExpirationDate);
});

test('student visibility follows exact publication and expiration instants', () => {
  const now = Date.parse('2026-09-27T04:00:00.000Z');
  assert.equal(isAnnouncementActive({ published: true, publishedAt: '2026-09-27T04:00:00.000Z' }, now), true);
  assert.equal(isAnnouncementActive({ published: true, publishedAt: '2026-09-27T04:00:00.001Z' }, now), false);
  assert.equal(isAnnouncementExpired({ published: true, expirationDate: '2026-09-27T04:00:00.000Z' }, now), true);
});