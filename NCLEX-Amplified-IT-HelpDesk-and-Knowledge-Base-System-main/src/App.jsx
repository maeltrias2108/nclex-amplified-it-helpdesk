import React, { useState, useEffect } from 'react';
import {
  SEED_DATA,
  clone,
  readStore,
  writeStore,
  initials
} from './data/seed';
import {
  firebaseConfigured,
  firebaseListContent,
  firebaseSubscribeStudents,
  firebaseCreateContent,
  firebaseUpdateContent,
  firebaseDeleteContent,
  firebaseSyncStudentProfile,
  firebaseLogout,
  firebaseErrorMessage
} from './firebase';
import { normalizeContentCategories } from './category-config';

// Layout & Common Components
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Toast } from './components/common/Toast';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { AuthScreen } from './components/auth/AuthScreen';

// Student Pages
import { Dashboard } from './pages/student/Dashboard';
import { Knowledge } from './pages/student/Knowledge';
import { ArticleDetail } from './pages/student/ArticleDetail';
import { FAQ } from './pages/student/FAQ';
import { Announcements } from './pages/student/Announcements';
import { AnnouncementDetail } from './pages/student/AnnouncementDetail';
import { TicketForm } from './pages/student/TicketForm';
import { Tickets } from './pages/student/Tickets';
import { TicketDetail } from './pages/student/TicketDetail';
import { Manual } from './pages/student/Manual';
import { Notifications } from './pages/student/Notifications';
import { Profile } from './pages/student/Profile';
import { Appearance, Contact, About } from './pages/student/Appearance';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTickets } from './pages/admin/AdminTickets';
import { AdminStudents } from './pages/admin/AdminStudents';
import { FirestoreContentManager } from './pages/admin/FirestoreContentManager';
import { FirestoreContentEditor } from './pages/admin/FirestoreContentEditor';
import { FirestoreAnnouncementEditor } from './pages/admin/FirestoreAnnouncementEditor';
import { FirestoreArchiveManagement } from './pages/admin/FirestoreArchiveManagement';

function StudentRouter(props) {
  switch (props.view) {
    case 'knowledge':
      return <Knowledge {...props} />;
    case 'article-detail':
      return <ArticleDetail {...props} />;
    case 'faq':
      return <FAQ {...props} />;
    case 'announcements':
      return <Announcements {...props} />;
    case 'announcement-detail':
      return <AnnouncementDetail {...props} />;
    case 'manual':
      return <Manual {...props} />;
    case 'submit-ticket':
      return <TicketForm {...props} />;
    case 'tickets':
      return <Tickets {...props} />;
    case 'ticket-detail':
      return <TicketDetail {...props} />;
    case 'notifications':
      return <Notifications {...props} />;
    case 'profile':
      return <Profile {...props} />;
    case 'appearance':
      return <Appearance {...props} />;
    case 'about':
      return <About {...props} />;
    case 'contact':
      return <Contact {...props} />;
    default:
      return <Dashboard {...props} />;
  }
}

function AdminRouter(props) {
  switch (props.view) {
    case 'article-detail':
      return <ArticleDetail {...props} admin={true} />;
    case 'faq':
      return <FAQ {...props} admin={true} />;
    case 'announcement-detail':
      return <AnnouncementDetail {...props} admin={true} />;
    case 'admin-tickets':
      return <AdminTickets {...props} />;
    case 'ticket-detail':
      return <TicketDetail {...props} admin={true} />;
    case 'admin-notifications':
      return <Notifications {...props} />;
    case 'admin-students':
      return <AdminStudents {...props} />;
    case 'admin-articles':
      return <FirestoreContentManager {...props} type="articles" />;
    case 'admin-article-edit':
      return <FirestoreContentEditor {...props} type="articles" />;
    case 'admin-faqs':
      return <FirestoreContentManager {...props} type="faqs" />;
    case 'admin-faq-edit':
      return <FirestoreContentEditor {...props} type="faqs" />;
    case 'admin-announcements':
      return <FirestoreContentManager {...props} type="announcements" />;
    case 'admin-announcement-edit':
      return <FirestoreAnnouncementEditor {...props} />;
    case 'admin-archive':
      return <FirestoreArchiveManagement {...props} />;
    case 'profile':
      return <Profile {...props} />;
    case 'appearance':
      return <Appearance {...props} />;
    case 'about':
      return <About {...props} />;
    case 'contact':
      return <Contact {...props} />;
    default:
      return <AdminDashboard {...props} />;
  }
}

export function App() {
  const [session, setSession] = useState(() => readStore('nclex-session', null));
  const [view, setView] = useState('dashboard');
  const [authView, setAuthView] = useState('student-login');
  const [theme, setTheme] = useState(() => localStorage.getItem('nclex-theme') || 'light');

  const [data, setData] = useState(() => ({
    articles: readStore('nclex-articles', SEED_DATA.articles),
    faqs: readStore('nclex-faqs', SEED_DATA.faqs),
    announcements: readStore('nclex-announcements', SEED_DATA.announcements),
    tickets: readStore('nclex-tickets', SEED_DATA.tickets),
    notifications: readStore('nclex-notifications', SEED_DATA.notifications),
    messages: readStore('nclex-messages', SEED_DATA.messages),
    students: readStore('nclex-students', SEED_DATA.students)
  }));

  const [contentState, setContentState] = useState({
    loading: false,
    error: null,
    loaded: false
  });

  const [toast, setToast] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readStore('nclex-sidebar-collapsed', false));
  const [selected, setSelected] = useState({
    ticketId: null,
    articleId: null,
    announcementId: null,
    faqId: null,
    articleCategory: null,
    articleQuery: null
  });
  const [confirm, setConfirm] = useState(null);

  // Synchronize theme attribute
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('nclex-theme', theme);
  }, [theme]);

  // Toast auto-dismiss timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    writeStore('nclex-sidebar-collapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Local storage persistence for fallback demo store
  useEffect(() => {
    writeStore('nclex-articles', data.articles);
    writeStore('nclex-faqs', data.faqs);
    writeStore('nclex-announcements', data.announcements);
    writeStore('nclex-tickets', data.tickets);
    writeStore('nclex-notifications', data.notifications);
    writeStore('nclex-messages', data.messages);
    writeStore('nclex-students', data.students);
  }, [
    data.articles,
    data.faqs,
    data.announcements,
    data.tickets,
    data.notifications,
    data.messages,
    data.students
  ]);

  // Load from live Firebase if configured
  useEffect(() => {
    if (!session || !firebaseConfigured) return;
    let active = true;
    setContentState({ loading: true, error: null, loaded: false });

    Promise.all(
      ['articles', 'faqs', 'announcements'].map((type) =>
        firebaseListContent(type, session.role !== 'admin')
      )
    )
      .then(([articles, faqs, announcements]) => {
        if (!active) return;
        setData((current) => ({
          ...current,
          articles: normalizeContentCategories(articles.length ? articles : current.articles),
          faqs: faqs.length
            ? faqs.map((f) => ({ ...f, published: f.published === true }))
            : current.faqs,
          announcements: announcements.length ? announcements : current.announcements
        }));
        setContentState({ loading: false, error: null, loaded: true });
      })
      .catch((error) => {
        if (!active) return;
        setContentState({
          loading: false,
          error: firebaseErrorMessage(error),
          loaded: false
        });
      });

    const unsubscribeStudents = session.role === 'admin'
      ? firebaseSubscribeStudents(
        (students) => {
          if (active) setData((current) => ({ ...current, students }));
        },
        () => {
          if (active) notify('Student accounts could not be synchronized from Firebase.', 'error');
        }
      )
      : null;

    const syncStudentProfile = async () => {
      try {
        const profile = await firebaseSyncStudentProfile();
        if (!active || !profile) return;
        setSession((current) => {
          if (!current || current.role !== 'student') return current;
          const next = {
            ...current,
            name: profile.name || current.name,
            email: profile.email || current.email,
            verified: profile.verified,
            phone: profile.phone || '',
            address: profile.address || ''
          };
          writeStore('nclex-session', next);
          return next;
        });
        setData((current) => ({
          ...current,
          students: current.students.map((student) =>
            student.id === profile.id || student.email?.toLowerCase() === session.email.toLowerCase()
              ? { ...student, ...profile }
              : student
          )
        }));
      } catch (error) {
        if (active) notify(`Student profile could not be synchronized: ${firebaseErrorMessage(error)}`, 'error');
      }
    };

    if (session.role === 'student') {
      syncStudentProfile();
      window.addEventListener('focus', syncStudentProfile);
    }

    return () => {
      active = false;
      unsubscribeStudents?.();
      if (session.role === 'student') window.removeEventListener('focus', syncStudentProfile);
    };
  }, [session?.role]);

  const notify = (message, type = 'success') => setToast({ message, type });

  const updateData = (key, value) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const login = (role, name, email, verified = true, profile = {}) => {
    const nextSession = {
      role,
      name,
      email,
      verified,
      ...(role === 'student' ? { phone: profile.phone || '', address: profile.address || '' } : {})
    };
    setSession(nextSession);
    writeStore('nclex-session', nextSession);

    if (role === 'student' && !data.students.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      setData((current) => ({
        ...current,
        students: [
          ...current.students,
          {
            id: `student-${Date.now()}`,
            name,
            email,
            createdAt: new Date().toISOString(),
            verified,
            active: true
          }
        ]
      }));
    }

    setView(role === 'admin' ? 'admin-dashboard' : 'dashboard');
    notify(`Welcome back, ${name || 'User'}!`);
  };

  const updateSession = (changes) => {
    setSession((current) => {
      const next = { ...current, ...changes };
      writeStore('nclex-session', next);
      return next;
    });
  };

  const performLogout = async () => {
    await firebaseLogout();
    setSession(null);
    localStorage.removeItem('nclex-session');
    setAuthView('student-login');
    setView('dashboard');
    setConfirm(null);
    notify('You have been signed out.');
  };

  const requestLogout = () => {
    setConfirm({
      title: 'Sign Out of HelpDesk?',
      text: 'Are you sure you want to end your active session?',
      confirmLabel: 'Sign Out',
      isDanger: false,
      action: performLogout,
      onClose: () => setConfirm(null)
    });
  };

  const navigate = (nextView, params = {}) => {
    setSelected((current) => ({ ...current, ...params }));
    setView(nextView);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const routeProps = {
    view,
    setView: navigate,
    data,
    updateData,
    notify,
    session,
    updateSession,
    logout: performLogout,
    theme,
    setTheme,
    setConfirm,
    contentState,
    selected,
    createContent: firebaseCreateContent,
    updateContent: firebaseUpdateContent,
    deleteContent: firebaseDeleteContent
  };

  if (!session) {
    return (
      <AuthScreen
        view={authView}
        setView={setAuthView}
        onLogin={login}
        students={data.students}
      />
    );
  }

  const isAdmin = session.role === 'admin';

  return (
    <div className={`app-shell ${isAdmin ? 'admin-shell' : 'student-shell'} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        session={session}
        view={view}
        setView={navigate}
        logout={requestLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        data={data}
      />

      <main className="app-main">
        <Topbar
          session={session}
          setView={navigate}
          setMobileOpen={setMobileOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          data={data}
        />

        <div className="app-main-content">
          <div className="page-content-wrapper">
            {isAdmin ? <AdminRouter {...routeProps} /> : <StudentRouter {...routeProps} />}
          </div>
        </div>

      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog {...confirm} />}
    </div>
  );
}
