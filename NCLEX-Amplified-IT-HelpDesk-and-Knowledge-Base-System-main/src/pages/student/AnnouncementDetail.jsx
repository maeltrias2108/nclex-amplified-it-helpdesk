import React from 'react';
import { ArrowLeft, Calendar, Clock, Bell, User } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { RichTextContent } from '../../components/common/RichTextContent';
import { formatManilaDateTime, isAnnouncementActive } from '../../data/announcement-time';
import { useAnnouncementClock } from '../../hooks/useAnnouncementClock';

export function AnnouncementDetail({ data, setView, selected, admin = false }) {
  const now = useAnnouncementClock(data.announcements);
  const item = data.announcements.find((a) => a.id === selected.announcementId);

  if (!item || (!admin && !isAnnouncementActive(item, now))) {
    return (
      <EmptyState
        title="Announcement Not Found"
        text="This announcement might have expired or been archived."
        action="Back to Announcements"
        onAction={() => setView('announcements')}
      />
    );
  }

  const pubDate = item.publishedAt || item.date;
  const expDate = item.expirationDate || item.expiresAt;

  return (
    <div className="page-container announcement-detail-page">
      <button
        type="button"
        className="back-button"
        onClick={() => setView(admin ? 'admin-announcements' : 'announcements')}
      >
        <ArrowLeft size={16} /> Back to Announcements
      </button>

      <PageHeader
        eyebrow={`${item.priority || 'Normal'} Priority Notice`}
        title={item.title}
        description={`Official update from ${item.publisher || 'IT Operations Team'}`}
      />

      <article className="panel announcement-detail-panel">
        <div className="announcement-meta-strip">
          <div className="meta-strip-item">
            <Calendar size={16} />
            <span>Published: {formatManilaDateTime(pubDate)}</span>
          </div>
          {expDate && (
            <div className="meta-strip-item">
              <Clock size={16} />
              <span>Expires: {formatManilaDateTime(expDate)}</span>
            </div>
          )}
          <div className="meta-strip-item">
            <User size={16} />
            <span>By: {item.publisher || 'IT Support Team'}</span>
          </div>
        </div>

        {item.summary && (
          <div className="announcement-lead-callout">
            <p>{item.summary}</p>
          </div>
        )}

        <RichTextContent className="announcement-body-full" content={item.content} />
      </article>
    </div>
  );
}
