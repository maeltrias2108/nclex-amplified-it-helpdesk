export const CATEGORY_NAMES = [
  'Account & Dashboard Access',
  'Studium CAT & QBanks',
  'Learning Materials & Handouts',
  'Classes & Zoom',
  'Video & Playback Issues',
  'Website, Browser & Network Issues',
  'Forms & File Uploads',
  'NCLEX Registration & External Platforms',
  'Pricing & Subscriptions',
  'Email & Communication',
  'General Inquiries & Technical Support'
];

export const CATEGORY_ICONS = ['UserRound','BookOpen','FileText','Laptop','Monitor','Wifi','Upload','House','Settings','Mail','CircleHelp'];

const LEGACY_CATEGORY_MAP = {
  'Account and Login Issues': 'Account & Dashboard Access',
  'Account': 'Account & Dashboard Access',
  'Internet and Network': 'Website, Browser & Network Issues',
  'Software and Applications': 'General Inquiries & Technical Support',
  'Hardware and Devices': 'General Inquiries & Technical Support',
  'Learning Platforms': 'Studium CAT & QBanks',
  'Email and Communication': 'Email & Communication',
  'Tickets': 'General Inquiries & Technical Support',
  'Getting help': 'General Inquiries & Technical Support',
  'General IT Support': 'General Inquiries & Technical Support',
  'General Information': 'General Inquiries & Technical Support',
  'Technical Support': 'General Inquiries & Technical Support',
  'School Systems': 'Studium CAT & QBanks',
  'Learning Resources': 'Learning Materials & Handouts'
};

export const normalizeCategory = (category) => CATEGORY_NAMES.includes(category) ? category : LEGACY_CATEGORY_MAP[category] || 'General Inquiries & Technical Support';
export const normalizeContentCategories = (items = []) => items.map((item) => ({ ...item, category: normalizeCategory(item.category) }));
