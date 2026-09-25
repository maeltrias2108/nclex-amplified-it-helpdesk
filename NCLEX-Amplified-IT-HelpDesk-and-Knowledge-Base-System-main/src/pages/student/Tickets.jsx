import React, { useState } from 'react';
import { Ticket, Search, Plus, Filter, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { EmptyState } from '../../components/common/EmptyState';
import { fmt } from '../../data/seed';

export function Tickets({ setView, data, session, selected }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(selected?.ticketStatus || 'All statuses');

  const userEmail = session.email.toLowerCase();
  const myTickets = data.tickets.filter((t) => t.owner?.toLowerCase() === userEmail);

  const filtered = myTickets.filter((ticket) => {
    const matchesStatus = selectedStatus === 'All statuses' || ticket.status === selectedStatus;
    const searchString = `${ticket.id} ${ticket.subject} ${ticket.category} ${ticket.description}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="page-container tickets-page">
      <PageHeader
        eyebrow="Track Your Support"
        title="Your Support Tickets"
        description="View real-time status updates, review technician replies, and track issue resolutions."
        action={
          <button
            type="button"
            className="button button-primary"
            onClick={() => setView('submit-ticket')}
          >
            <Plus size={17} /> New Ticket
          </button>
        }
      />

      <div className="toolbar-strip">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ticket ID (e.g. TKT-1048), subject, or category..."
          onClear={() => setSearchTerm('')}
        />

        <div className="toolbar-filter-group">
          <label htmlFor="student-ticket-status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="student-ticket-status-filter"
            className="select-dropdown"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All statuses">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {selectedStatus !== 'All statuses' && (
          <button
            type="button"
            className="button button-secondary button-sm"
            onClick={() => setSelectedStatus('All statuses')}
          >
            View All Tickets
          </button>
        )}
      </div>

      <section className="panel ticket-table-panel">
        {filtered.length > 0 ? (
          <div className="ticket-list-container">
            {filtered.map((ticket) => (
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
                    {ticket.category} &bull; Submitted {fmt(ticket.createdAt)} &bull; Last updated {fmt(ticket.updatedAt)}
                  </span>
                </div>

                <div className="ticket-status-col">
                  <span className={`status-pill ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {ticket.status}
                  </span>
                  <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </div>

                <ArrowRight size={16} className="row-arrow" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Ticket size={24} />}
            title={selectedStatus === 'All statuses' ? 'No matching tickets' : `No ${selectedStatus.toLowerCase()} tickets`}
            text={
              myTickets.length === 0
                ? "You haven't submitted any support requests yet."
                : selectedStatus === 'All statuses'
                  ? 'No tickets match your filter criteria.'
                  : `You do not have any ${selectedStatus.toLowerCase()} tickets right now.`
            }
            action={
              myTickets.length === 0
                ? 'Submit a Ticket'
                : selectedStatus === 'All statuses'
                  ? undefined
                  : 'View All Tickets'
            }
            onAction={
              myTickets.length === 0
                ? () => setView('submit-ticket')
                : selectedStatus === 'All statuses'
                  ? undefined
                  : () => setSelectedStatus('All statuses')
            }
          />
        )}
      </section>
    </div>
  );
}
