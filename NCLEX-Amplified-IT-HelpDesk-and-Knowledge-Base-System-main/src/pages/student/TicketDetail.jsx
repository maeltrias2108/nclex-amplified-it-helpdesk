import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  Monitor,
  User,
  Headphones,
  Calendar,
  Clock,
  CheckCircle2,
  Shield,
  Image,
  Lock
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { fmt, fmtTime, initials } from '../../data/seed';

export function TicketDetail({ data, updateData, notify, session, setView, selected, admin = false }) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const ticket = data.tickets.find((t) => t.id === selected?.ticketId) ||
    (admin ? data.tickets[0] : data.tickets.find((t) => t.owner === session.email));

  if (!ticket) {
    return (
      <EmptyState
        title="Ticket Not Found"
        text="This ticket does not exist or has been removed from the system."
        action="Back to Support Queue"
        onAction={() => setView(admin ? 'admin-tickets' : 'tickets')}
      />
    );
  }

  const isLocked = ticket.status === 'Resolved' || ticket.status === 'Closed';
  const thread = data.messages.filter((m) => m.ticketId === ticket.id);
  const ticketAttachments = ticket.attachments?.length
    ? ticket.attachments
    : ticket.attachment
    ? [ticket.attachment]
    : [];

  const handleSendReply = (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;

    setSending(true);

    setTimeout(() => {
      const now = new Date().toISOString();
      const newMessage = {
        id: `msg-${Date.now()}`,
        ticketId: ticket.id,
        author: session.name,
        owner: session.email,
        isSupport: admin,
        body: text,
        createdAt: now
      };

      const updatedTickets = data.tickets.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              updatedAt: now,
              status: admin && t.status === 'Pending' ? 'In Progress' : t.status
            }
          : t
      );

      // Notify the other party
      const notifyRecipient = admin ? ticket.owner : 'admin';
      const newNotification = {
        id: `note-${Date.now()}`,
        owner: notifyRecipient,
        title: `Reply on ${ticket.id}`,
        message: `${session.name} replied: "${text.slice(0, 50)}..."`,
        date: now,
        read: false,
        ticketId: ticket.id
      };

      updateData('messages', [...data.messages, newMessage]);
      updateData('tickets', updatedTickets);
      updateData('notifications', [newNotification, ...data.notifications]);

      setReplyText('');
      setSending(false);
      notify('Your message was added to the ticket thread.');
    }, 400);
  };

  const handleAdminStatusChange = (newStatus) => {
    if (!admin || newStatus === ticket.status) return;

    const now = new Date().toISOString();
    const historyEntry = {
      from: ticket.status,
      to: newStatus,
      changedAt: now,
      changedBy: session.name || 'Administrator'
    };

    const updatedTickets = data.tickets.map((t) =>
      t.id === ticket.id
        ? {
            ...t,
            status: newStatus,
            updatedAt: now,
            statusHistory: [...(t.statusHistory || []), historyEntry]
          }
        : t
    );

    const studentNotification = {
      id: `note-${Date.now()}`,
      owner: ticket.owner,
      title: `${ticket.id} Status Updated`,
      message: `Your ticket status is now "${newStatus}".`,
      date: now,
      read: false,
      ticketId: ticket.id
    };

    updateData('tickets', updatedTickets);
    updateData('notifications', [studentNotification, ...data.notifications]);
    notify(`Ticket ${ticket.id} status changed to ${newStatus}.`);
  };

  return (
    <div className="page-container ticket-detail-page">
      <button
        type="button"
        className="back-button"
        onClick={() => setView(admin ? 'admin-tickets' : 'tickets')}
      >
        <ArrowLeft size={16} /> {admin ? 'Back to Support Queue' : 'Back to My Tickets'}
      </button>

      <PageHeader
        eyebrow={`${ticket.id} &bull; ${ticket.category}`}
        title={ticket.subject}
        description={`Submitted by ${ticket.ownerName || ticket.owner} on ${fmt(ticket.createdAt)}`}
        action={
          <div className="ticket-header-status-actions">
            {admin ? (
              <div className="admin-status-select-wrap">
                <span className="status-label">Status:</span>
                <select
                  className={`status-select-dropdown ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}
                  value={ticket.status}
                  onChange={(e) => handleAdminStatusChange(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            ) : (
              <span className={`status-pill large ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {ticket.status}
              </span>
            )}
          </div>
        }
      />

      <div className="ticket-detail-grid-layout">
        <section className="panel ticket-conversation-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Conversation History</span>
              <h2 className="panel-title">Ticket Activity</h2>
            </div>
          </div>

          <div className="message-thread-list">
            {/* Original Ticket Description Message */}
            <div className="message-bubble message-bubble-student">
              <div className="bubble-header">
                <div className="bubble-author-info">
                  <div className="avatar">{initials(ticket.ownerName || 'Student')}</div>
                  <div>
                    <strong className="author-name">{ticket.ownerName || ticket.owner}</strong>
                    <span className="author-badge">Original Requester</span>
                  </div>
                </div>
                <span className="bubble-time">{fmtTime(ticket.createdAt)}</span>
              </div>

              <div className="bubble-body">
                <p>{ticket.description}</p>
                {ticket.platform && (
                  <div className="device-tag">
                    <Monitor size={14} /> Device: {ticket.platform}
                  </div>
                )}
                {ticketAttachments.length > 0 && (
                  <div className="attachment-chip">
                    <Image size={15} />
                    <span>
                      {ticketAttachments.length === 1
                        ? `Attachment: ${ticketAttachments[0].name}`
                        : `${ticketAttachments.length} image attachments`}
                    </span>
                    <div className="attachment-img-preview attachment-img-preview-grid">
                      {ticketAttachments.map((attachment, index) =>
                        attachment.dataUrl ? (
                          <img
                            key={`${attachment.name}-${index}`}
                            src={attachment.dataUrl}
                            alt={attachment.name}
                          />
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thread Replies */}
            {thread.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble ${
                  msg.isSupport ? 'message-bubble-support' : 'message-bubble-student'
                }`}
              >
                <div className="bubble-header">
                  <div className="bubble-author-info">
                    <div className={`avatar ${msg.isSupport ? 'avatar-support' : ''}`}>
                      {msg.isSupport ? 'IT' : initials(msg.author)}
                    </div>
                    <div>
                      <strong className="author-name">{msg.author}</strong>
                      <span className={`author-badge ${msg.isSupport ? 'badge-support' : ''}`}>
                        {msg.isSupport ? 'Support Technician' : 'Student'}
                      </span>
                    </div>
                  </div>
                  <span className="bubble-time">{fmtTime(msg.createdAt)}</span>
                </div>
                <div className="bubble-body">
                  <p>{msg.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          {!isLocked ? (
            <form className="reply-form-box" onSubmit={handleSendReply}>
              <textarea
                required
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  admin
                    ? 'Type an official support reply or troubleshooting instructions...'
                    : 'Add more details, updates, or reply to the support team...'
                }
              />
              <div className="reply-form-actions">
                <span className="reply-hint">
                  Press Send to post your update to this ticket.
                </span>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={sending || !replyText.trim()}
                >
                  {sending ? (
                    <>
                      <span className="spinner" /> Posting...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Post Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="ticket-closed-banner">
              <Lock size={16} />
              {ticket.status === 'Closed'
                ? 'This ticket has been closed. If you still need help, please submit a new ticket.'
                : 'This ticket has been resolved. If the issue persists, please submit a new ticket.'}
            </div>
          )}
        </section>

        {/* Sidebar Info */}
        <aside className="ticket-meta-sidebar">
          <div className="panel meta-panel">
            <h3 className="sidebar-heading">Ticket Overview</h3>

            <div className="meta-row">
              <span className="meta-label">Ticket ID</span>
              <strong className="meta-value">{ticket.id}</strong>
            </div>

            <div className="meta-row">
              <span className="meta-label">Priority</span>
              <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>
                {ticket.priority}
              </span>
            </div>

            <div className="meta-row">
              <span className="meta-label">Assigned To</span>
              <strong className="meta-value">{ticket.assignee || 'Support Desk'}</strong>
            </div>

            <div className="meta-row">
              <span className="meta-label">Requester Email</span>
              <span className="meta-value-email">{ticket.owner}</span>
            </div>

            <div className="meta-row">
              <span className="meta-label">Created</span>
              <span className="meta-value-date">{fmtTime(ticket.createdAt)}</span>
            </div>

            <div className="meta-row">
              <span className="meta-label">Last Activity</span>
              <span className="meta-value-date">{fmtTime(ticket.updatedAt)}</span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="panel history-panel">
            <h3 className="sidebar-heading">Status History</h3>
            <div className="timeline-list">
              <div className="timeline-item active">
                <div className="timeline-dot" />
                <div className="timeline-info">
                  <strong>{ticket.status}</strong>
                  <small>{fmtTime(ticket.updatedAt)}</small>
                </div>
              </div>

              {ticket.statusHistory &&
                ticket.statusHistory
                  .slice(0)
                  .reverse()
                  .filter((h) => h.to !== ticket.status)
                  .map((history, idx) => (
                    <div className="timeline-item" key={idx}>
                      <div className="timeline-dot dot-prev" />
                      <div className="timeline-info">
                        <span>{history.from || 'Opened'} &rarr; {history.to}</span>
                        <small>{fmtTime(history.changedAt)} by {history.changedBy}</small>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
