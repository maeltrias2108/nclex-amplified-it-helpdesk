import React from 'react';
import { Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export function Appearance({ theme, setTheme }) {
  const options = [
    {
      id: 'light',
      label: 'Light Mode',
      desc: 'Clean, high-contrast daytime interface',
      icon: Sun
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      desc: 'Soft slate & zinc theme for low-light study sessions',
      icon: Moon
    },
    {
      id: 'system',
      label: 'System Sync',
      desc: 'Automatically follows your operating system preference',
      icon: Monitor
    }
  ];

  return (
    <div className="page-container appearance-page">
      <PageHeader
        eyebrow="Display Preferences"
        title="Theme &amp; Appearance"
        description="Select the interface mode that offers maximum comfort during long study sessions."
      />

      <section className="panel appearance-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">Visual Theme</span>
            <h2 className="panel-title">Choose Your Color Mode</h2>
          </div>
        </div>

        <div className="theme-selection-grid">
          {options.map(({ id, label, desc, icon: Icon }) => {
            const isSelected = theme === id;
            return (
              <button
                key={id}
                type="button"
                className={`theme-option-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setTheme(id)}
              >
                <div className="theme-option-icon-box">
                  <Icon size={24} />
                </div>
                <div className="theme-option-text">
                  <strong className="theme-label">{label}</strong>
                  <p className="theme-desc">{desc}</p>
                </div>
                {isSelected && <CheckCircle2 size={20} className="theme-check-icon text-primary" />}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function Contact({ setView }) {
  return (
    <div className="page-container contact-page">
      <PageHeader
        eyebrow="Need Assistance?"
        title="Contact Technical Support"
        description="Our IT specialists are on standby to help you resolve technical barriers."
      />

      <div className="contact-grid-layout">
        <section className="panel contact-hero-panel">
          <div className="contact-hero-content">
            <span className="hero-eyebrow">Fastest Resolution</span>
            <h2>Submit a Ticket Directly</h2>
            <p>
              Submitting a support ticket ensures your issue is logged with device context, prioritized by our technicians, and tracked in real-time.
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setView('submit-ticket')}
            >
              Open a Support Ticket &rarr;
            </button>
          </div>
        </section>

        <section className="panel contact-channels-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Channels</span>
              <h2 className="panel-title">Support Methods</h2>
            </div>
          </div>

          <div className="channel-item">
            <strong>Self-Service Knowledge Base</strong>
            <p>Search over 50+ articles for immediate answers to common portal and password problems.</p>
            <button type="button" className="link-button" onClick={() => setView('knowledge')}>
              Search Guides &rarr;
            </button>
          </div>

          <div className="channel-item">
            <strong>System FAQs</strong>
            <p>Quick answers regarding exam access, platform compatibility, and account requirements.</p>
            <button type="button" className="link-button" onClick={() => setView('faq')}>
              Read FAQs &rarr;
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export function About() {
  return (
    <div className="page-container about-page">
      <PageHeader
        eyebrow="About the System"
        title="NCLEX Amplified IT HelpDesk"
        description="Dedicated digital infrastructure engineered for nursing students and educators."
      />

      <section className="panel about-hero-panel">
        <blockquote className="about-quote">
          “Clear answers and reliable systems empower students to focus on what matters most: mastering nursing knowledge.”
        </blockquote>

        <div className="about-body">
          <p>
            The NCLEX Amplified IT HelpDesk &amp; Knowledge Base System is an enterprise-grade academic support portal. It bridges self-service documentation, real-time maintenance updates, and rapid ticket workflows into one unified workspace.
          </p>
          <p>
            Whether preparing for NCLEX CAT assessments, attending live lectures via Zoom, or accessing digital study decks, our mission is to eliminate technology friction throughout your academic journey.
          </p>
          <p>
            The portal brings practical self-service guidance together with a dependable support queue. Students can search published guides, review frequently asked questions, follow system announcements, and submit technical requests without leaving their study workspace.
          </p>
          <p>
            Every support ticket is organized by priority and status so students can follow progress from the first report through resolution. Clear updates, useful device details, and direct technician responses help the support team spend less time gathering context and more time solving the issue.
          </p>
          <p>
            Account settings are designed to keep students in control of their personal information and portal access. Students can update their profile details, choose their display preference, and deactivate or delete their local student account when they no longer need access.
          </p>
          <p>
            We continue improving the HelpDesk around accessibility, privacy, and reliable academic support. For urgent access problems or questions that are not covered in the knowledge resources, contact the IT team through a new support ticket.
          </p>
        </div>
      </section>
    </div>
  );
}
