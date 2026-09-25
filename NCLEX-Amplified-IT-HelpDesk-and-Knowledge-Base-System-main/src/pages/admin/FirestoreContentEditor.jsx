import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { CATEGORY_NAMES, normalizeCategory } from '../../category-config';
import { firebaseErrorMessage } from '../../firebase';

export function FirestoreContentEditor({
  type = 'articles',
  data,
  setView,
  updateData,
  notify,
  selected,
  createContent,
  updateContent
}) {
  const isArticle = type === 'articles';
  const idKey = isArticle ? 'articleId' : 'faqId';
  const itemsKey = isArticle ? 'articles' : 'faqs';
  const singular = isArticle ? 'Article' : 'FAQ';

  const existingId = selected?.[idKey];
  const existing = (data[itemsKey] || []).find((item) => item.id === existingId);

  const [form, setForm] = useState(
    existing ||
      (isArticle
        ? {
            title: '',
            summary: '',
            content: '',
            category: CATEGORY_NAMES[0],
            published: true,
            archived: false,
            author: 'IT Support Team'
          }
        : {
            question: '',
            answer: '',
            category: CATEGORY_NAMES[0],
            published: true,
            archived: false
          })
  );

  const [saving, setSaving] = useState(false);

  const update = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });

  const submit = async (e) => {
    e.preventDefault();
    const requiredValues = isArticle
      ? [form.title, form.summary, form.content]
      : [form.question, form.answer];

    if (requiredValues.some((v) => !String(v || '').trim())) {
      notify('Please complete all required fields before saving.', 'error');
      return;
    }

    setSaving(true);

    try {
      const now = new Date().toISOString();
      const payload = {
        ...form,
        category: normalizeCategory(form.category),
        published: form.published !== false,
        archived: form.archived === true
      };

      if (existing) {
        if (updateContent) {
          await updateContent(type, existing.id, payload);
        }
        const updated = data[itemsKey].map((entry) =>
          entry.id === existing.id ? { ...entry, ...payload, updatedAt: now } : entry
        );
        updateData(itemsKey, updated);
        notify(`${singular} updated successfully.`);
      } else {
        let newId = `${type}-${Date.now()}`;
        if (createContent) {
          const resId = await createContent(type, payload);
          if (resId) newId = resId;
        }
        const newRecord = { ...payload, id: newId, createdAt: now, updatedAt: now };
        updateData(itemsKey, [newRecord, ...data[itemsKey]]);
        notify(`${singular} created successfully.`);
      }

      setView(`admin-${type}`);
    } catch (err) {
      notify(firebaseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container content-editor-page">
      <button
        type="button"
        className="back-button"
        onClick={() => setView(`admin-${type}`)}
      >
        <ArrowLeft size={16} /> Back to {singular} List
      </button>

      <PageHeader
        eyebrow={`Content Management &bull; ${singular}`}
        title={`${existing ? 'Edit' : 'Create'} ${singular}`}
        description={`Configure and publish this ${singular.toLowerCase()} to the student knowledge portal.`}
      />

      <form className="panel form-panel" onSubmit={submit}>
        <div className="form-grid-layout">
          {isArticle ? (
            <>
              <label className="field full-width">
                <span className="field-label">
                  Article Title <i className="text-danger">*</i>
                </span>
                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={update}
                  placeholder="e.g. How to Clear Browser Cache for Studium CAT"
                />
              </label>

              <label className="field full-width">
                <span className="field-label">
                  Summary / Excerpt <i className="text-danger">*</i>
                </span>
                <input
                  required
                  name="summary"
                  value={form.summary}
                  onChange={update}
                  placeholder="A one-sentence summary for search previews..."
                />
              </label>

              <label className="field full-width">
                <span className="field-label">
                  Article Content <i className="text-danger">*</i>
                </span>
                <textarea
                  required
                  rows={8}
                  name="content"
                  value={form.content}
                  onChange={update}
                  placeholder="Write clear, numbered step-by-step instructions..."
                />
              </label>

              <label className="field">
                <span className="field-label">
                  Category <i className="text-danger">*</i>
                </span>
                <select name="category" value={form.category} onChange={update}>
                  {CATEGORY_NAMES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Author / Department</span>
                <input
                  name="author"
                  value={form.author || ''}
                  onChange={update}
                  placeholder="e.g. IT Operations, Academic Tech"
                />
              </label>
            </>
          ) : (
            <>
              <label className="field full-width">
                <span className="field-label">
                  Frequently Asked Question <i className="text-danger">*</i>
                </span>
                <input
                  required
                  name="question"
                  value={form.question}
                  onChange={update}
                  placeholder="e.g. Why does my mock exam say session expired?"
                />
              </label>

              <label className="field full-width">
                <span className="field-label">
                  Answer <i className="text-danger">*</i>
                </span>
                <textarea
                  required
                  rows={6}
                  name="answer"
                  value={form.answer}
                  onChange={update}
                  placeholder="Provide a concise and direct answer..."
                />
              </label>

              <label className="field">
                <span className="field-label">
                  Category <i className="text-danger">*</i>
                </span>
                <select name="category" value={form.category} onChange={update}>
                  {CATEGORY_NAMES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          <div className="field-checkbox-row full-width">
            <label className="checkbox-control">
              <input
                type="checkbox"
                name="published"
                checked={form.published !== false}
                onChange={update}
              />
              <span>Publish immediately for students</span>
            </label>

            <label className="checkbox-control">
              <input
                type="checkbox"
                name="archived"
                checked={form.archived === true}
                onChange={update}
              />
              <span>Send to Archive</span>
            </label>
          </div>
        </div>

        <div className="form-action-bar">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setView(`admin-${type}`)}
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
                <Check size={16} /> Save {singular}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
