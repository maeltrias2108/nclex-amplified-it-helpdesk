import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose }) {
  const Icon = type === 'error' ? AlertCircle : type === 'info' ? Info : CheckCircle2;
  return (
    <div className={`toast toast-${type}`} role="alert">
      <Icon size={18} className="toast-icon" />
      <span className="toast-msg">{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function Alert({ type = 'info', children, icon }) {
  const Icon = icon || (type === 'error' ? AlertCircle : type === 'success' ? CheckCircle2 : Info);
  return (
    <div className={`alert alert-${type}`} role="status">
      <Icon size={18} className="alert-icon" />
      <div className="alert-content">{children}</div>
    </div>
  );
}
