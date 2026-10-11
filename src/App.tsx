import React, { useState } from 'react';
import {
  INITIAL_HEALTH_LEDGER,
  CheckInLogEntry,
  LEAN_CANVAS_PRESETS,
  INITIAL_CONCEPT_NOTE,
  PRESENTATION_SLIDES,
} from './data/sdg3Data';
import { WellnessAgentView } from './components/WellnessAgentView';
import { SymptomTriageView } from './components/SymptomTriageView';
import { HealthLedgerView } from './components/HealthLedgerView';
import { LeanCanvasView } from './components/LeanCanvasView';
import { SubmissionKitView } from './components/SubmissionKitView';

type ActiveTab =
  | 'wellness_agent'
  | 'symptom_triage'
  | 'health_ledger'
  | 'lean_canvas'
  | 'submission_kit';

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

  const handleExportFullSubmissionPack = () => {
    const canvas = LEAN_CANVAS_PRESETS.combined;
    const bundle = `# IBM SkillsBuild Masterclass 5 — Complete SDG 3 Project Submission Bundle
**Project:** AuraWell — AI-Powered Youth Mental Wellness & Early Disease Symptom Triage Platform  
**Goal:** UN Sustainable Development Goal 3 (Good Health and Well-being · Targets 3.4 & 3.8)  
**Generated:** October 2026

================================================================================
PART 1: LEAN CANVAS (9-BLOCK ARCHITECTURE)
================================================================================

### 1. Problem
${canvas.problem.map((p) => `- ${p}`).join('\n')}

**Existing Alternatives:**
${canvas.existingAlternatives.map((a) => `- ${a}`).join('\n')}

### 2. Customer Segments
${canvas.customerSegments.map((c) => `- ${c}`).join('\n')}

**Early Adopters:**
${canvas.earlyAdopters.map((e) => `- ${e}`).join('\n')}

### 3. Unique Value Proposition
${canvas.uniqueValueProposition}
**High-Level Concept:** ${canvas.highLevelConcept}

### 4. Solution
${canvas.solution.map((s) => `- ${s}`).join('\n')}

### 5. Channels
${canvas.channels.map((ch) => `- ${ch}`).join('\n')}

### 6. Revenue Streams
${canvas.revenueStreams.map((r) => `- ${r}`).join('\n')}

### 7. Cost Structure
${canvas.costStructure.map((c) => `- ${c}`).join('\n')}

### 8. Key Metrics
${canvas.keyMetrics.map((k) => `- ${k}`).join('\n')}

### 9. Unfair Advantage
${canvas.unfairAdvantage.map((u) => `- ${u}`).join('\n')}

================================================================================
PART 2: PROJECT CONCEPT NOTE
================================================================================

${INITIAL_CONCEPT_NOTE.map(
  (sec) => `### ${sec.number}. ${sec.title}\n${sec.content}`
).join('\n\n')}

================================================================================
PART 3: PRESENTATION SLIDE DECK (8 SLIDES + SPEAKER NOTES)
================================================================================

${PRESENTATION_SLIDES.map(
  (sl) => `### Slide 0${sl.slideNumber}: ${sl.title} (${sl.kicker})
**Core Message:** ${sl.coreMessage}
${sl.bulletPoints.map((b) => `- ${b}`).join('\n')}
**Key Metric:** ${sl.metricHighlight.value} — ${sl.metricHighlight.label}
**Speaker Notes:** ${sl.speakerNotes}`
).join('\n\n---\n\n')}
`;

    const blob = new Blob([bundle], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'IBM_SkillsBuild_SDG3_AuraWell_Submission_Pack.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

        {/* Zone 2: 5 concise single-line text navigation links */}
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
          <a
            href="#lean-canvas"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('lean_canvas');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'lean_canvas'
                ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-emerald-700 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Lean Canvas
          </a>
          <a
            href="#submission-kit"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('submission_kit');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'submission_kit'
                ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-emerald-700 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Submission Kit
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportFullSubmissionPack}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Export Submission Pack
          </button>
        </div>
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
              Youth Mental Wellness Check-In, Early Disease Triage & Lean Canvas Workspace
            </h1>
          </div>

          {/* Segmented Control Switcher (Accessible on both mobile and desktop) */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {[
              { id: 'wellness_agent', label: '01. Mental Wellness Agent' },
              { id: 'symptom_triage', label: '02. Symptom Triage' },
              { id: 'health_ledger', label: '03. Cohort Ledger' },
              { id: 'lean_canvas', label: '04. Lean Canvas PDF' },
              { id: 'submission_kit', label: '05. Concept Note & Deck' },
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

        {activeTab === 'lean_canvas' && <LeanCanvasView />}

        {activeTab === 'submission_kit' && <SubmissionKitView />}
      </main>

      {/* Quiet, Authentic Footer */}
      <footer className="no-print border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1360px] mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800">AuraWell SDG 3</span>
            <span>·</span>
            <span>UN Sustainable Development Goal 3: Good Health and Well-being</span>
            <span>·</span>
            <span>Non-Diagnostic Clinical Decision Support & Masterclass Submission Studio</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('lean_canvas')}
              className="hover:text-slate-900 underline cursor-pointer whitespace-nowrap"
            >
              Lean Canvas PDF
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('submission_kit')}
              className="hover:text-slate-900 underline cursor-pointer whitespace-nowrap"
            >
              Concept Note & Presentation
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
