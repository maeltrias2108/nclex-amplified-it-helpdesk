import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { CategoryCards } from '../../components/common/CategoryCards';
import { EmptyState } from '../../components/common/EmptyState';
import { richTextToPlainText } from '../../components/common/RichTextContent';
import { normalizeCategory } from '../../category-config';
import { fmt } from '../../data/seed';

export function Knowledge({ setView, data, contentState }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');

  const published = data.articles.filter((a) => a.published && !a.archived);

  const filtered = published.filter((article) => {
    const normCat = normalizeCategory(article.category);
    const matchesCategory = selectedCategory === 'All categories' || normCat === selectedCategory;
    const searchString = `${article.title} ${article.summary} ${richTextToPlainText(article.content)} ${article.category}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (contentState?.loading) {
    return (
      <EmptyState
        icon={<RefreshCw size={24} className="spin-icon" />}
        title="Loading Knowledge Base..."
        text="Synchronizing guides with Firestore."
      />
    );
  }

  if (contentState?.error) {
    return (
      <EmptyState
        icon={<AlertCircle size={24} />}
        title="Knowledge Base Unavailable"
        text={contentState.error}
      />
    );
  }

  return (
    <div className="page-container knowledge-page">
      <PageHeader
        eyebrow="Self-Service Help"
        title="Knowledge Base & Guides"
        description="Find step-by-step solutions for login issues, Studium QBank errors, Zoom setups, and system tools."
      />

      <div className="content-search-bar">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search articles by keywords, issue symptoms, or topics..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      <CategoryCards
        selected={selectedCategory}
        onSelect={(cat) => setSelectedCategory(cat)}
      />

      <div className="section-meta-bar">
        <span className="section-label">
          {selectedCategory === 'All categories' ? 'All Published Guides' : selectedCategory}
        </span>
        <span className="section-count-tag">
          {filtered.length} {filtered.length === 1 ? 'guide' : 'guides'} available
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="article-card-grid">
          {filtered.map((article) => (
            <article className="article-card" key={article.id}>
              <div className="article-card-header">
                <div className="article-card-icon">
                  <BookOpen size={18} />
                </div>
                <span className="category-badge">{normalizeCategory(article.category)}</span>
              </div>
              <h2 className="article-card-title">{article.title}</h2>
              <p className="article-card-summary">{article.summary}</p>
              <div className="article-card-footer">
                <span className="article-date">Updated {fmt(article.updatedAt)}</span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() =>
                    setView('article-detail', {
                      articleId: article.id,
                      articleCategory: selectedCategory,
                      articleQuery: searchTerm
                    })
                  }
                >
                  Read Guide <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Search size={24} />}
          title="No guides match your search"
          text="Try searching with broader terms or choosing 'All Categories'."
        />
      )}
    </div>
  );
}
