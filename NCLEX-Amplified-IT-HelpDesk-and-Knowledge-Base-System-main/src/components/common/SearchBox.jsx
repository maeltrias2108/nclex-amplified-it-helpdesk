import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchBox({ value, onChange, placeholder, onClear }) {
  return (
    <div className="search-box">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          aria-label="Clear search input"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
