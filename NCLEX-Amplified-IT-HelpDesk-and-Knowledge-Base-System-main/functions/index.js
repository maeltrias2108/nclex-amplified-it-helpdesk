const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');

initializeApp();

const db = getFirestore();

exports.archiveExpiredAnnouncements = onSchedule({
  schedule: 'every 1 minutes',
  timeZone: 'Asia/Manila',
  region: 'asia-southeast1',
  maxInstances: 1,
  timeoutSeconds: 120
}, async () => {
  const now = Timestamp.now();
  const announcements = db.collection('announcements');
  let archivedCount = 0;

  const archiveExpiredQuery = async (baseQuery) => {
    let count = 0;
    while (true) {
      const expired = await baseQuery
        .orderBy('expirationDate', 'asc')
        .limit(400)
        .get();

      if (expired.empty) break;

      const batch = db.batch();
      for (const announcement of expired.docs) {
        batch.update(announcement.ref, { archived: true, updatedAt: now });
      }
      await batch.commit();
      count += expired.size;
      if (expired.size < 400) break;
    }
    return count;
  };

  const activeAnnouncements = announcements.where('archived', '==', false);
  archivedCount += await archiveExpiredQuery(activeAnnouncements
    .where('expirationDate', '>', Timestamp.fromMillis(0))
    .where('expirationDate', '<=', now));
  archivedCount += await archiveExpiredQuery(activeAnnouncements
    .where('expirationDate', '>', '1970-01-01T00:00:00.000Z')
    .where('expirationDate', '<=', now.toDate().toISOString()));

  if (archivedCount) {
    console.info(`Archived ${archivedCount} expired announcements.`);
  }
});