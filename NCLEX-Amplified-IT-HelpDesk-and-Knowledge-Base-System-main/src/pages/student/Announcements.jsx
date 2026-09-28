import React, { useState } from 'react';
import { Bell, Search, ArrowRight, RefreshCw, AlertCircle, Clock, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { EmptyState } from '../../components/common/EmptyState';
import { RichTextContent, richTextToPlainText } from '../../components/common/RichTextContent';
import { formatManilaDateTime, isAnnouncementActive } from '../../data/announcement-time';
import { useAnnouncementClock } from '../../hooks/useAnnouncementClock';

export function Announcements({ data, setView, contentState }) {
  const [searchTerm, setSearchTerm] = useState('');
  const now = useAnnouncementClock(data.announcements);

  const activeAnnouncements = data.announcements.filter((item) => isAnnouncementActive(item, now));

  const filtered = activeAnnouncements.filter((a) => {
    const searchString = `${a.title} ${a.summary || ''} ${richTextToPlainText(a.content)} ${a.publisher || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (contentState?.loading) {
    return (
      <EmptyState
        icon={<RefreshCw size={24} className="spin-icon" />}
        title="Loading Announcements..."
        text="Checking for latest updates from Firestore."
      />
    );
  }

  if (contentState?.error) {
    return (
      <EmptyState
        icon={<AlertCircle size={24} />}
        title="Announcements Unavailable"
        text={contentState.error}
      />
    );
  }

  return (
    <div className="page-container announcements-page">
      <PageHeader
        eyebrow="Portal Updates"
        title="System Announcements"
        description="Stay up to date with planned maintenance windows, system updates, and critical academic notices."
      />

      <div className="content-search-bar">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search announcements by title or content..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      <div className="section-meta-bar">
        <span className="section-label">Active Announcements</span>
        <span className="section-count-tag">
          {filtered.length} {filtered.length === 1 ? 'notice' : 'notices'}
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="announcements-card-list">
          {filtered.map((item) => {
            const isImportant = (item.priority || '').toLowerCase() === 'important';
            return (
              <article
                className={`announcement-full-card ${isImportant ? 'is-important' : ''}`}
                key={item.id}
              >
                <div className="announcement-header">
                  <div className="announcement-meta-left">
                    <span className={`priority-badge ${(item.priority || 'Normal').toLowerCase()}`}>
                      {item.priority || 'Normal'} Priority
                    </span>
                    <span className="announcement-date">
                      <Calendar size={14} /> {formatManilaDateTime(item.publishedAt || item.date)}
                    </span>
                  </div>
                  <span className="announcement-author">
                    Published by {item.publisher || 'IT Support'}
                  </span>
                </div>

                <h2 className="announcement-card-title">{item.title}</h2>
                {item.summary && <p className="announcement-card-summary">{item.summary}</p>}

                <RichTextContent className="announcement-card-body" content={item.content} />

                <div className="announcement-card-footer">
                  <div className="announcement-expiry">
                    {(item.expirationDate || item.expiresAt) && (
                      <span>
                        <Clock size={13} /> Active until{' '}
                        {formatManilaDateTime(item.expirationDate || item.expiresAt)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() =>
                      setView('announcement-detail', { announcementId: item.id })
                    }
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Bell size={24} />}
          title="No announcements found"
          text="There are no published announcements matching your search query."
        />
      )}
    </div>
  );
}
