import React, { useState } from 'react';
import { INITIAL_HEALTH_LEDGER, CheckInLogEntry } from './data/sdg3Data';
import { WellnessAgentView } from './components/WellnessAgentView';
import { SymptomTriageView } from './components/SymptomTriageView';
import { HealthLedgerView } from './components/HealthLedgerView';

type ActiveTab =
  | 'wellness_agent'
  | 'symptom_triage'
  | 'health_ledger';

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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="no-print bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('wellness_agent');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          AuraWell SDG 3
        </a>

        {/* Zone 2: 3 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#wellness-agent"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('wellness_agent');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'wellness_agent'
                ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-emerald-700 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Wellness Agent
          </a>
          <a
            href="#symptom-triage"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('symptom_triage');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'symptom_triage'
                ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-emerald-700 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Symptom Triage
          </a>
          <a
            href="#health-ledger"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('health_ledger');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'health_ledger'
                ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-emerald-700 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Health Ledger
          </a>
        </nav>
      </header>

      {/* Workspace Context Subheader & Interactive View Switcher */}
      <div className="no-print bg-white border-b border-slate-200/80">
        <div className="max-w-[1360px] mx-auto px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>UN SDG 3: Good Health and Well-being</span>
              <span aria-hidden="true">·</span>
              <span>IBM SkillsBuild Masterclass 5</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {ledgerEntries.length} Active Cohort Screenings
              </span>
            </div>
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              Youth Mental Wellness Check-In & Early Disease Triage Workspace
            </h1>
          </div>

          {/* Segmented Control Switcher (Accessible on both mobile and desktop) */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {[
              { id: 'wellness_agent', label: '01. Mental Wellness Agent' },
              { id: 'symptom_triage', label: '02. Symptom Triage' },
              { id: 'health_ledger', label: '03. Cohort Ledger' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8">
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

      </main>

      {/* Quiet, Authentic Footer */}
      <footer className="no-print border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1360px] mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800">AuraWell SDG 3</span>
            <span>·</span>
            <span>UN Sustainable Development Goal 3: Good Health and Well-being</span>
            <span>·</span>
            <span>Non-Diagnostic Clinical Decision Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
