import React from 'react';
import {
  Inbox,
  Clock3,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  CircleHelp,
  Bell,
  Archive,
  Ticket,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { fmt } from '../../data/seed';

export function AdminDashboard({ setView, data, session }) {
  const pending = data.tickets.filter((t) => t.status === 'Pending').length;
  const inProgress = data.tickets.filter((t) => t.status === 'In Progress').length;
  const resolved = data.tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;
  const total = data.tickets.length;

  const publishedArticles = data.articles.filter((a) => a.published && !a.archived).length;
  const publishedFaqs = data.faqs.filter((f) => f.published && !f.archived).length;
  const publishedAnnouncements = data.announcements.filter((a) => a.published && !a.archived).length;
  const archivedCount =
    data.articles.filter((a) => !a.published || a.archived).length +
    data.faqs.filter((f) => !f.published || f.archived).length +
    data.announcements.filter((a) => !a.published || a.archived).length +
    data.tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;

  return (
    <div className="page-container admin-dashboard-page">
      <PageHeader
        eyebrow="Operations Management"
        title={`Welcome, ${session.name || 'Administrator'}`}
        description="System overview, queue volumes, student tickets, and published knowledge base content."
        action={
          <button
            type="button"
            className="button button-primary"
            onClick={() => setView('admin-tickets')}
          >
            <Ticket size={17} /> Review Support Queue
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card" onClick={() => setView('admin-tickets', { adminTicketStatus: 'All statuses' })} role="button" tabIndex={0}>
          <div className="kpi-top">
            <span className="kpi-label">Total Tickets</span>
            <Inbox size={20} className="kpi-icon text-primary" />
          </div>
          <strong className="kpi-value">{total}</strong>
          <small className="kpi-sub">All logged requests</small>
        </div>

        <div className="admin-kpi-card kpi-amber" onClick={() => setView('admin-tickets', { adminTicketStatus: 'Pending' })} role="button" tabIndex={0}>
          <div className="kpi-top">
            <span className="kpi-label">Pending Review</span>
            <Clock3 size={20} className="kpi-icon text-amber" />
          </div>
          <strong className="kpi-value">{pending}</strong>
          <small className="kpi-sub">Awaiting technician response</small>
        </div>

        <div className="admin-kpi-card kpi-cyan" onClick={() => setView('admin-tickets', { adminTicketStatus: 'In Progress' })} role="button" tabIndex={0}>
          <div className="kpi-top">
            <span className="kpi-label">In Progress</span>
            <RefreshCw size={20} className="kpi-icon text-cyan" />
          </div>
          <strong className="kpi-value">{inProgress}</strong>
          <small className="kpi-sub">Actively being handled</small>
        </div>

        <div className="admin-kpi-card kpi-green" onClick={() => setView('admin-tickets', { adminTicketStatus: 'Resolved / Closed' })} role="button" tabIndex={0}>
          <div className="kpi-top">
            <span className="kpi-label">Resolved / Closed</span>
            <CheckCircle2 size={20} className="kpi-icon text-green" />
          </div>
          <strong className="kpi-value">{resolved}</strong>
          <small className="kpi-sub">Successfully completed</small>
        </div>
      </div>

      <div className="content-grid-two-col admin-dashboard-grid">
        {/* Support Queue Preview */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Work Queue</span>
              <h2 className="panel-title">Active Student Tickets</h2>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={() => setView('admin-tickets', { adminTicketStatus: 'All statuses' })}
            >
              Open Full Queue <ArrowRight size={14} />
            </button>
          </div>

          <div className="dashboard-list">
            {data.tickets.slice(0, 4).map((ticket) => (
              <button
                type="button"
                className="dashboard-ticket-admin-card"
                key={ticket.id}
                onClick={() => setView('ticket-detail', { ticketId: ticket.id })}
              >
                <div className="admin-ticket-row-main">
                  <strong>{ticket.subject}</strong>
                  <small>
                    {ticket.id} &bull; {ticket.ownerName} &bull; {ticket.category}
                  </small>
                </div>
                <div className="admin-ticket-row-meta">
                  <span className={`status-pill ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {ticket.status}
                  </span>
                  <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                  <ArrowRight size={16} className="row-arrow" />
                </div>
              </button>
            ))}
            {!data.tickets.length && (
              <p className="empty-inline-text">No tickets in the queue.</p>
            )}
          </div>
        </section>

        {/* Content Health & Archive */}
        <section className="panel admin-health-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Published Knowledge</span>
              <h2 className="panel-title">Resource Inventory</h2>
            </div>
            <button
              type="button"
              className="button button-sm button-secondary"
              onClick={() => setView('admin-archive')}
            >
              <Archive size={15} /> Central Archive
            </button>
          </div>

          <div className="health-stat-list">
            <button
              type="button"
              className="health-stat-card"
              onClick={() => setView('admin-articles')}
            >
              <div className="health-icon-box">
                <BookOpen size={18} />
              </div>
              <div className="health-info">
                <span>Knowledge Base Guides</span>
                <strong>{publishedArticles} published</strong>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="health-stat-card"
              onClick={() => setView('admin-faqs')}
            >
              <div className="health-icon-box">
                <CircleHelp size={18} />
              </div>
              <div className="health-info">
                <span>System FAQs</span>
                <strong>{publishedFaqs} active</strong>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="health-stat-card"
              onClick={() => setView('admin-announcements')}
            >
              <div className="health-icon-box">
                <Bell size={18} />
              </div>
              <div className="health-info">
                <span>Announcements</span>
                <strong>{publishedAnnouncements} live</strong>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="health-stat-card"
              onClick={() => setView('admin-archive')}
            >
              <div className="health-icon-box">
                <Archive size={18} />
              </div>
              <div className="health-info">
                <span>Archived Records</span>
                <strong>{archivedCount} records</strong>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
