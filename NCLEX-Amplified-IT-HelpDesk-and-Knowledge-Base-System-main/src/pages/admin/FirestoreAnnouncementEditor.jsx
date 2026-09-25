import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { firebaseErrorMessage } from '../../firebase';

export function FirestoreAnnouncementEditor({
  data,
  setView,
  updateData,
  notify,
  selected,
  createContent,
  updateContent
}) {
  const existingId = selected?.announcementId;
  const existing = (data.announcements || []).find((a) => a.id === existingId);

  const formatForDateInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const [form, setForm] = useState(
    existing
      ? {
          title: existing.title || '',
          summary: existing.summary || '',
          content: existing.content || '',
          priority: existing.priority || 'Normal',
          publisher: existing.publisher || 'IT Support Team',
          publishedAt: formatForDateInput(existing.publishedAt || existing.date) || new Date().toISOString().slice(0, 16),
          expirationDate: formatForDateInput(existing.expirationDate || existing.expiresAt) || '',
          published: existing.published !== false,
          archived: existing.archived === true
        }
      : {
          title: '',
          summary: '',
          content: '',
          priority: 'Normal',
          publisher: 'IT Support Team',
          publishedAt: new Date().toISOString().slice(0, 16),
          expirationDate: '',
          published: true,
          archived: false
        }
  );

  const [saving, setSaving] = useState(false);

  const update = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.publishedAt) {
      notify('Title, content, and publish date are required.', 'error');
      return;
    }

    if (form.expirationDate) {
      const pubD = new Date(form.publishedAt);
      const expD = new Date(form.expirationDate);
      if (expD <= pubD) {
        notify('Expiration date must be later than the publish date.', 'error');
        return;
      }
    }

    setSaving(true);

    try {
      const now = new Date().toISOString();
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        priority: form.priority,
        publisher: form.publisher.trim() || 'IT Support Team',
        publishedAt: new Date(form.publishedAt).toISOString(),
        expirationDate: form.expirationDate ? new Date(form.expirationDate).toISOString() : null,
        published: form.published !== false,
        archived: form.archived === true
      };

      if (existing) {
        if (updateContent) {
          await updateContent('announcements', existing.id, payload);
        }
        const updated = data.announcements.map((a) =>
          a.id === existing.id ? { ...a, ...payload, updatedAt: now } : a
        );
        updateData('announcements', updated);
        notify('Announcement updated successfully.');
      } else {
        let newId = `ann-${Date.now()}`;
        if (createContent) {
          const resId = await createContent('announcements', payload);
          if (resId) newId = resId;
        }
        const newRecord = { ...payload, id: newId, createdAt: now, updatedAt: now };
        updateData('announcements', [newRecord, ...data.announcements]);
        notify('Announcement created successfully.');
      }

      setView('admin-announcements');
    } catch (err) {
      notify(firebaseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container announcement-editor-page">
      <button
        type="button"
        className="back-button"
        onClick={() => setView('admin-announcements')}
      >
        <ArrowLeft size={16} /> Back to Announcements
      </button>

      <PageHeader
        eyebrow="Portal Communications"
        title={`${existing ? 'Edit' : 'Create'} Announcement`}
        description="Schedule maintenance windows, urgent alerts, and portal notices for students."
      />

      <form className="panel form-panel" onSubmit={submit}>
        <div className="form-grid-layout">
          <label className="field full-width">
            <span className="field-label">
              Announcement Title <i className="text-danger">*</i>
            </span>
            <input
              required
              name="title"
              value={form.title}
              onChange={update}
              placeholder="e.g. Scheduled Maintenance: Studium CAT Server Upgrades"
            />
          </label>

          <label className="field full-width">
            <span className="field-label">Brief Summary (Optional)</span>
            <input
              name="summary"
              value={form.summary}
              onChange={update}
              placeholder="Short headline for preview banners..."
            />
          </label>

          <label className="field full-width">
            <span className="field-label">
              Full Announcement Content <i className="text-danger">*</i>
            </span>
            <textarea
              required
              rows={7}
              name="content"
              value={form.content}
              onChange={update}
              placeholder="Detailed explanation of the announcement, schedules, affected systems..."
            />
          </label>

          <label className="field">
            <span className="field-label">
              Publish Date &amp; Time <i className="text-danger">*</i>
            </span>
            <input
              required
              type="datetime-local"
              name="publishedAt"
              value={form.publishedAt}
              onChange={update}
            />
          </label>

          <label className="field">
            <span className="field-label">Expiration Date &amp; Time (Optional)</span>
            <input
              type="datetime-local"
              name="expirationDate"
              value={form.expirationDate}
              onChange={update}
            />
          </label>

          <label className="field">
            <span className="field-label">Priority Level</span>
            <select name="priority" value={form.priority} onChange={update}>
              <option value="Normal">Normal Notice</option>
              <option value="Important">Important Alert</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Publisher Display Name</span>
            <input
              name="publisher"
              value={form.publisher}
              onChange={update}
              placeholder="IT Operations Team"
            />
          </label>

          <div className="field-checkbox-row full-width">
            <label className="checkbox-control">
              <input
                type="checkbox"
                name="published"
                checked={form.published !== false}
                onChange={update}
              />
              <span>Published (Visible when scheduled date arrives)</span>
            </label>

            <label className="checkbox-control">
              <input
                type="checkbox"
                name="archived"
                checked={form.archived === true}
                onChange={update}
              />
              <span>Archived</span>
            </label>
          </div>
        </div>

        <div className="form-action-bar">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setView('admin-announcements')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner" /> Saving...
              </>
            ) : (
              <>
                <Check size={16} /> Save Announcement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
