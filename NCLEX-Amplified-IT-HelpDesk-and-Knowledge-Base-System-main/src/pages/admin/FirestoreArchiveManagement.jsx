import React, { useState } from 'react';
import { Archive, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { EmptyState } from '../../components/common/EmptyState';
import { normalizeCategory } from '../../category-config';
import { firebaseErrorMessage } from '../../firebase';
import { fmt } from '../../data/seed';

export function FirestoreArchiveManagement({
  data,
  setView,
  updateData,
  notify,
  updateContent
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const matches = (text) => String(text || '').toLowerCase().includes(searchTerm.toLowerCase());

  const archivedArticles = (data.articles || [])
    .filter((item) => item.archived === true || item.published === false)
    .filter((item) => matches(`${item.title} ${item.summary} ${item.category}`));

  const archivedFaqs = (data.faqs || [])
    .filter((item) => item.archived === true || item.published === false)
    .filter((item) => matches(`${item.question} ${item.answer} ${item.category}`));

  const archivedAnnouncements = (data.announcements || [])
    .filter((item) => item.archived === true || item.published === false)
    .filter((item) => matches(`${item.title} ${item.summary} ${item.content}`));

  const closedTickets = (data.tickets || [])
    .filter((item) => ['Resolved', 'Closed'].includes(item.status))
    .filter((item) => matches(`${item.id} ${item.subject} ${item.ownerName} ${item.owner}`));

  const handleRestoreRecord = async (type, item) => {
    try {
      if (updateContent) {
        await updateContent(type, item.id, { archived: false, published: true });
      }

      const updated = (data[type] || []).map((entry) =>
        entry.id === item.id ? { ...entry, archived: false, published: true } : entry
      );
      updateData(type, updated);
      notify('Record restored successfully.');
    } catch (err) {
      notify(firebaseErrorMessage(err), 'error');
    }
  };

  const renderGroup = (title, items, renderRow) => (
    <section className="panel archive-group-card">
      <div className="panel-heading">
        <div>
          <span className="panel-eyebrow">Archive Category</span>
          <h2 className="panel-title">{title}</h2>
        </div>
        <span className="archive-count-pill">{items.length}</span>
      </div>

      {items.length > 0 ? (
        <div className="archive-rows-list">{items.map(renderRow)}</div>
      ) : (
        <p className="empty-inline-text">No archived {title.toLowerCase()}.</p>
      )}
    </section>
  );

  return (
    <div className="page-container archive-management-page">
      <button
        type="button"
        className="back-button"
        onClick={() => setView('admin-dashboard')}
      >
        <ArrowLeft size={16} /> Back to Admin Overview
      </button>

      <PageHeader
        eyebrow="Data Governance"
        title="Central Archive &amp; Recovery"
        description="Review inactive knowledge articles, hidden FAQs, expired notices, and resolved support tickets."
      />

      <div className="toolbar-strip">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search all archived records..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      <div className="archive-categories-grid">
        {renderGroup('Knowledge Base Articles', archivedArticles, (item) => (
          <div className="archive-item-row" key={item.id}>
            <div className="archive-row-left">
              <Archive size={16} className="archive-icon text-muted" />
              <div>
                <strong>{item.title}</strong>
                <small>{normalizeCategory(item.category)} &bull; {item.published ? 'Archived' : 'Unpublished Draft'}</small>
              </div>
            </div>
            <div className="archive-row-right">
              <button
                type="button"
                className="button button-sm button-secondary"
                onClick={() => handleRestoreRecord('articles', item)}
              >
                Restore
              </button>
            </div>
          </div>
        ))}

        {renderGroup('System FAQs', archivedFaqs, (item) => (
          <div className="archive-item-row" key={item.id}>
            <div className="archive-row-left">
              <Archive size={16} className="archive-icon text-muted" />
              <div>
                <strong>{item.question}</strong>
                <small>{normalizeCategory(item.category)}</small>
              </div>
            </div>
            <div className="archive-row-right">
              <button
                type="button"
                className="button button-sm button-secondary"
                onClick={() => handleRestoreRecord('faqs', item)}
              >
                Restore
              </button>
            </div>
          </div>
        ))}

        {renderGroup('Announcements', archivedAnnouncements, (item) => (
          <div className="archive-item-row" key={item.id}>
            <div className="archive-row-left">
              <Archive size={16} className="archive-icon text-muted" />
              <div>
                <strong>{item.title}</strong>
                <small>Published {fmt(item.publishedAt || item.date)}</small>
              </div>
            </div>
            <div className="archive-row-right">
              <button
                type="button"
                className="button button-sm button-secondary"
                onClick={() => handleRestoreRecord('announcements', item)}
              >
                Restore
              </button>
            </div>
          </div>
        ))}

        {renderGroup('Closed & Resolved Tickets', closedTickets, (item) => (
          <div className="archive-item-row" key={item.id}>
            <div className="archive-row-left">
              <Archive size={16} className="archive-icon text-muted" />
              <div>
                <strong>{item.subject}</strong>
                <small>
                  {item.id} &bull; {item.ownerName} &bull; {item.status} &bull; {fmt(item.updatedAt)}
                </small>
              </div>
            </div>
            <div className="archive-row-right">
              <button
                type="button"
                className="icon-button"
                onClick={() => setView('ticket-detail', { ticketId: item.id })}
                aria-label={`View ticket ${item.id}`}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
