import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowLeft, ArrowRight, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { normalizeCategory } from '../../category-config';
import { fmt, readStore, writeStore } from '../../data/seed';

export function ArticleDetail({ setView, data, selected, admin = false }) {
  const article = data.articles.find(
    (item) => item.id === selected.articleId && (item.published || admin) && !item.archived
  );

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setFeedback(null);
  }, [selected?.articleId]);

  if (!article) {
    return (
      <EmptyState
        title="Guide Not Found"
        text="This article might have been archived or removed."
        action="Back to Knowledge Base"
        onAction={() => setView('knowledge')}
      />
    );
  }

  const contextCategory =
    selected.articleCategory && selected.articleCategory !== 'All categories'
      ? selected.articleCategory
      : 'All categories';
  const contextQuery = selected.articleQuery || '';

  const visibleList = data.articles.filter((item) => {
    const norm = normalizeCategory(item.category);
    return (
      item.published &&
      !item.archived &&
      (contextCategory === 'All categories' || norm === contextCategory) &&
      `${item.title} ${item.summary} ${item.content}`.toLowerCase().includes(contextQuery.toLowerCase())
    );
  });

  const currentIndex = visibleList.findIndex((item) => item.id === article.id);
  const previous = visibleList[currentIndex - 1];
  const next = visibleList[currentIndex + 1];

  const relatedArticles = data.articles
    .filter(
      (item) =>
        item.published &&
        !item.archived &&
        item.id !== article.id &&
        normalizeCategory(item.category) === normalizeCategory(article.category)
    )
    .slice(0, 3);

  const handleFeedback = (val) => {
    const currentFeedback = readStore('nclex-article-feedback', {});
    const updated = { ...currentFeedback, [article.id]: val };
    writeStore('nclex-article-feedback', updated);
    setFeedback(val);
  };

  const navigateToArticle = (targetArticle) => {
    setView('article-detail', {
      articleId: targetArticle.id,
      articleCategory: contextCategory,
      articleQuery: contextQuery
    });
  };

  const backView = admin ? 'admin-articles' : 'knowledge';

  return (
    <div className="page-container article-detail-page">
      <button
        type="button"
        className="back-button"
        onClick={() => setView(backView)}
      >
        <ArrowLeft size={16} /> {admin ? 'Back to Article List' : 'Back to Knowledge Base'}
      </button>

      <PageHeader
        eyebrow={normalizeCategory(article.category)}
        title={article.title}
        description={`Written by ${article.author || 'IT Support Team'} &bull; Last updated on ${fmt(
          article.updatedAt
        )}`}
      />

      <article className="panel article-body-panel">
        <div className="article-lead-summary">
          <p>{article.summary}</p>
        </div>

        <div className="article-main-text">
          {article.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {!admin && <div className="article-feedback-card">
          <div className="feedback-question">
            <strong>Was this guide helpful?</strong>
            <span>Your feedback helps us refine our support documentation.</span>
          </div>

          <div className="feedback-buttons">
            <button
              type="button"
              className={`button ${feedback === 'yes' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => handleFeedback('yes')}
            >
              <ThumbsUp size={16} /> Yes, it helped
            </button>
            <button
              type="button"
              className={`button ${feedback === 'no' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => handleFeedback('no')}
            >
              <ThumbsDown size={16} /> No, I still need help
            </button>
          </div>

          {feedback && (
            <div className="feedback-thankyou">
              <Check size={16} /> Thank you for your feedback!
            </div>
          )}
        </div>}
      </article>

      <div className="article-pagination-bar">
        {previous ? (
          <button
            type="button"
            className="pagination-card pagination-prev"
            onClick={() => navigateToArticle(previous)}
          >
            <ArrowLeft size={18} />
            <div>
              <small>Previous Article</small>
              <strong>{previous.title}</strong>
            </div>
          </button>
        ) : (
          <div />
        )}

        {next && (
          <button
            type="button"
            className="pagination-card pagination-next"
            onClick={() => navigateToArticle(next)}
          >
            <div>
              <small>Next Article</small>
              <strong>{next.title}</strong>
            </div>
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      {relatedArticles.length > 0 && (
        <section className="related-articles-section">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Related Resources</span>
              <h2 className="panel-title">More in {normalizeCategory(article.category)}</h2>
            </div>
          </div>

          <div className="article-card-grid">
            {relatedArticles.map((item) => (
              <article className="article-card" key={item.id}>
                <h3 className="article-card-title">{item.title}</h3>
                <p className="article-card-summary">{item.summary}</p>
                <div className="article-card-footer">
                  <span className="article-date">Updated {fmt(item.updatedAt)}</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigateToArticle(item)}
                  >
                    Read Guide <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
