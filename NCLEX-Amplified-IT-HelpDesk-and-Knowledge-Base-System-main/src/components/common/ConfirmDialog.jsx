import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export function ConfirmDialog({ title, text, action, confirmLabel = 'Confirm', isDanger = true, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="confirm-icon-wrap">
            <AlertCircle size={24} className="text-danger" />
          </div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-text">{text}</p>
        </div>
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`button ${isDanger ? 'button-danger' : 'button-primary'}`}
            onClick={action}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
