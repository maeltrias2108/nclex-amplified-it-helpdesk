import React from 'react';
import { ArrowRight } from 'lucide-react';

export function EmptyState({ icon, title, text, action, onAction }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3 className="empty-title">{title}</h3>
      {text && <p className="empty-text">{text}</p>}
      {action && onAction && (
        <button type="button" className="button button-primary empty-action-btn" onClick={onAction}>
          {action} <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
