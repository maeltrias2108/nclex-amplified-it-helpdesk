export const SEED_DATA = {
  articles: [
    {
      id: 'kb-1',
      title: 'Reset your NCLEX Amplified password',
      category: 'Account & Dashboard Access',
      summary: 'Use the secure password reset flow when you can no longer sign in.',
      content: 'Enter the email address connected to your student account on the password reset page. Open the message from NCLEX Amplified, choose a strong password, and sign in again. If the message does not arrive, check your spam folder or submit a ticket to the IT HelpDesk.',
      author: 'IT Support Team',
      published: true,
      archived: false,
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-15T10:30:00.000Z'
    },
    {
      id: 'kb-2',
      title: 'Troubleshoot a slow campus connection',
      category: 'Website, Browser & Network Issues',
      summary: 'A short checklist for getting back to a reliable study connection.',
      content: 'Move closer to your wireless access point, pause large background downloads, and restart your device network adapter. If other websites are also unresponsive, record your current location and time before opening a ticket with support.',
      author: 'IT Support Team',
      published: true,
      archived: false,
      createdAt: '2026-09-05T09:00:00.000Z',
      updatedAt: '2026-09-12T14:15:00.000Z'
    },
    {
      id: 'kb-3',
      title: 'Submitting assignments in your learning platform',
      category: 'Studium CAT & QBanks',
      summary: 'Find the submission controls and confirm that your file was received.',
      content: 'Open the assigned assessment module, verify acceptable file extensions (PDF, DOCX, or PNG), attach your work, and select Submit. Wait for the green confirmation banner before navigating away from the page.',
      author: 'Academic Technology',
      published: true,
      archived: false,
      createdAt: '2026-09-06T11:00:00.000Z',
      updatedAt: '2026-09-08T16:00:00.000Z'
    },
    {
      id: 'kb-4',
      title: 'Student email setup on iOS & Android devices',
      category: 'General Inquiries & Technical Support',
      summary: 'Connect your academic mailbox while keeping account security intact.',
      content: 'Add an Exchange/Outlook account using your official student email address and your portal credentials. Complete two-factor authentication if prompted. Remember: IT staff will never ask for your password.',
      author: 'IT Support Team',
      published: true,
      archived: false,
      createdAt: '2026-08-20T08:00:00.000Z',
      updatedAt: '2026-08-28T09:45:00.000Z'
    }
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'How quickly will my support ticket receive a response?',
      answer: 'Tickets are actively monitored Monday through Saturday. High-priority issues typically receive an initial response within 2 hours, and standard inquiries within 12-24 hours.',
      category: 'General Inquiries & Technical Support',
      published: true,
      archived: false,
      order: 1
    },
    {
      id: 'faq-2',
      question: 'Can I update or attach screenshots to a ticket after submitting?',
      answer: 'Yes! Navigate to "Track a ticket", select your active ticket, and use the conversation box to send follow-up details, additional context, or responses to support technicians.',
      category: 'General Inquiries & Technical Support',
      published: true,
      archived: false,
      order: 2
    },
    {
      id: 'faq-3',
      question: 'What information should I provide when reporting a system bug?',
      answer: 'Please provide the browser or operating system you are using, the exact error message, steps to reproduce the issue, and an optional screenshot. This significantly accelerates resolution time.',
      category: 'Website, Browser & Network Issues',
      published: true,
      archived: false,
      order: 3
    },
    {
      id: 'faq-4',
      question: 'How do I keep my student portal account safe?',
      answer: 'Always use a unique password of at least 8 characters with a combination of uppercase letters, digits, and symbols. Never share your credentials with anyone.',
      category: 'Account & Dashboard Access',
      published: true,
      archived: false,
      order: 4
    }
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Welcome to the NCLEX Amplified IT HelpDesk Portal',
      summary: 'A unified workspace for all student technical support and self-help resources.',
      content: 'We are thrilled to launch the new IT HelpDesk & Knowledge Base System. Browse comprehensive guides, read FAQs, and submit trackable support tickets directly to our tech team.',
      category: 'General Inquiries & Technical Support',
      priority: 'Important',
      published: true,
      archived: false,
      publishedAt: '2026-09-16T08:00:00.000Z',
      expirationDate: '2027-12-31T23:59:59.000Z',
      publisher: 'IT Operations Team'
    },
    {
      id: 'ann-2',
      title: 'Scheduled Maintenance: Studium CAT Database Optimization',
      summary: 'Brief maintenance window scheduled for Sunday morning between 2:00 AM - 4:00 AM EST.',
      content: 'Our core database servers will undergo scheduled maintenance to enhance test rendering speeds and question bank caching. Offline review materials will remain accessible.',
      category: 'Studium CAT & QBanks',
      priority: 'Normal',
      published: true,
      archived: false,
      publishedAt: '2026-09-18T10:00:00.000Z',
      expirationDate: '2027-12-31T23:59:59.000Z',
      publisher: 'Systems Engineering'
    }
  ],
  tickets: [
    {
      id: 'TKT-1048',
      owner: 'demo@student.edu',
      ownerName: 'Jordan Lee',
      subject: 'Cannot access Studium CAT question bank',
      category: 'Studium CAT & QBanks',
      description: 'When clicking "Start Mock Exam" in the Studium portal, the screen freezes at loading indicator with error code ERR_AUTH_SESSION.',
      priority: 'High',
      status: 'In Progress',
      platform: 'Google Chrome on Windows 11',
      createdAt: '2026-09-17T09:30:00.000Z',
      updatedAt: '2026-09-18T14:20:00.000Z',
      assignee: 'Support Desk Lead',
      statusHistory: [
        { from: 'Pending', to: 'In Progress', changedAt: '2026-09-18T10:00:00.000Z', changedBy: 'Support Desk' }
      ]
    },
    {
      id: 'TKT-1039',
      owner: 'demo@student.edu',
      ownerName: 'Jordan Lee',
      subject: 'Email sync verification for mobile device',
      category: 'General Inquiries & Technical Support',
      description: 'I need assistance setting up IMAP/Exchange sync for my student email on Android Samsung Galaxy S23.',
      priority: 'Normal',
      status: 'Resolved',
      platform: 'Android 14',
      createdAt: '2026-09-11T11:00:00.000Z',
      updatedAt: '2026-09-12T15:10:00.000Z',
      assignee: 'Support Desk Lead',
      statusHistory: [
        { from: 'Pending', to: 'In Progress', changedAt: '2026-09-11T14:00:00.000Z', changedBy: 'Support Desk' },
        { from: 'In Progress', to: 'Resolved', changedAt: '2026-09-12T15:10:00.000Z', changedBy: 'Support Desk' }
      ]
    }
  ],
  notifications: [
    {
      id: 'note-1',
      owner: 'demo@student.edu',
      title: 'Ticket TKT-1048 was updated',
      message: 'Support Desk changed status to In Progress.',
      date: '2026-09-18T14:20:00.000Z',
      read: false,
      ticketId: 'TKT-1048'
    },
    {
      id: 'note-2',
      owner: 'demo@student.edu',
      title: 'Welcome to the NCLEX Support Portal',
      message: 'Your student support workspace is configured and ready.',
      date: '2026-09-16T08:00:00.000Z',
      read: true,
      announcementId: 'ann-1'
    }
  ],
  messages: [
    {
      id: 'msg-1',
      ticketId: 'TKT-1048',
      author: 'Support Desk',
      owner: 'admin@nclexamplified.edu',
      isSupport: true,
      body: 'Hello Jordan, we have identified a token refresh delay on the question bank server. Our engineers have deployed a hotfix; could you please log out, clear your browser cache, and try again?',
      createdAt: '2026-09-18T14:20:00.000Z'
    }
  ],
  students: [
    {
      id: 'student-demo-1',
      name: 'Jordan Lee',
      email: 'demo@student.edu',
      verified: true,
      active: true,
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'student-demo-2',
      name: 'Taylor Martinez',
      email: 'taylor@student.edu',
      verified: true,
      active: true,
      createdAt: '2026-09-03T10:15:00.000Z'
    },
    {
      id: 'student-demo-3',
      name: 'Morgan Vance',
      email: 'morgan@student.edu',
      verified: false,
      active: true,
      createdAt: '2026-09-14T12:00:00.000Z'
    }
  ]
};

export const TICKET_CATEGORIES = [
  'Account & Dashboard Access',
  'Studium CAT & QBanks',
  'Learning Materials & Handouts',
  'Classes & Zoom',
  'Video & Playback Issues',
  'Website, Browser & Network Issues',
  'Forms & File Uploads',
  'NCLEX Registration & External Platforms',
  'Pricing & Subscriptions',
  'General Inquiries & Technical Support'
];

export const clone = (val) => JSON.parse(JSON.stringify(val));

export const readStore = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : clone(fallback);
  } catch {
    return clone(fallback);
  }
};

export const writeStore = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Error writing to localStorage for key: ${key}`, err);
  }
};

export const fmt = (date) => {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
  } catch {
    return 'Invalid Date';
  }
};

export const fmtTime = (date) => {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  } catch {
    return 'Invalid Date';
  }
};

export const initials = (name = '') => {
  if (!name) return 'NA';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NA';
};
