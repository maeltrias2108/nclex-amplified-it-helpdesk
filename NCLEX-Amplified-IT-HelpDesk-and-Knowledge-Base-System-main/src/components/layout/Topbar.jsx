import React from 'react';
import { Menu, Bell, Shield, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { initials } from '../../data/seed';

export function Topbar({ session, setView, setMobileOpen, collapsed, setCollapsed, data }) {
  const isAdmin = session.role === 'admin';
  const unread = data.notifications.filter((n) =>
    isAdmin ? n.owner === 'admin' && !n.read : n.owner === session.email && !n.read
  ).length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className="topbar-sidebar-toggle"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>

        <div className="topbar-brand">
          <img src="/nclex-logo.png" alt="NCLEX Amplified" className="topbar-brand-logo" />
          <strong>{isAdmin ? 'ADMIN' : 'STUDENT'} <span>DASHBOARD</span></strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="admin-status-indicator">
          {isAdmin && <Shield size={14} />}
          <span>{isAdmin ? 'Admin Active' : 'Student Portal'}</span>
        </div>

        <button
          type="button"
          className="topbar-icon-button"
          onClick={() => setView(isAdmin ? 'admin-notifications' : 'notifications')}
          aria-label="View notifications"
        >
          <Bell size={18} />
          {unread > 0 && <span className="notification-dot">{unread}</span>}
        </button>

        <button
          type="button"
          className="topbar-profile-button"
          onClick={() => setView('profile')}
          title="Go to profile"
        >
          <div className="topbar-avatar">
            {session.profilePhoto ? <img src={session.profilePhoto} alt="Profile" className="topbar-avatar-image" /> : initials(session.name)}
          </div>
          <span className="topbar-profile-name">{session.name}</span>
          <ChevronDown size={15} className="topbar-profile-chevron" />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-copy">
          &copy; 2026 NCLEX Amplified IT HelpDesk &amp; Knowledge Base System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
