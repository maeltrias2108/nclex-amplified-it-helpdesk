import React, { useState } from 'react';
import { Search, Ticket, Clock3, Settings, ShieldCheck, ArrowRight, ArrowLeft, List, BookOpen, CircleHelp, Bell, UserRound } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export function Manual({ setView }) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [readAll, setReadAll] = useState(false);

  const steps = [
    {
      num: '01',
      title: 'Use the Knowledge Base',
      text: 'Start with the Knowledge Base when you need a quick solution. Search by keywords, symptoms, or topics, then narrow the results with the category cards for account access, Studium CAT and QBanks, learning materials, Zoom, playback, uploads, registration, subscriptions, email, and technical support.',
      icon: Search,
      action: () => setView('knowledge'),
      actionLabel: 'Search Guides'
    },
    {
      num: '02',
      title: 'Find Answers in the FAQs',
      text: 'Open FAQs for direct answers to recurring technical questions. Search the questions, select a category, and expand an item to read its answer. Use the FAQ guidance before opening a ticket when the issue is a common account, platform, or access question.',
      icon: CircleHelp,
      action: () => setView('faq'),
      actionLabel: 'Read FAQs'
    },
    {
      num: '03',
      title: 'Check Announcements',
      text: 'Review System Announcements for maintenance windows, service interruptions, academic notices, and other portal updates. Search announcements when you want to confirm whether a problem is already known by the support team.',
      icon: Bell,
      action: () => setView('announcements'),
      actionLabel: 'View Announcements'
    },
    {
      num: '04',
      title: 'Submit a Structured Ticket',
      text: 'When self-service resources do not resolve the issue, submit a ticket with a clear subject, category, priority, device or browser details, and a detailed description. Images can be attached to help technicians reproduce the problem faster.',
      icon: Ticket,
      action: () => setView('submit-ticket'),
      actionLabel: 'Open Ticket'
    },
    {
      num: '05',
      title: 'Track Live Progress & Replies',
      text: 'Use Track a Ticket to view every request or filter the list by Pending, In Progress, Resolved, or Closed. Open a ticket to read its timeline, review technician replies, and send additional context when follow-up is needed.',
      icon: Clock3,
      action: () => setView('tickets'),
      actionLabel: 'Track Tickets'
    },
    {
      num: '06',
      title: 'Manage Your Account & Preferences',
      text: 'Open My Account to update your name, Philippine contact number, address, password, and profile photo. Use Display Theme to choose a comfortable light, dark, or system-synced appearance, and keep your account information current for support follow-up.',
      icon: UserRound,
      action: () => setView('profile'),
      actionLabel: 'Open My Account'
    },
    {
      num: '07',
      title: 'Personalize Your Display',
      text: 'Choose light mode, dark mode, or system sync in Display Theme. Your preference is saved for future sessions so the portal remains comfortable during daytime study and low-light review.',
      icon: Settings,
      action: () => setView('appearance'),
      actionLabel: 'Appearance'
    }
  ];

  const openChapter = (index) => {
    setCurrentChapter(index);
    setReadAll(false);
  };

  const visibleSteps = readAll ? steps : [steps[currentChapter]];
  const previousChapter = () => openChapter(Math.max(0, currentChapter - 1));
  const nextChapter = () => openChapter(Math.min(steps.length - 1, currentChapter + 1));

  return (
    <div className="page-container manual-page">
      <PageHeader
        eyebrow="Student Orientation"
        title="HelpDesk User Guide"
        description="A chapter-by-chapter guide to finding answers, following updates, managing tickets, and maintaining your student account."
      />

      <section className="manual-hero-card panel">
        <div className="hero-lead-badge">
          <span>00</span> Quick Start
        </div>
        <div className="hero-lead-content">
          <h2>Getting fast solutions without interrupting your study flow.</h2>
          <p>
            NCLEX Amplified IT HelpDesk brings self-service guides, live notices, and dedicated technical support together into one unified, calm workspace. Whenever you encounter technical difficulties with your learning platform or Zoom lectures, this system ensures you get swift, transparent help.
          </p>
        </div>
      </section>

      <section className="manual-contents panel">
        <div className="manual-contents-heading">
          <div>
            <span className="panel-eyebrow">Contents</span>
            <h2 className="panel-title">Student Manual Chapters</h2>
          </div>
          <button
            type="button"
            className={`button ${readAll ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setReadAll(true)}
          >
            <BookOpen size={16} /> Read All
          </button>
        </div>
        <nav className="manual-contents-list" aria-label="Student manual table of contents">
          {steps.map(({ num, title }, index) => (
            <button
              type="button"
              className={`manual-contents-link ${!readAll && currentChapter === index ? 'is-active' : ''}`}
              key={num}
              onClick={() => openChapter(index)}
            >
              <span>{num}</span>
              {title}
              <ArrowRight size={14} />
            </button>
          ))}
        </nav>
      </section>

      <div className={`manual-steps-grid ${readAll ? '' : 'manual-single-chapter'}`}>
        {visibleSteps.map(({ num, title, text, icon: Icon, action, actionLabel }) => (
          <article className="manual-step-card panel" key={num}>
            <div className="step-card-top">
              <span className="step-number">{num}</span>
              <div className="step-icon-wrap">
                <Icon size={20} />
              </div>
            </div>
            <h3 className="step-title">{title}</h3>
            <p className="step-text">{text}</p>
            <button type="button" className="link-button" onClick={action}>
              {actionLabel} <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>

      <nav className="manual-pagination" aria-label="Student manual chapter pagination">
        <button
          type="button"
          className="button button-secondary"
          onClick={previousChapter}
          disabled={readAll || currentChapter === 0}
        >
          <ArrowLeft size={16} /> Previous
        </button>
        <div className="manual-page-numbers">
          <button
            type="button"
            className={`manual-page-number ${readAll ? 'is-active' : ''}`}
            onClick={() => setReadAll(true)}
          >
            <List size={14} /> All
          </button>
          {steps.map(({ num }, index) => (
            <button
              type="button"
              className={`manual-page-number ${!readAll && currentChapter === index ? 'is-active' : ''}`}
              key={num}
              onClick={() => openChapter(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="button button-secondary"
          onClick={nextChapter}
          disabled={readAll || currentChapter === steps.length - 1}
        >
          Next <ArrowRight size={16} />
        </button>
      </nav>

      <div className="manual-security-panel">
        <ShieldCheck size={24} className="security-icon" />
        <div className="security-text">
          <strong>Academic Security Policy</strong>
          <p>
            NCLEX Amplified IT Staff will never ask for your password. Always verify that you are logging in through the official domain and keep two-factor verification enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
