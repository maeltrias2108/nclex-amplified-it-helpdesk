import React, { useState } from 'react';
import { CircleHelp, ChevronDown, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { CategoryCards } from '../../components/common/CategoryCards';
import { EmptyState } from '../../components/common/EmptyState';
import { RichTextContent, richTextToPlainText } from '../../components/common/RichTextContent';
import { normalizeCategory } from '../../category-config';

export function FAQ({ data, contentState, selected, admin = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const selectedFaq = data.faqs.find((faq) => faq.id === selected?.faqId);
  const [selectedCategory, setSelectedCategory] = useState(() =>
    selectedFaq ? normalizeCategory(selectedFaq.category) : 'All categories'
  );
  const [openFaqId, setOpenFaqId] = useState(selected?.faqId || null);

  const published = data.faqs.filter(
    (f) => (f.published || (admin && f.id === selected?.faqId)) && !f.archived
  );

  const filtered = published.filter((faq) => {
    const norm = normalizeCategory(faq.category);
    const matchesCategory = selectedCategory === 'All categories' || norm === selectedCategory;
    const searchString = `${faq.question} ${richTextToPlainText(faq.answer)} ${faq.category}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  if (contentState?.loading) {
    return (
      <EmptyState
        icon={<RefreshCw size={24} className="spin-icon" />}
        title="Loading FAQs..."
        text="Synchronizing FAQs with Firestore."
      />
    );
  }

  if (contentState?.error) {
    return (
      <EmptyState
        icon={<AlertCircle size={24} />}
        title="FAQs Unavailable"
        text={contentState.error}
      />
    );
  }

  return (
    <div className="page-container faq-page">
      <PageHeader
        eyebrow="Quick Answers"
        title="Frequently Asked Questions"
        description="Immediate answers to the most common technical questions asked by NCLEX Amplified students."
      />

      <div className="content-search-bar">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search questions by keywords..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      <CategoryCards
        selected={selectedCategory}
        onSelect={(cat) => {
          setSelectedCategory(cat);
          setOpenFaqId(null);
        }}
      />

      <div className="section-meta-bar">
        <span className="section-label">
          {selectedCategory === 'All categories' ? 'All Questions' : selectedCategory}
        </span>
        <span className="section-count-tag">
          {filtered.length} {filtered.length === 1 ? 'question' : 'questions'}
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="faq-accordion-list">
          {filtered.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div className={`faq-accordion-card ${isOpen ? 'is-open' : ''}`} key={faq.id}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <div className="faq-question-left">
                    <span className="faq-question-text">{faq.question}</span>
                  </div>
                  <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'rotated' : ''}`} />
                </button>

                {isOpen && (
                  <div className="faq-answer-content">
                    <RichTextContent content={faq.answer} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<CircleHelp size={24} />}
          title="No FAQs found"
          text="Try typing a different keyword or selecting 'All Categories'."
        />
      )}
    </div>
  );
}
