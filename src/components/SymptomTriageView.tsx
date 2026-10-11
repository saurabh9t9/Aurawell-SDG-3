import React, { useState } from 'react';
import { SYMPTOM_CATALOG, CheckInLogEntry } from '../data/sdg3Data';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

interface TriageResult {
  urgencyLevel: 'Routine Self-Care' | 'Non-Urgent Clinical Consult' | 'Urgent Medical Evaluation';
  riskScore: number;
  riskScoreFactors: string[];
  primaryPattern: string;
  clinicalSummary: string;
  differentialConsiderations: string[];
  immediateNextSteps: string[];
  redFlagsToWatch: string[];
  source: string;
  assessedInputs: TriageInputs;
}

interface TriageInputs {
  symptoms: string[];
  durationDays: number;
  temperatureC: number;
  heartRateBpm: number;
  sleepHours: number;
  age: number;
  notes: string;
}

interface SymptomTriageViewProps {
  onAddLedgerEntry: (entry: CheckInLogEntry) => void;
  onNavigateToLedger: () => void;
}

function isValidTriageResult(value: unknown): value is TriageResult {
  if (typeof value !== 'object' || value === null) return false;
  const result = value as Record<string, unknown>;
  const isStringList = (list: unknown) =>
    Array.isArray(list) && list.every((item) => typeof item === 'string' && item.trim().length > 0);
  return (
    ['Routine Self-Care', 'Non-Urgent Clinical Consult', 'Urgent Medical Evaluation'].includes(
      String(result.urgencyLevel)
    ) &&
    Number.isInteger(result.riskScore) &&
    Number(result.riskScore) >= 0 &&
    Number(result.riskScore) <= 100 &&
    isStringList(result.riskScoreFactors) &&
    typeof result.primaryPattern === 'string' &&
    typeof result.clinicalSummary === 'string' &&
    isStringList(result.differentialConsiderations) &&
    isStringList(result.immediateNextSteps) &&
    isStringList(result.redFlagsToWatch) &&
    result.source === 'AuraWell AI' &&
    typeof result.assessedInputs === 'object' &&
    result.assessedInputs !== null
  );
}

export const SymptomTriageView: React.FC<SymptomTriageViewProps> = ({
  onAddLedgerEntry,
  onNavigateToLedger,
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [temperatureC, setTemperatureC] = useState<number>(36.8);
  const [heartRateBpm, setHeartRateBpm] = useState<number>(72);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [age, setAge] = useState<number>(21);
  const [notes, setNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loggedSuccess, setLoggedSuccess] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const clearAssessment = () => {
    setTriageResult(null);
    setAnalysisError(null);
    setLoggedSuccess(false);
  };

  const toggleSymptom = (symptom: string) => {
    clearAssessment();
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const runSymptomAnalysis = async () => {
    if (selectedSymptoms.length === 0 || isAnalyzing) return;
    const inputs: TriageInputs = {
      symptoms: [...selectedSymptoms],
      durationDays,
      temperatureC,
      heartRateBpm,
      sleepHours,
      age,
      notes,
    };
    setIsAnalyzing(true);
    setTriageResult(null);
    setAnalysisError(null);
    try {
      const response = await fetch('/api/symptom-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error('AuraWell AI returned an unreadable response. Please try again.');
      }
      if (!response.ok) {
        const message =
          typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'AuraWell AI could not complete the assessment. Please try again.';
        throw new Error(message);
      }
      if (
        !isValidTriageResult(data) ||
        JSON.stringify(data.assessedInputs) !== JSON.stringify(inputs)
      ) {
        throw new Error('AuraWell AI returned an incomplete assessment. Please try again.');
      }
      setTriageResult(data);
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : 'Could not reach AuraWell AI. Check your connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveTriageToLedger = () => {
    if (!triageResult) return;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const entry: CheckInLogEntry = {
      id: `TRG-2026-${Math.floor(810 + Math.random() * 180)}`,
      timestamp: formattedDate,
      participantCode: `YTH-${Math.floor(1000 + Math.random() * 8999)}`,
      age,
      cohort: 'Early Symptom Triage · Web Session',
      moodScore: triageResult.riskScore > 65 ? 4 : triageResult.riskScore > 40 ? 6 : 8,
      phq4Score: triageResult.riskScore > 65 ? 7 : 3,
      sleepHours,
      restingBpm: heartRateBpm,
      primaryTrigger: selectedSymptoms.slice(0, 2).join(' + ') || 'Physical Fatigue / Burnout',
      triageStatus:
        triageResult.urgencyLevel === 'Urgent Medical Evaluation'
          ? 'Clinical Follow-Up'
          : triageResult.urgencyLevel === 'Non-Urgent Clinical Consult'
          ? 'Elevated Stress'
          : 'Nominal',
      interventionCompleted: `AI Symptom Triage (${triageResult.urgencyLevel})`,
      summaryNote: `${triageResult.primaryPattern} — Temp ${temperatureC.toFixed(
        1
      )}°C, HR ${heartRateBpm} BPM. ${triageResult.immediateNextSteps[0] || ''}`,
    };

    onAddLedgerEntry(entry);
    setLoggedSuccess(true);
    setTimeout(() => setLoggedSuccess(false), 4000);
  };

  const urgencyStyle =
    triageResult?.urgencyLevel === 'Urgent Medical Evaluation'
      ? {
          text: 'text-red-700',
          bg: 'bg-red-50 border-red-200',
          bar: 'bg-red-600',
        }
      : triageResult?.urgencyLevel === 'Non-Urgent Clinical Consult'
      ? {
          text: 'text-amber-800',
          bg: 'bg-amber-50 border-amber-200',
          bar: 'bg-amber-600',
        }
      : {
          text: 'text-emerald-800',
          bg: 'bg-emerald-50 border-emerald-200',
          bar: 'bg-emerald-600',
        };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="text-xs font-medium text-slate-500">
            UN SDG 3.3 & 3.8 Early Disease Detection · IBM SkillsBuild Problem Statement Track 2
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            AI Early Disease Detection & Multi-Parameter Symptom Triage Engine
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Combines physiological vital signs (body temperature, resting heart rate, sleep recovery) with multi-system symptom clusters to stratify clinical urgency and surface early warning signs.
          </p>
        </div>

      </div>

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 Cols: Symptom Cluster Selector + Vital Sign Sliders */}
        <div className="lg:col-span-6 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  01. Quantitative Biometrics & Vitals
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust objective physiological inputs for risk calibration
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                Age: {age} yrs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="temp-range" className="font-medium text-slate-700">
                    Body Temperature
                  </label>
                  <span
                    className={`font-mono tabular-nums font-semibold ${
                      temperatureC >= 38.0 ? 'text-red-700' : 'text-slate-900'
                    }`}
                  >
                    {temperatureC.toFixed(1)} °C
                  </span>
                </div>
                <input
                  id="temp-range"
                  type="range"
                  disabled={isAnalyzing}
                  min={36.0}
                  max={40.5}
                  step={0.1}
                  value={temperatureC}
                  onChange={(e) => {
                    clearAssessment();
                    setTemperatureC(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>36.0°C (Normal)</span>
                  <span>38.0°C (Fever)</span>
                  <span>40.5°C</span>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="hr-range" className="font-medium text-slate-700">
                    Resting Heart Rate
                  </label>
                  <span
                    className={`font-mono tabular-nums font-semibold ${
                      heartRateBpm >= 100 ? 'text-amber-700' : 'text-slate-900'
                    }`}
                  >
                    {heartRateBpm} BPM
                  </span>
                </div>
                <input
                  id="hr-range"
                  type="range"
                  disabled={isAnalyzing}
                  min={52}
                  max={135}
                  step={1}
                  value={heartRateBpm}
                  onChange={(e) => {
                    clearAssessment();
                    setHeartRateBpm(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>52 BPM</span>
                  <span>100 BPM</span>
                  <span>135 BPM</span>
                </div>
              </div>

              {/* Duration Days */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="duration-range" className="font-medium text-slate-700">
                    Symptom Duration
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {durationDays} {durationDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <input
                  id="duration-range"
                  type="range"
                  disabled={isAnalyzing}
                  min={1}
                  max={14}
                  step={1}
                  value={durationDays}
                  onChange={(e) => {
                    clearAssessment();
                    setDurationDays(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>1 day</span>
                  <span>7 days</span>
                  <span>14 days</span>
                </div>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <label htmlFor="age-range" className="font-medium text-slate-700">
                    Participant Age
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-600">
                    <span>Edit age</span>
                    <input
                      type="number"
                      aria-label="Edit age in years"
                      title="Enter your age from 1 to 120 years"
                      disabled={isAnalyzing}
                      min={1}
                      max={120}
                      step={1}
                      value={age}
                      onChange={(e) => {
                        clearAssessment();
                        const value = Number(e.target.value);
                        if (e.target.value && Number.isInteger(value) && value >= 1 && value <= 120) {
                          setAge(value);
                        }
                      }}
                      className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-sm font-semibold font-mono tabular-nums text-slate-900 focus:outline-none focus:border-slate-900 disabled:bg-slate-100"
                    />
                  </label>
                </div>
                <input
                  id="age-range"
                  type="range"
                  disabled={isAnalyzing}
                  min={1}
                  max={120}
                  step={1}
                  value={age}
                  onChange={(e) => {
                    clearAssessment();
                    setAge(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>1 yr</span>
                  <span>60 yrs</span>
                  <span>120 yrs</span>
                </div>
              </div>

              {/* Average Sleep */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="sleep-range" className="font-medium text-slate-700">
                    Average Sleep
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {sleepHours} hours/night
                  </span>
                </div>
                <input
                  id="sleep-range"
                  type="range"
                  disabled={isAnalyzing}
                  min={0}
                  max={12}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => {
                    clearAssessment();
                    setSleepHours(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>0 hours</span>
                  <span>6 hours</span>
                  <span>12 hours</span>
                </div>
              </div>
            </div>
          </section>

          {/* Symptom Catalog */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  02. Presenting Symptom Clusters
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select all active symptoms ({selectedSymptoms.length} selected)
                </p>
              </div>
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => {
                  clearAssessment();
                  setSelectedSymptoms(['Unexplained Fatigue']);
                }}
                className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
              >
                Reset Selection
              </button>
            </div>

            <div className="space-y-4">
              {SYMPTOM_CATALOG.map((group) => (
                <div key={group.category} className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    {group.category}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => {
                      const active = selectedSymptoms.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          disabled={isAnalyzing}
                          onClick={() => toggleSymptom(item)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            active
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label htmlFor="clinical-notes" className="block text-xs font-medium text-slate-700">
                Additional Clinical Context / Onset Notes
              </label>
              <textarea
                id="clinical-notes"
                rows={2}
                value={notes}
                disabled={isAnalyzing}
                onChange={(e) => {
                  clearAssessment();
                  setNotes(e.target.value);
                }}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
              />
            </div>

            <button
              type="button"
              onClick={runSymptomAnalysis}
              disabled={isAnalyzing || selectedSymptoms.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing
                ? 'AuraWell AI is analyzing your current inputs...'
                : 'Analyze Symptoms with AuraWell AI'}
            </button>
            {analysisError && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {analysisError}
              </p>
            )}
          </section>
        </div>

        {/* Right 6 Cols: Structured Clinical Risk Output */}
        <div className="lg:col-span-6 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            {triageResult ? (
              <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs text-slate-500">
                  AuraWell AI Assessment · Non-Diagnostic Decision Support
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                  {triageResult.primaryPattern}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Assessed for age {triageResult.assessedInputs.age} ·{' '}
                  {triageResult.assessedInputs.symptoms.join(', ')} ·{' '}
                  {triageResult.assessedInputs.durationDays}{' '}
                  {triageResult.assessedInputs.durationDays === 1 ? 'day' : 'days'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {triageResult.riskScore}/100
                </div>
                <div className="text-xs text-slate-500">Input-based screening index</div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
              <div className="text-[11px] font-medium text-slate-600">
                Score factors (screening aid only; not a diagnosis)
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {triageResult.riskScoreFactors.map((factor) => (
                  <span
                    key={factor}
                    className="rounded-md bg-white border border-slate-200 px-2 py-1 text-[11px] text-slate-700"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>

            {/* Urgency Callout Box (No thick left border; clean full border) */}
            <div className={`p-4 rounded-xl border ${urgencyStyle.bg} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm font-bold flex items-center gap-2 ${urgencyStyle.text}`}>
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>Pathway: {triageResult.urgencyLevel}</span>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-600">
                  Temp {triageResult.assessedInputs.temperatureC.toFixed(1)}°C · HR{' '}
                  {triageResult.assessedInputs.heartRateBpm} BPM
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {triageResult.clinicalSummary}
              </p>
              <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full ${urgencyStyle.bar} transition-all duration-300`}
                  style={{ width: `${triageResult.riskScore}%` }}
                />
              </div>
            </div>

            {/* Differential Considerations */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" />
                Differential Considerations to Discuss with a Clinician
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {triageResult.differentialConsiderations.map((item, i) => (
                  <div key={i} className="p-3 text-xs text-slate-700 flex items-start gap-2.5">
                    <span className="font-mono tabular-nums font-semibold text-slate-400">
                      0{i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Immediate Next Steps */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                Recommended Preventive & Care Next Steps
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {triageResult.immediateNextSteps.map((step, i) => (
                  <div key={i} className="p-3 text-xs text-slate-800 flex items-start gap-2.5">
                    <span className="font-mono tabular-nums font-semibold text-emerald-700">
                      0{i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags to Watch */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-red-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-700" />
                Red-Flag Warning Signs Requiring Immediate Medical Care
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                {triageResult.redFlagsToWatch.map((flag, i) => (
                  <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="font-mono tabular-nums text-red-700 font-semibold">•</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveTriageToLedger}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Log Triage Record to Health Ledger
              </button>

              {loggedSuccess && (
                <button
                  type="button"
                  onClick={onNavigateToLedger}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Saved — Open Health Ledger
                </button>
              )}
            </div>
              </>
            ) : (
              <div className="min-h-64 flex flex-col items-center justify-center text-center gap-3 py-12">
                <Activity className="w-8 h-8 text-emerald-700" />
                <h3 className="text-base font-semibold text-slate-900">Your AI assessment will appear here</h3>
                <p className="max-w-sm text-sm text-slate-600">
                  Select your current symptoms, review the vital signs, then run an analysis. Results are generated from those inputs and clear when you change them.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
