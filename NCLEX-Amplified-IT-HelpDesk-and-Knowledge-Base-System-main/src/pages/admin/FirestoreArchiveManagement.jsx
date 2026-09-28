import React, { useState } from 'react';
import { Archive, RefreshCw, ArrowRight, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { EmptyState } from '../../components/common/EmptyState';
import { normalizeCategory } from '../../category-config';
import { firebaseErrorMessage } from '../../firebase';
import { fmt } from '../../data/seed';
import { richTextToPlainText } from '../../components/common/RichTextContent';
import { formatManilaDateTime, isAnnouncementExpired } from '../../data/announcement-time';

export function FirestoreArchiveManagement({
  data,
  setView,
  setConfirm,
  updateData,
  notify,
  updateContent,
  deleteContent
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const matches = (text) => String(text || '').toLowerCase().includes(searchTerm.toLowerCase());

  const archivedArticles = (data.articles || [])
    .filter((item) => item.archived === true || item.published === false)
    .filter((item) => matches(`${item.title} ${item.summary} ${item.category}`));

  const archivedFaqs = (data.faqs || [])
    .filter((item) => item.archived === true || item.published === false)
    .filter((item) => matches(`${item.question} ${richTextToPlainText(item.answer)} ${item.category}`));

  const archivedAnnouncements = (data.announcements || [])
    .filter((item) => item.archived === true || item.published === false)
    .filter((item) => matches(`${item.title} ${item.summary} ${richTextToPlainText(item.content)}`));

  const closedTickets = (data.tickets || [])
    .filter((item) => ['Resolved', 'Closed'].includes(item.status))
    .filter((item) => matches(`${item.id} ${item.subject} ${item.ownerName} ${item.owner}`));

  const handleRestoreRecord = async (type, item) => {
    if (type === 'announcements' && isAnnouncementExpired(item)) {
      notify('Edit the expiration date to a future time before restoring this announcement.', 'error');
      return;
    }

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

  const handleDeleteAnnouncement = (announcement) => {
    setConfirm({
      title: 'Delete this announcement?',
      text: `This permanently deletes "${announcement.title}". No ticket history or other records will be affected.`,
      confirmLabel: 'Delete Announcement',
      isDanger: true,
      action: async () => {
        try {
          if (deleteContent) await deleteContent('announcements', announcement.id);
          updateData('announcements', (data.announcements || []).filter((item) => item.id !== announcement.id));
          notify('Announcement permanently deleted.');
        } catch (error) {
          notify(firebaseErrorMessage(error), 'error');
        } finally {
          setConfirm(null);
        }
      },
      onClose: () => setConfirm(null)
    });
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
                className="icon-button"
                onClick={() => setView('admin-announcement-edit', { announcementId: item.id })}
                aria-label={`Edit ${item.title}`}
                title="Edit announcement"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className="icon-button button-danger-icon"
                onClick={() => handleDeleteAnnouncement(item)}
                aria-label={`Delete ${item.title}`}
                title="Delete announcement"
              >
                <Trash2 size={16} />
              </button>
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
                <small>Published {formatManilaDateTime(item.publishedAt || item.date)}</small>
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
