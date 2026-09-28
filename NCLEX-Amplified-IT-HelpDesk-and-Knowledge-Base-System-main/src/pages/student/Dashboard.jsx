import React from 'react';
import {
  Sparkles,
  Ticket,
  BookOpen,
  ArrowRight,
  Headphones,
  Wifi,
  Laptop,
  Plus,
  Clock3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { richTextToPlainText } from '../../components/common/RichTextContent';
import { EmptyState } from '../../components/common/EmptyState';
import { fmt, initials } from '../../data/seed';
import { formatManilaDateTime, isAnnouncementActive } from '../../data/announcement-time';
import { useAnnouncementClock } from '../../hooks/useAnnouncementClock';

function timeGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export function Dashboard({ setView, data, session }) {
  const announcementNow = useAnnouncementClock(data.announcements);
  const activeAnnouncements = data.announcements.filter((announcement) => isAnnouncementActive(announcement, announcementNow));
  const userEmail = session.email.toLowerCase();
  const mine = data.tickets.filter((t) => t.owner?.toLowerCase() === userEmail);

  const statuses = [
    { label: 'Pending', icon: Clock3, accent: 'pending' },
    { label: 'In Progress', icon: Sparkles, accent: 'in-progress' },
    { label: 'Resolved', icon: CheckCircle2, accent: 'resolved' },
    { label: 'Closed', icon: AlertCircle, accent: 'closed' }
  ];

  const counts = statuses.map((s) => ({
    ...s,
    count: mine.filter((t) => t.status === s.label).length
  }));

  const firstName = session.name ? session.name.split(' ')[0] : 'Student';

  return (
    <div className="page-container dashboard-page">
      <PageHeader
        eyebrow={timeGreeting()}
        title={`Welcome back, ${firstName}`}
        description="Everything you need to keep your NCLEX study tools and digital systems running smoothly."
        action={
          <button
            type="button"
            className="button button-primary"
            onClick={() => setView('submit-ticket')}
          >
            <Plus size={17} /> Submit a Ticket
          </button>
        }
      />

      <section className="welcome-banner">
        <div className="banner-content">
          <span className="banner-kicker">
            <Sparkles size={15} /> Your Digital Support Hub
          </span>
          <h2 className="banner-heading">Need technical help with your studies?</h2>
          <p className="banner-subtext">
            Search our curated Knowledge Base guides, check portal announcements, or create a trackable support ticket directly with our IT team.
          </p>
          <div className="banner-actions">
            <button
              type="button"
              className="button button-light"
              onClick={() => setView('knowledge')}
            >
              Browse Knowledge Base <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="button button-secondary-glass"
              onClick={() => setView('manual')}
            >
              Student Portal Manual <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="banner-visual">
          <div className="banner-orbit-center">
            <Headphones size={36} />
          </div>
          <div className="floating-badge badge-top">
            <Wifi size={14} /> Network &amp; Zoom
          </div>
          <div className="floating-badge badge-bottom">
            <Laptop size={14} /> Studium CAT &amp; QBanks
          </div>
        </div>
      </section>

      <div className="stats-grid">
        {counts.map(({ label, count, icon: Icon, accent }) => (
          <div
            className={`stat-card stat-${accent}`}
            key={label}
            onClick={() => setView('tickets', { ticketStatus: label })}
            role="button"
            tabIndex={0}
          >
            <div className="stat-card-top">
              <div className="stat-icon-wrap">
                <Icon size={18} />
              </div>
              <span className="stat-status-name">{label}</span>
            </div>
            <div className="stat-card-bottom">
              <span className="stat-number">{count}</span>
              <span className="stat-link-icon">
                <ArrowRight size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid-two-col">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Stay Informed</span>
              <h2 className="panel-title">Latest Announcements</h2>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={() => setView('announcements')}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="dashboard-list">
            {activeAnnouncements.slice(0, 2).map((a) => (
              <button
                type="button"
                className="dashboard-announcement-card"
                key={a.id}
                onClick={() => setView('announcement-detail', { announcementId: a.id })}
              >
                <div className={`priority-pill ${(a.priority || 'Normal').toLowerCase()}`}>
                  {a.priority || 'Normal'}
                </div>
                <div className="announcement-summary-wrap">
                  <strong className="announcement-title">{a.title}</strong>
                  <p className="announcement-snippet">{a.summary || richTextToPlainText(a.content).slice(0, 85)}...</p>
                  <small className="announcement-meta">
                    {formatManilaDateTime(a.publishedAt || a.date)} &bull; {a.publisher || 'IT Support Team'}
                  </small>
                </div>
                <ArrowRight size={16} className="row-arrow" />
              </button>
            ))}
            {!activeAnnouncements.length && (
              <p className="empty-inline-text">No announcements at this time.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Instant Help</span>
              <h2 className="panel-title">Popular Guides</h2>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={() => setView('knowledge')}
            >
              All guides <ArrowRight size={14} />
            </button>
          </div>

          <div className="dashboard-list">
            {data.articles.filter((a) => a.published && !a.archived).slice(0, 3).map((article) => (
              <button
                type="button"
                className="dashboard-article-card"
                key={article.id}
                onClick={() => setView('article-detail', { articleId: article.id })}
              >
                <div className="article-icon-wrap">
                  <BookOpen size={17} />
                </div>
                <div className="article-summary-wrap">
                  <strong className="article-title">{article.title}</strong>
                  <span className="article-category-tag">{article.category}</span>
                </div>
                <ArrowRight size={16} className="row-arrow" />
              </button>
            ))}
            {!data.articles.filter((a) => a.published && !a.archived).length && (
              <p className="empty-inline-text">No articles published yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">Your Support Tickets</span>
            <h2 className="panel-title">Recent Activity</h2>
          </div>
          <button
            type="button"
            className="link-button"
            onClick={() => setView('tickets', { ticketStatus: 'All statuses' })}
          >
            Track all tickets <ArrowRight size={14} />
          </button>
        </div>

        {mine.length ? (
          <div className="ticket-list-grid">
            {mine.slice(0, 3).map((ticket) => (
              <button
                type="button"
                className="ticket-row-card"
                key={ticket.id}
                onClick={() => setView('ticket-detail', { ticketId: ticket.id })}
              >
                <div className="ticket-badge-col">
                  <span className="ticket-id-tag">{ticket.id}</span>
                </div>
                <div className="ticket-main-col">
                  <strong className="ticket-subject">{ticket.subject}</strong>
                  <span className="ticket-sub-meta">
                    {ticket.category} &bull; Updated {fmt(ticket.updatedAt)}
                  </span>
                </div>
                <div className="ticket-status-col">
                  <span className={`status-pill ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {ticket.status}
                  </span>
                  <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
                <ArrowRight size={16} className="row-arrow" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Ticket size={24} />}
            title="No support tickets opened"
            text="When you encounter an issue with your study portal, you can submit a ticket here."
            action="Submit a Ticket"
            onAction={() => setView('submit-ticket')}
          />
        )}
      </section>
    </div>
  );
}
