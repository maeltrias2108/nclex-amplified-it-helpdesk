export const ANNOUNCEMENT_TIME_ZONE = 'Asia/Manila';

const manilaParts = (date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ANNOUNCEMENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
};

export const toManilaDateTimeInput = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = manilaParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const fromManilaDateTimeInput = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(value || ''));
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const wallParts = {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
    hour: Number(hourText),
    minute: Number(minuteText)
  };
  if (wallParts.month < 1 || wallParts.month > 12 || wallParts.day < 1 || wallParts.day > 31 || wallParts.hour > 23 || wallParts.minute > 59) return null;

  const wallTimeAsUtc = Date.UTC(wallParts.year, wallParts.month - 1, wallParts.day, wallParts.hour, wallParts.minute);
  let candidate = wallTimeAsUtc;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = manilaParts(new Date(candidate));
    const representedAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    const adjustment = wallTimeAsUtc - representedAsUtc;
    if (adjustment === 0) return new Date(candidate);
    candidate += adjustment;
  }
  return null;
};

export const formatManilaDateTime = (value, options = {}) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: ANNOUNCEMENT_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options
  }).format(date);
};

export const isAnnouncementExpired = (announcement, now = Date.now()) => {
  const expiration = announcement?.expirationDate || announcement?.expiresAt;
  return Boolean(expiration && new Date(expiration).getTime() <= now);
};

export const isAnnouncementActive = (announcement, now = Date.now()) => {
  if (!announcement?.published || announcement.archived || isAnnouncementExpired(announcement, now)) return false;
  const publication = new Date(announcement.publishedAt || announcement.date).getTime();
  return Number.isFinite(publication) && publication <= now;
};

export const nextAnnouncementBoundary = (announcements, now = Date.now()) => {
  let next = Infinity;
  for (const announcement of announcements || []) {
    if (!announcement?.published || announcement.archived) continue;
    const publication = new Date(announcement.publishedAt || announcement.date).getTime();
    const expirationValue = announcement.expirationDate || announcement.expiresAt;
    const expiration = expirationValue ? new Date(expirationValue).getTime() : NaN;
    if (Number.isFinite(publication) && publication > now) next = Math.min(next, publication);
    if (Number.isFinite(expiration) && expiration > now) next = Math.min(next, expiration);
  }
  return Number.isFinite(next) ? next : null;
};

export const validateAnnouncementTimes = ({
  publishedAt,
  expirationDate,
  instantPublish,
  preservedPublishedAt,
  preservedExpirationDate
}, now = new Date()) => {
  const publication = preservedPublishedAt
    ? new Date(preservedPublishedAt)
    : fromManilaDateTimeInput(publishedAt);
  if (!publication) return { error: 'Enter a valid publication date and time.' };

  const publishImmediately = instantPublish === true;
  if (!publishImmediately && !preservedPublishedAt && publication.getTime() <= now.getTime()) {
    return { error: 'Publication date and time must be in the future. To publish now, toggle Published off and on.' };
  }

  const effectivePublication = publishImmediately ? now : publication;
  const expiration = expirationDate
    ? preservedExpirationDate ? new Date(preservedExpirationDate) : fromManilaDateTimeInput(expirationDate)
    : null;
  if (expirationDate && !expiration) return { error: 'Enter a valid expiration date and time.' };
  if (expiration && expiration.getTime() <= now.getTime()) {
    return { error: 'Expiration date and time must be later than the current time.' };
  }
  if (expiration && expiration.getTime() <= effectivePublication.getTime()) {
    return { error: 'Expiration date and time must be later than the publication date and time.' };
  }

  return {
    error: null,
    publishedAt: publishImmediately ? now.toISOString() : preservedPublishedAt || effectivePublication.toISOString(),
    expirationDate: expiration ? preservedExpirationDate || expiration.toISOString() : null
  };
};