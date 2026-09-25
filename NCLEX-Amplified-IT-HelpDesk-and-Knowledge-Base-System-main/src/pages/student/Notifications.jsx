import React, { useState } from 'react';
import { Bell, Check, Trash2, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { fmtTime } from '../../data/seed';

export function Notifications({ data, updateData, session, setView, setConfirm }) {
  const isAdmin = session.role === 'admin';
  const notes = data.notifications.filter((n) =>
    isAdmin ? n.owner === 'admin' : n.owner?.toLowerCase() === session.email.toLowerCase()
  );

  const markAllRead = () => {
    const updated = data.notifications.map((n) =>
      notes.some((item) => item.id === n.id) ? { ...n, read: true } : n
    );
    updateData('notifications', updated);
  };

  const deleteNotification = (id) => {
    updateData(
      'notifications',
      data.notifications.filter((n) => n.id !== id)
    );
  };

  const confirmDeleteNotification = (notification) => {
    setConfirm({
      title: 'Delete this notification?',
      text: 'This removes the notification from your activity stream. Any linked announcement or ticket will remain unchanged.',
      confirmLabel: 'Delete Notification',
      isDanger: true,
      action: () => {
        deleteNotification(notification.id);
        setConfirm(null);
      },
      onClose: () => setConfirm(null)
    });
  };

  const handleOpenNotification = (note) => {
    // Mark as read
    updateData(
      'notifications',
      data.notifications.map((n) => (n.id === note.id ? { ...n, read: true } : n))
    );

    if (note.ticketId) {
      setView(isAdmin ? 'ticket-detail' : 'ticket-detail', { ticketId: note.ticketId });
    } else if (note.announcementId) {
      setView('announcement-detail', { announcementId: note.announcementId });
    }
  };

  const unreadCount = notes.filter((n) => !n.read).length;

  return (
    <div className="page-container notifications-page">
      <PageHeader
        eyebrow="Activity Stream"
        title="Notifications"
        description="Stay updated with replies, status changes, and announcements."
        action={
          notes.length > 0 && unreadCount > 0 ? (
            <button
              type="button"
              className="button button-secondary"
              onClick={markAllRead}
            >
              <Check size={16} /> Mark all as read
            </button>
          ) : null
        }
      />

      <section className="panel notifications-panel">
        {notes.length > 0 ? (
          <div className="notifications-stream">
            {notes.map((n) => (
              <div
                key={n.id}
                className={`notification-item-row ${n.read ? 'is-read' : 'is-unread'}`}
                onClick={() => handleOpenNotification(n)}
                role="button"
                tabIndex={0}
              >
                <div className="notification-icon-col">
                  {n.ticketId ? <MessageSquare size={18} /> : <Bell size={18} />}
                </div>

                <div className="notification-body-col">
                  <div className="notification-title-wrap">
                    <strong className="notification-title">{n.title}</strong>
                    {!n.read && <span className="unread-dot" />}
                  </div>
                  <p className="notification-text">{n.message}</p>
                  <small className="notification-timestamp">{fmtTime(n.date)}</small>
                </div>

                <div className="notification-actions-col">
                  {n.ticketId || n.announcementId ? (
                    <span className="notification-open-badge">
                      Open <ArrowRight size={13} />
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="icon-button notification-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteNotification(n);
                    }}
                    aria-label="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bell size={24} />}
            title="All caught up!"
            text="You have no notifications right now. New ticket replies or announcements will appear here."
          />
        )}
      </section>
    </div>
  );
}
