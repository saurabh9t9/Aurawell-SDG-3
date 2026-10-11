import React, { useState } from 'react';
import {
  INITIAL_CONCEPT_NOTE,
  PRESENTATION_SLIDES,
  ConceptNoteSection,
  PresentationSlide,
} from '../data/sdg3Data';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Presentation,
  Printer,
  Edit3,
  Check,
} from 'lucide-react';

export const SubmissionKitView: React.FC = () => {
  const [subMode, setSubMode] = useState<'concept_note' | 'presentation'>(
    'concept_note'
  );
  const [sections, setSections] =
    useState<ConceptNoteSection[]>(INITIAL_CONCEPT_NOTE);
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);

  const [slides] = useState<PresentationSlide[]>(PRESENTATION_SLIDES);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);

  const currentSlide = slides[currentSlideIdx] || slides[0];

  const handleUpdateSection = (id: string, newContent: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content: newContent } : s))
    );
  };

  const handleDownloadConceptNote = () => {
    const content = `# IBM SkillsBuild Masterclass 5 — Project Concept Note
## Project Title: AuraWell — AI-Powered Youth Mental Wellness & Early Disease Symptom Triage Platform
**UN Sustainable Development Goal:** SDG 3 — Good Health and Well-being (Targets 3.4 & 3.8)
**Date:** October 2026

---

${sections
  .map(
    (s) => `### ${s.number}. ${s.title}

${s.content}
`
  )
  .join('\n---\n\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SDG3_AuraWell_Concept_Note.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPresentationDeck = () => {
    const mdSlides = `# IBM SkillsBuild Masterclass 5 — Presentation Deck
## AuraWell: AI for UN SDG 3 (Good Health and Well-being)

${slides
  .map(
    (sl) => `---
### Slide ${sl.slideNumber}: ${sl.title}
*${sl.kicker}*

**Core Message:** ${sl.coreMessage}

**Key Highlights:**
${sl.bulletPoints.map((b) => `- ${b}`).join('\n')}

**Key Metric:** ${sl.metricHighlight.value} — ${sl.metricHighlight.label} (${
      sl.metricHighlight.context
    })

**Speaker Notes:**  
> ${sl.speakerNotes}
`
  )
  .join('\n')}`;

    const blob = new Blob([mdSlides], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SDG3_AuraWell_Presentation_Slides.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Deliverable Switcher Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-500">
            IBM SkillsBuild Masterclass 5 Deliverables #2 & #3 · Concept Note & Slide Deck
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Project Concept Note & 8-Slide Presentation Studio
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSubMode('concept_note')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subMode === 'concept_note'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Concept Note Document
            </button>
            <button
              type="button"
              onClick={() => setSubMode('presentation')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subMode === 'presentation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              Presentation Slide Deck (8 Slides)
            </button>
          </div>

          {subMode === 'concept_note' ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditingNote((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isEditingNote ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    Save Edits
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Concept Note
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadConceptNote}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Concept Note (.MD)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Concept Note PDF
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleDownloadPresentationDeck}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export All 8 Slides & Speaker Notes (.MD)
            </button>
          )}
        </div>
      </div>

      {/* Mode 1: Concept Note Document */}
      {subMode === 'concept_note' && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-4xl mx-auto space-y-8">
          <div className="border-b border-slate-200 pb-6 space-y-2">
            <div className="text-xs font-mono text-emerald-800">
              IBM SKILLSBUILD MASTERCLASS 5 · CONCEPT NOTE SUBMISSION
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              AuraWell: AI-Powered Youth Mental Wellness Check-Ins & Early Disease Symptom Triage
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
              <span>Domain: UN SDG 3 (Good Health and Well-being)</span>
              <span>·</span>
              <span>Targets: 3.4 (Mental Health) & 3.8 (Universal Preventive Coverage)</span>
              <span>·</span>
              <span>Architecture: Full-Stack React + Gemini 3.8 Flash + Clinical Rule Engine</span>
            </div>
          </div>

          <div className="space-y-8 divide-y divide-slate-100">
            {sections.map((section) => (
              <section key={section.id} className="pt-6 first:pt-0 space-y-2.5">
                <h3 className="text-base font-semibold text-slate-900">
                  {section.number}. {section.title}
                </h3>
                {isEditingNote ? (
                  <textarea
                    rows={6}
                    value={section.content}
                    onChange={(e) =>
                      handleUpdateSection(section.id, e.target.value)
                    }
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 leading-relaxed"
                  />
                ) : (
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: 8-Slide Presentation Deck Studio */}
      {subMode === 'presentation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Slide Thumbnail Rail (Left 3 Cols) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
              Slide Deck Outline (8 Slides)
            </div>
            {slides.map((sl, idx) => {
              const active = idx === currentSlideIdx;
              return (
                <button
                  key={sl.slideNumber}
                  type="button"
                  onClick={() => setCurrentSlideIdx(idx)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono opacity-75">
                    <span>Slide 0{sl.slideNumber}</span>
                  </div>
                  <div className="text-xs font-medium truncate mt-0.5">
                    {sl.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Slide Stage + Speaker Notes (Right 9 Cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 16:9 Presentation Stage */}
            <div className="bg-slate-900 text-white rounded-xl p-8 sm:p-10 border border-slate-800 min-h-[420px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span>{currentSlide.kicker}</span>
                  <span>
                    SLIDE 0{currentSlide.slideNumber} / 0{slides.length}
                  </span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-white max-w-3xl"
                  style={{ textWrap: 'balance' }}
                >
                  {currentSlide.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                  {currentSlide.coreMessage}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-8 mt-8 border-t border-slate-800">
                <div className="md:col-span-8 space-y-2.5">
                  {currentSlide.bulletPoints.map((bp, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
                    >
                      <span className="font-mono text-emerald-400 font-semibold">
                        0{i + 1}.
                      </span>
                      <span className="leading-relaxed">{bp}</span>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-4 bg-slate-800/90 border border-slate-700 rounded-xl p-4">
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                    {currentSlide.metricHighlight.value}
                  </div>
                  <div className="text-xs font-semibold text-white mt-1">
                    {currentSlide.metricHighlight.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {currentSlide.metricHighlight.context}
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Navigation + Presenter Speaker Notes */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="text-xs font-semibold text-slate-900">
                  Presenter Speaker Notes (Slide 0{currentSlide.slideNumber})
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  “{currentSlide.speakerNotes}”
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlideIdx((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentSlideIdx === 0}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Slide
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlideIdx((prev) =>
                      Math.min(slides.length - 1, prev + 1)
                    )
                  }
                  disabled={currentSlideIdx === slides.length - 1}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Next Slide
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
