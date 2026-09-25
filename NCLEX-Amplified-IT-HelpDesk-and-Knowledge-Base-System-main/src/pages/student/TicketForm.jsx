import React, { useState } from 'react';
import { Send, Upload, X, ArrowLeft, Image, ShieldAlert, Monitor, Info } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { TICKET_CATEGORIES } from '../../data/seed';

export function TicketForm({ setView, data, updateData, notify, session }) {
  const [form, setForm] = useState({
    subject: '',
    category: TICKET_CATEGORIES[0],
    priority: 'Normal',
    description: '',
    platform: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = '';
    if (!selectedFiles.length) return;

    const availableSlots = 10 - attachments.length;
    const filesToAdd = selectedFiles.slice(0, availableSlots);
    if (selectedFiles.length > availableSlots) {
      notify('You can attach up to 10 images per ticket.', 'error');
    }

    const validFiles = filesToAdd.filter((file) => {
      if (!file.type.startsWith('image/')) {
        notify(`${file.name} is not an image file.`, 'error');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        notify(`${file.name} is larger than the 5 MB per-file limit.`, 'error');
        return false;
      }
      return true;
    });

    const loadedAttachments = await Promise.all(
      validFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: reader.result
              });
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          })
      )
    );

    setAttachments((current) => [
      ...current,
      ...loadedAttachments.filter(Boolean)
    ]);
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const submit = (e) => {
    e.preventDefault();
    const subject = form.subject.trim();
    const description = form.description.trim();

    if (subject.length < 5 || subject.length > 120) {
      notify('Subject must be between 5 and 120 characters.', 'error');
      return;
    }

    if (description.length < 15 || description.length > 4000) {
      notify('Description must contain at least 15 characters of detail.', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const now = new Date().toISOString();
      const ticketId = `TKT-${Math.floor(1000 + Math.random() * 8999)}`;

      const newTicket = {
        id: ticketId,
        owner: session.email,
        ownerName: session.name,
        subject,
        category: form.category,
        priority: form.priority,
        description,
        platform: form.platform.trim() || 'Not specified',
        attachment: attachments[0] || null,
        attachments,
        status: 'Pending',
        createdAt: now,
        updatedAt: now,
        assignee: 'Support Desk Queue',
        statusHistory: [
          {
            from: null,
            to: 'Pending',
            changedAt: now,
            changedBy: session.name
          }
        ]
      };

      const newNotification = {
        id: `note-${Date.now()}`,
        owner: session.email,
        title: `Ticket ${ticketId} Submitted`,
        message: `Your request "${subject}" has been queued for IT review.`,
        date: now,
        read: false,
        ticketId
      };

      // Notify admin about new incoming ticket
      const adminNotification = {
        id: `note-${Date.now() + 1}`,
        owner: 'admin',
        title: `New Ticket ${ticketId} Received`,
        message: `${session.name} submitted: "${subject}"`,
        date: now,
        read: false,
        ticketId
      };

      updateData('tickets', [newTicket, ...data.tickets]);
      updateData('notifications', [adminNotification, newNotification, ...data.notifications]);

      setLoading(false);
      notify(`Ticket ${ticketId} created successfully.`);
      setView('tickets', { ticketId });
    }, 600);
  };

  return (
    <div className="page-container ticket-form-page">
      <button
        type="button"
        className="back-button"
        onClick={() => setView('dashboard')}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <PageHeader
        eyebrow="Open a Support Request"
        title="Submit a Technical Ticket"
        description="Describe the technical issue you're facing. Our support engineers review and respond directly inside the portal."
      />

      <form className="panel form-panel" onSubmit={submit}>
        <div className="form-section-header">
          <div>
            <h2 className="section-title">Issue Details</h2>
            <p className="section-subtitle">Please provide clear context so we can resolve this faster.</p>
          </div>
          <span className="required-indicator">* Required fields</span>
        </div>

        <div className="form-grid-layout">
          <label className="field full-width">
            <span className="field-label">
              Subject Summary <i className="text-danger">*</i>
            </span>
            <input
              required
              minLength={5}
              maxLength={120}
              name="subject"
              value={form.subject}
              onChange={update}
              placeholder="e.g. Cannot submit Studium CAT Module 3 or White Screen on Chrome"
            />
          </label>

          <label className="field">
            <span className="field-label">
              Category <i className="text-danger">*</i>
            </span>
            <select name="category" value={form.category} onChange={update}>
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">
              Priority Level <i className="text-danger">*</i>
            </span>
            <select name="priority" value={form.priority} onChange={update}>
              <option value="Normal">Normal — Standard study inquiry</option>
              <option value="High">High — Exam blocked / Account lockout</option>
              <option value="Low">Low — Minor display question</option>
            </select>
          </label>

          <label className="field full-width">
            <span className="field-label">Operating System / Browser / Device</span>
            <div className="field-control">
              <Monitor size={17} className="field-icon" />
              <input
                name="platform"
                value={form.platform}
                onChange={update}
                placeholder="e.g. Windows 11 Chrome v128, MacBook Pro Safari, iPad iOS 17"
              />
            </div>
          </label>

          <label className="field full-width">
            <span className="field-label">
              Detailed Description <i className="text-danger">*</i>
            </span>
            <textarea
              required
              minLength={15}
              maxLength={4000}
              rows={6}
              name="description"
              value={form.description}
              onChange={update}
              placeholder="1. What were you trying to do?&#10;2. What error message appeared?&#10;3. What troubleshooting steps have you already tried?"
            />
          </label>

          <div className="field full-width">
            <span className="field-label">
              Screenshots or Error Logs (Optional, up to 10 images, max 5 MB each)
            </span>
            <div className="attachment-dropzone">
              {!attachments.length ? (
                <label className="dropzone-label">
                  <Upload size={24} className="dropzone-icon" />
                  <span className="dropzone-text">Click or drag images here</span>
                  <span className="dropzone-hint">PNG, JPG, JPEG, WebP, up to 10 files</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="attachments-preview-grid">
                  {attachments.map((attachment, index) => (
                    <div className="attachment-preview-box" key={`${attachment.name}-${index}`}>
                      <img src={attachment.dataUrl} alt={`${attachment.name} preview`} className="preview-img" />
                      <div className="preview-info">
                        <span className="preview-name">{attachment.name}</span>
                        <span className="preview-size">
                          {Math.round(attachment.size / 1024)} KB
                        </span>
                        <button
                          type="button"
                          className="button button-sm button-secondary"
                          onClick={() => removeAttachment(index)}
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {attachments.length < 10 && (
                    <label className="button button-sm button-secondary add-attachment-button">
                      <Upload size={14} /> Add images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  )}
                  </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-action-bar">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setView('dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Submitting Request...
              </>
            ) : (
              <>
                <Send size={16} /> Submit Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
