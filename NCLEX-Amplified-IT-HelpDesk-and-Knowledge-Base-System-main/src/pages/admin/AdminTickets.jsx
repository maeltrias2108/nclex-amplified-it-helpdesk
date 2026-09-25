import React, { useState } from 'react';
import { Ticket, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { EmptyState } from '../../components/common/EmptyState';

export function AdminTickets({ data, setView, selected }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(selected?.adminTicketStatus || 'All statuses');

  const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];

  const filtered = data.tickets.filter((ticket) => {
    const matchesStatus = statusFilter === 'All statuses'
      || (statusFilter === 'Resolved / Closed' && ['Resolved', 'Closed'].includes(ticket.status))
      || ticket.status === statusFilter;
    const searchString = `${ticket.id} ${ticket.subject} ${ticket.ownerName} ${ticket.owner} ${ticket.category}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="page-container admin-tickets-page">
      <PageHeader
        eyebrow="Support Operations"
        title="Ticket Management Queue"
        description="Review incoming student inquiries, update statuses, assign technicians, and provide responses."
      />

      <div className="toolbar-strip">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ticket ID, student name, email, or keywords..."
          onClear={() => setSearchTerm('')}
        />

        <div className="toolbar-filter-group">
          <label htmlFor="admin-ticket-status-filter" className="sr-only">
            Filter status
          </label>
          <select
            id="admin-ticket-status-filter"
            className="select-dropdown"
            value={statusFilter === 'Resolved / Closed' ? 'All statuses' : statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All statuses">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {statusFilter !== 'All statuses' && (
          <button
            type="button"
            className="button button-secondary button-sm"
            onClick={() => setStatusFilter('All statuses')}
          >
            View All Tickets
          </button>
        )}
      </div>

      <section className="panel table-panel">
        <div className="admin-table-header">
          <span className="col-ticket">Request &amp; Category</span>
          <span className="col-student">Student</span>
          <span className="col-status">Status</span>
          <span className="col-action">Action</span>
        </div>

        {filtered.length > 0 ? (
          <div className="admin-table-body">
            {filtered.map((ticket) => (
              <div className="admin-table-row" key={ticket.id}>
                <div className="col-ticket">
                  <button
                    type="button"
                    className="ticket-link-btn"
                    onClick={() => setView('ticket-detail', { ticketId: ticket.id })}
                  >
                    <strong>{ticket.subject}</strong>
                  </button>
                </div>

                <div className="col-student">
                  <span className="student-name">{ticket.ownerName}</span>
                </div>

                <div className="col-status">
                  <span className={`status-pill ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="col-action">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setView('ticket-detail', { ticketId: ticket.id })}
                    aria-label={`Open ticket ${ticket.id}`}
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Ticket size={24} />}
            title={statusFilter === 'All statuses' ? 'No tickets found' : `No ${statusFilter.toLowerCase()} tickets`}
            text="No student support requests match your filter or search query."
            action={statusFilter !== 'All statuses' ? 'View All Tickets' : undefined}
            onAction={statusFilter !== 'All statuses' ? () => setStatusFilter('All statuses') : undefined}
          />
        )}
      </section>
    </div>
  );
}
