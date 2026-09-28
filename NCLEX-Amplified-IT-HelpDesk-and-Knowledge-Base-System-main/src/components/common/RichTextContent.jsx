import React from 'react';
import DOMPurify from 'dompurify';

const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'span', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'data-font-size', 'colspan', 'rowspan']
};
export const RICH_TEXT_FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px'];

const FORMATTED_TAG = /<\/?(?:p|br|strong|b|em|i|u|h[1-6]|ul|ol|li|a|blockquote|span|table|thead|tbody|tfoot|tr|th|td|colgroup|col)\b[^>]*>/i;
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
  const fontSize = node.getAttribute('data-font-size');
  if (fontSize && !RICH_TEXT_FONT_SIZES.includes(fontSize)) {
    node.removeAttribute('data-font-size');
  }
});

export function toSafeRichHtml(value) {
  const content = String(value || '');
  if (!content.trim()) return '';
  if (FORMATTED_TAG.test(content)) return DOMPurify.sanitize(content, SANITIZE_OPTIONS);

  return content
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>') || '<br>'}</p>`)
    .join('');
}

export function richTextToPlainText(value) {
  const container = document.createElement('div');
  container.innerHTML = toSafeRichHtml(value);
  return (container.textContent || '').replace(/\s+/g, ' ').trim();
}

export function RichTextContent({ content, className = '' }) {
  return (
    <div
      className={`rich-text-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: toSafeRichHtml(content) }}
    />
  );
}