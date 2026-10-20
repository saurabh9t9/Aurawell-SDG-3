import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  HeartPulse,
  Leaf,
  MessageCircleHeart,
  NotebookTabs,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { INITIAL_HEALTH_LEDGER, CheckInLogEntry } from './data/sdg3Data';
import { WellnessAgentView } from './components/WellnessAgentView';
import { SymptomTriageView } from './components/SymptomTriageView';
import { HealthLedgerView } from './components/HealthLedgerView';

type ActiveTab = 'wellness_agent' | 'symptom_triage' | 'health_ledger';

const NAV_ITEMS: {
  id: ActiveTab;
  label: string;
  icon: typeof MessageCircleHeart;
}[] = [
  { id: 'wellness_agent', label: 'Wellness check-in', icon: MessageCircleHeart },
  { id: 'symptom_triage', label: 'Symptom guide', icon: Activity },
  { id: 'health_ledger', label: 'Health journal', icon: NotebookTabs },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('wellness_agent');
  const [ledgerEntries, setLedgerEntries] = useState<CheckInLogEntry[]>(
    INITIAL_HEALTH_LEDGER
  );

  const handleAddLedgerEntry = (entry: CheckInLogEntry) => {
    setLedgerEntries((prev) => [entry, ...prev]);
  };

  const handleDeleteLedgerEntry = (id: string) => {
    setLedgerEntries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="app-shell min-h-screen flex flex-col text-slate-900">
      <header className="app-header no-print">
        <div className="app-header-inner">
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              setActiveTab('wellness_agent');
            }}
            className="brand-lockup"
            aria-label="AuraWell home"
          >
            <span className="brand-mark" aria-hidden="true">
              <HeartPulse className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="brand-name">aura<span>well</span></span>
          </a>

          <nav className="primary-nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`nav-link${activeTab === id ? ' is-active' : ''}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="header-note">
            <span className="header-note-icon" aria-hidden="true">
              <Leaf className="h-4 w-4" />
            </span>
            <span>A little space for you</span>
          </div>
        </div>
      </header>

      <main id="top" className="app-main flex-1">
        <section className="welcome-panel" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <div className="eyebrow">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              <span>YOUR WELLBEING, YOUR WAY</span>
            </div>
            <h1 id="welcome-title">Care that meets you <span>where you are.</span></h1>
            <p>
              Take a breath, check in with yourself, and find a next step that
              feels right for you.
            </p>
            <div className="welcome-meta">
              <span className="meta-status" aria-hidden="true" />
              A supportive space to pause and reflect
            </div>
          </div>

          <div className="welcome-art" aria-hidden="true">
            <div className="orbit orbit-outer" />
            <div className="orbit orbit-inner" />
            <div className="wellness-sun">
              <HeartPulse className="h-10 w-10" strokeWidth={1.4} />
            </div>
            <div className="art-note art-note-top">
              <span className="art-note-icon"><Sparkles className="h-3.5 w-3.5" /></span>
              Small steps count
            </div>
            <div className="art-note art-note-bottom">
              <span className="art-note-icon art-note-icon-light"><Leaf className="h-3.5 w-3.5" /></span>
              Take it at your pace
            </div>
          </div>

          <div className="welcome-footer">
            <div className="welcome-footer-note">
              <span className="trust-icon" aria-hidden="true">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span>Thoughtful tools, not a substitute for professional care</span>
            </div>
            <div className="cohort-count">
              <span className="count-value">{String(ledgerEntries.length).padStart(2, '0')}</span>
              <span>check-ins<br />in your journal</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </div>
          </div>
        </section>

        <div className="workspace-heading">
          <div>
            <div className="section-kicker">YOUR WELLNESS SPACE</div>
            <h2>
              {activeTab === 'wellness_agent'
                ? 'A moment for you'
                : activeTab === 'symptom_triage'
                ? 'Listen to what your body is telling you'
                : 'Your check-in journal'}
            </h2>
          </div>
          <div className="workspace-caption">
            <span className="workspace-caption-dot" />
            <span>
              {activeTab === 'health_ledger'
                ? 'Anonymized check-in records'
                : 'A gentle place to begin'}
            </span>
          </div>
        </div>

        <div className="workspace-frame">
          {activeTab === 'wellness_agent' && (
            <WellnessAgentView
              onAddLedgerEntry={handleAddLedgerEntry}
              onNavigateToLedger={() => setActiveTab('health_ledger')}
            />
          )}

          {activeTab === 'symptom_triage' && (
            <SymptomTriageView
              onAddLedgerEntry={handleAddLedgerEntry}
              onNavigateToLedger={() => setActiveTab('health_ledger')}
            />
          )}

          {activeTab === 'health_ledger' && (
            <HealthLedgerView
              entries={ledgerEntries}
              onAddEntry={handleAddLedgerEntry}
              onDeleteEntry={handleDeleteLedgerEntry}
            />
          )}
        </div>
      </main>

      <footer className="app-footer no-print">
        <div className="footer-inner">
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              setActiveTab('wellness_agent');
            }}
            className="footer-brand"
          >
            <HeartPulse aria-hidden="true" className="h-4 w-4" />
            aurawell
          </a>
          <span>Made for the moments that matter.</span>
          <span className="footer-disclaimer">Wellness support · Not a diagnosis</span>
        </div>
      </footer>
    </div>
  );
}
