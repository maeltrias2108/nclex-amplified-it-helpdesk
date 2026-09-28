function isDueForArchive(announcement, nowMillis) {
  if (!announcement || announcement.archived === true || !announcement.expirationDate) return false;
  const expirationMillis = typeof announcement.expirationDate.toMillis === 'function'
    ? announcement.expirationDate.toMillis()
    : typeof announcement.expirationDate === 'string'
      ? new Date(announcement.expirationDate).getTime()
      : NaN;
  return Number.isFinite(expirationMillis) && expirationMillis <= nowMillis;
}

module.exports = { isDueForArchive };