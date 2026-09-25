import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Archive,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { EmptyState } from '../../components/common/EmptyState';
import { CATEGORY_NAMES, normalizeCategory } from '../../category-config';
import { firebaseErrorMessage } from '../../firebase';

const CONTENT_TYPE_CONFIG = {
  articles: {
    label: 'Knowledge Base Management',
    title: 'Guides & Documentation',
    singular: 'Article',
    itemsKey: 'articles',
    routeKey: 'article'
  },
  faqs: {
    label: 'FAQ Management',
    title: 'Frequently Asked Questions',
    singular: 'FAQ',
    itemsKey: 'faqs',
    routeKey: 'faq'
  },
  announcements: {
    label: 'Announcement Management',
    title: 'System Announcements',
    singular: 'Announcement',
    itemsKey: 'announcements',
    routeKey: 'announcement'
  }
};

export function FirestoreContentManager({
  type,
  data,
  setView,
  setConfirm,
  notify,
  updateData,
  contentState,
  updateContent,
  deleteContent
}) {
  const config = CONTENT_TYPE_CONFIG[type] || CONTENT_TYPE_CONFIG.articles;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  const items = (data[config.itemsKey] || []).filter((item) => {
    const norm = normalizeCategory(item.category);
    const matchesCat = selectedCategory === 'All categories' || norm === selectedCategory;
    const searchString = JSON.stringify(item).toLowerCase();
    return matchesCat && searchString.includes(searchTerm.toLowerCase());
  });

  const openCreateForm = () => {
    setView(`admin-${config.routeKey}-edit`, {
      articleId: null,
      faqId: null,
      announcementId: null
    });
  };

  const handleTogglePublish = async (item) => {
    const nextPublished = !item.published;
    try {
      if (updateContent) {
        await updateContent(type, item.id, { published: nextPublished });
      }
      const updated = data[config.itemsKey].map((entry) =>
        entry.id === item.id ? { ...entry, published: nextPublished } : entry
      );
      updateData(config.itemsKey, updated);
      notify(`${config.singular} is now ${nextPublished ? 'published' : 'unpublished'}.`);
    } catch (err) {
      notify(firebaseErrorMessage(err), 'error');
    }
  };

  const handleToggleArchive = async (item) => {
    const nextArchived = !item.archived;
    try {
      if (updateContent) {
        await updateContent(type, item.id, { archived: nextArchived });
      }
      const updated = data[config.itemsKey].map((entry) =>
        entry.id === item.id ? { ...entry, archived: nextArchived } : entry
      );
      updateData(config.itemsKey, updated);
      notify(`${config.singular} was ${nextArchived ? 'archived' : 'restored'}.`);
    } catch (err) {
      notify(firebaseErrorMessage(err), 'error');
    }
  };

  const handleDeletePrompt = (item) => {
    setConfirm({
      title: `Delete this ${config.singular}?`,
      text: `This permanently deletes "${item.title || item.question}" from the system database.`,
      confirmLabel: 'Delete Record',
      action: async () => {
        try {
          if (deleteContent) {
            await deleteContent(type, item.id);
          }
          const updated = data[config.itemsKey].filter((entry) => entry.id !== item.id);
          updateData(config.itemsKey, updated);
          notify(`${config.singular} permanently deleted.`);
        } catch (err) {
          notify(firebaseErrorMessage(err), 'error');
        } finally {
          setConfirm(null);
        }
      },
      onClose: () => setConfirm(null)
    });
  };

  if (contentState?.loading) {
    return (
      <EmptyState
        icon={<RefreshCw size={24} className="spin-icon" />}
        title={`Loading ${config.title}...`}
        text="Synchronizing records with Firestore."
      />
    );
  }

  return (
    <div className="page-container content-manager-page">
      <PageHeader
        eyebrow={config.label}
        title={config.title}
        description={`Create, edit, schedule, publish, and manage ${config.singular.toLowerCase()} records.`}
        action={
          <button
            type="button"
            className="button button-primary"
            onClick={openCreateForm}
          >
            <Plus size={17} /> Add {config.singular}
          </button>
        }
      />

      <div className={`toolbar-strip ${type === 'announcements' ? 'announcements-toolbar' : ''}`}>
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={`Search ${config.singular.toLowerCase()}s by keywords...`}
          onClear={() => setSearchTerm('')}
        />

        <div className="content-manager-toolbar-actions">
          {type !== 'announcements' && (
            <div className="toolbar-filter-group">
              <label htmlFor="admin-category-filter" className="sr-only">
                Filter category
              </label>
              <select
                id="admin-category-filter"
                className="select-dropdown"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All categories">All Categories</option>
                {CATEGORY_NAMES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            className="button button-secondary"
            onClick={() => setView('admin-archive')}
          >
            <Archive size={16} /> Open Archive
          </button>
        </div>
      </div>

      <section className="panel table-panel">
        {items.length > 0 ? (
          <div className="content-admin-list">
            {items.map((item) => {
              const isPublished = item.published !== false;
              const isArchived = item.archived === true;
              const titleText = item.title || item.question;

              return (
                <div className="content-admin-row-item" key={item.id}>
                  <div className="item-icon-box">
                    <FileText size={18} />
                  </div>

                  <div className="item-summary-box">
                    <strong className="item-main-title">{titleText}</strong>
                  </div>

                  <div className="item-action-buttons">
                    <button
                      type="button"
                      className="button button-sm button-secondary"
                      onClick={() => {
                        if (type === 'faqs') {
                          setExpandedFaqId((current) => current === item.id ? null : item.id);
                          return;
                        }
                        setView(
                          type === 'articles' ? 'article-detail' : 'announcement-detail',
                          { articleId: item.id, announcementId: item.id }
                        );
                      }}
                    >
                      {type === 'faqs' && expandedFaqId === item.id ? 'Close Preview' : 'Preview'}
                    </button>

                    <button
                      type="button"
                      className="icon-button"
                      onClick={() =>
                        setView(
                          type === 'announcements'
                            ? 'admin-announcement-edit'
                            : `admin-${config.routeKey}-edit`,
                          {
                            [type === 'articles'
                              ? 'articleId'
                              : type === 'faqs'
                              ? 'faqId'
                              : 'announcementId']: item.id
                          }
                        )
                      }
                      aria-label={`Edit ${titleText}`}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className={`button button-sm publish-toggle ${isPublished ? 'is-published' : 'is-unpublished'}`}
                      onClick={() => handleTogglePublish(item)}
                    >
                      {isPublished ? 'Published' : 'Unpublished'}
                    </button>

                    <button
                      type="button"
                      className="button button-sm button-secondary"
                      onClick={() => handleToggleArchive(item)}
                    >
                      {isArchived ? 'Restore' : 'Archive'}
                    </button>

                    <button
                      type="button"
                      className="icon-button button-danger-icon"
                      onClick={() => handleDeletePrompt(item)}
                      aria-label={`Delete ${titleText}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {type === 'faqs' && expandedFaqId === item.id && (
                    <div className="faq-manager-preview">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<FileText size={24} />}
            title={`No ${config.singular.toLowerCase()}s found`}
            text="No content records match your search criteria. Add a new item to get started."
            action={`Add ${config.singular}`}
            onAction={openCreateForm}
          />
        )}
      </section>
    </div>
  );
}
