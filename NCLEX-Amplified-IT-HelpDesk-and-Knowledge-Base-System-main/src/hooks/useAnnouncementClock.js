import { useEffect, useState } from 'react';
import { nextAnnouncementBoundary } from '../data/announcement-time';

export function useAnnouncementClock(announcements) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const boundary = nextAnnouncementBoundary(announcements, Date.now());
    if (boundary === null) return undefined;
    const delay = Math.max(1, Math.min(boundary - Date.now() + 10, 2147480000));
    const timer = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [announcements, now]);

  return now;
}