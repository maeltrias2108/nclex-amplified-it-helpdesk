import React from 'react';
import {
  House,
  Ticket,
  BookOpen,
  CircleHelp,
  Bell,
  FileText,
  Plus,
  Inbox,
  Headphones,
  UserCog,
  Archive,
  UserRound,
  Sun,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { initials } from '../../data/seed';

export function Sidebar({ session, view, setView, logout, mobileOpen, setMobileOpen, collapsed, setCollapsed, data }) {
  const isAdmin = session.role === 'admin';

  const adminNav = [
    { id: 'admin-dashboard', label: 'Operations Overview', icon: House },
    { id: 'admin-tickets', label: 'Support Queue', icon: Ticket },
    { id: 'admin-students', label: 'Student Accounts', icon: UserCog },
    { id: 'admin-articles', label: 'Knowledge Base', icon: BookOpen },
    { id: 'admin-faqs', label: 'FAQ Manager', icon: CircleHelp },
    { id: 'admin-announcements', label: 'Announcements', icon: Bell },
    { id: 'admin-archive', label: 'Archived Records', icon: Archive }
  ];

  const studentNav = [
    { id: 'dashboard', label: 'Home', icon: House },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'faq', label: 'FAQs', icon: CircleHelp },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'manual', label: 'Student Manual', icon: FileText },
    { id: 'submit-ticket', label: 'Submit a Ticket', icon: Plus },
    { id: 'tickets', label: 'Track a Ticket', icon: Ticket },
    { id: 'notifications', label: 'Notifications', icon: Inbox },
    { id: 'contact', label: 'Contact Support', icon: Headphones },
    { id: 'about', label: 'About Portal', icon: CircleHelp }
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  const unreadCount = data.notifications.filter(
    (n) => (isAdmin ? n.owner === 'admin' : n.owner === session.email) && !n.read
  ).length;

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src="/nclex-logo.png" alt="NCLEX Amplified" className="brand-logo" />
            <div className="brand-text">
              <span className="brand-title">NCLEX <strong>AMPLIFIED</strong></span>
              <span className="brand-badge">{isAdmin ? 'ADMIN CONSOLE' : 'STUDENT HELPDESK'}</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((current) => !current)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-scroll-content">
          <div className="sidebar-section-label">MAIN WORKSPACE</div>
          <nav className="sidebar-nav">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = view === id || (id === 'admin-articles' && view.startsWith('admin-article')) || (id === 'admin-faqs' && view.startsWith('admin-faq')) || (id === 'admin-announcements' && view.startsWith('admin-announcement'));
              return (
                <button
                  key={id}
                  type="button"
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setView(id)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{label}</span>
                  {(id === 'notifications' || id === 'admin-notifications') && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-nav">
            <button
              type="button"
              className={`nav-item ${view === 'profile' ? 'active' : ''}`}
              onClick={() => setView('profile')}
            >
              <UserRound size={18} className="nav-icon" />
              <span className="nav-label">{isAdmin ? 'Admin Profile' : 'My Account'}</span>
            </button>
            <button
              type="button"
              className={`nav-item ${view === 'appearance' ? 'active' : ''}`}
              onClick={() => setView('appearance')}
            >
              <Sun size={18} className="nav-icon" />
              <span className="nav-label">Display Theme</span>
            </button>
            <button type="button" className="nav-item nav-item-logout" onClick={logout}>
              <LogOut size={18} className="nav-icon text-danger" />
              <span className="nav-label text-danger">Sign Out</span>
            </button>
          </div>

          <div className="sidebar-user-card">
            <div className="user-avatar">
              {session.profilePhoto ? <img src={session.profilePhoto} alt="Profile" className="sidebar-user-avatar-image" /> : initials(session.name)}
            </div>
            <div className="user-info">
              <strong className="user-name">{session.name}</strong>
              <small className="user-role">{isAdmin ? 'System Administrator' : session.email}</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
