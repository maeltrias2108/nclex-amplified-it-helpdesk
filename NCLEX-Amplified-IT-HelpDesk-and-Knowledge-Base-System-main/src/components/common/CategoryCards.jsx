import React from 'react';
import {
  LayoutDashboard,
  UserRound,
  BookOpen,
  FileText,
  Laptop,
  Monitor,
  Wifi,
  Upload,
  House,
  Settings,
  Mail,
  CircleHelp
} from 'lucide-react';
import { CATEGORY_NAMES } from '../../category-config';

const ICON_MAP = {
  0: UserRound,
  1: BookOpen,
  2: FileText,
  3: Laptop,
  4: Monitor,
  5: Wifi,
  6: Upload,
  7: House,
  8: Settings,
  9: Mail,
  10: CircleHelp
};

export function CategoryCards({ selected, onSelect }) {
  return (
    <div className="category-card-grid">
      <button
        type="button"
        className={`category-card ${selected === 'All categories' ? 'selected' : ''}`}
        onClick={() => onSelect('All categories')}
      >
        <span className="category-card-icon">
          <LayoutDashboard size={20} />
        </span>
        <div className="category-card-text">
          <strong>All Categories</strong>
          <small>Browse all resources</small>
        </div>
      </button>

      {CATEGORY_NAMES.map((category, index) => {
        const IconComponent = ICON_MAP[index] || CircleHelp;
        const isSelected = selected === category;
        return (
          <button
            type="button"
            className={`category-card ${isSelected ? 'selected' : ''}`}
            key={category}
            onClick={() => onSelect(category)}
          >
            <span className="category-card-icon">
              <IconComponent size={20} />
            </span>
            <div className="category-card-text">
              <strong>{category}</strong>
              <small>Explore topic guides</small>
            </div>
          </button>
        );
      })}
    </div>
  );
}
