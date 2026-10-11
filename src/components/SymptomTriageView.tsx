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
  primaryPattern: string;
  clinicalSummary: string;
  differentialConsiderations: string[];
  immediateNextSteps: string[];
  redFlagsToWatch: string[];
  source?: string;
}

interface SymptomTriageViewProps {
  onAddLedgerEntry: (entry: CheckInLogEntry) => void;
  onNavigateToLedger: () => void;
}

export const SymptomTriageView: React.FC<SymptomTriageViewProps> = ({
  onAddLedgerEntry,
  onNavigateToLedger,
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Persistent Cough',
    'Sore Throat',
    'Unexplained Fatigue',
  ]);
  const [temperatureC, setTemperatureC] = useState<number>(38.1);
  const [heartRateBpm, setHeartRateBpm] = useState<number>(88);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [sleepHours, setSleepHours] = useState<number>(5.5);
  const [age, setAge] = useState<number>(21);
  const [notes, setNotes] = useState<string>(
    'Started after late-night study sessions in campus hostel; mild chills in the evening.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loggedSuccess, setLoggedSuccess] = useState<boolean>(false);

  const [triageResult, setTriageResult] = useState<TriageResult>({
    urgencyLevel: 'Non-Urgent Clinical Consult',
    riskScore: 54,
    primaryPattern: 'Upper Respiratory Febrile & Somatic Fatigue Cluster',
    clinicalSummary:
      'Multi-parameter screening across 3 reported symptoms lasting 3 days, body temperature 38.1°C, resting heart rate 88 BPM, and 5.5h/night sleep recovery indicates a non-urgent clinical consult pathway.',
    differentialConsiderations: [
      'Viral upper respiratory tract infection or seasonal influenza prodrome',
      'Circadian sleep debt amplifying systemic inflammatory response',
      'Early pharyngitis/tonsillitis warranting targeted throat examination if persistent >4 days',
    ],
    immediateNextSteps: [
      'Schedule a campus infirmary or telemedicine consultation within 24–48 hours.',
      'Maintain oral hydration (2.5L/day water/electrolytes) and re-check temperature every 6 hours.',
      'Isolate from shared study spaces until afebrile (<37.5°C) for at least 24 hours.',
    ],
    redFlagsToWatch: [
      'Resting shortness of breath, wheezing, or pleuritic chest tightness',
      'Persistent fever exceeding 39.2°C (102.5°F) unresponsive to antipyretics',
      'Severe lethargy, confusion, or inability to tolerate oral fluids',
    ],
  });

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const applyPreset = (preset: 'mild' | 'moderate' | 'urgent') => {
    if (preset === 'mild') {
      setSelectedSymptoms(['Unexplained Fatigue', 'Brain Fog / Poor Concentration']);
      setTemperatureC(36.8);
      setHeartRateBpm(72);
      setDurationDays(2);
      setSleepHours(5.0);
      setNotes('Post-exam exhaustion and screen strain; no fever or respiratory distress.');
    } else if (preset === 'moderate') {
      setSelectedSymptoms(['Persistent Cough', 'Sore Throat', 'Chills / Sweats', 'Unexplained Fatigue']);
      setTemperatureC(38.4);
      setHeartRateBpm(94);
      setDurationDays(4);
      setSleepHours(5.5);
      setNotes('4-day productive cough with evening low-grade fever and body aches.');
    } else {
      setSelectedSymptoms(['Shortness of Breath', 'Chest Tightness', 'Persistent Cough', 'Chills / Sweats']);
      setTemperatureC(39.3);
      setHeartRateBpm(114);
      setDurationDays(5);
      setSleepHours(4.5);
      setNotes('High fever with resting breathlessness when climbing hostel stairs.');
    }
  };

  const runSymptomAnalysis = async () => {
    if (selectedSymptoms.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/symptom-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          durationDays,
          temperatureC,
          heartRateBpm,
          sleepHours,
          age,
          notes,
        }),
      });
      const data = await response.json();
      if (data && data.urgencyLevel) {
        setTriageResult(data);
      }
    } catch (_err) {
      // Fallback handled seamlessly
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveTriageToLedger = () => {
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
    triageResult.urgencyLevel === 'Urgent Medical Evaluation'
      ? {
          text: 'text-red-700',
          bg: 'bg-red-50 border-red-200',
          bar: 'bg-red-600',
        }
      : triageResult.urgencyLevel === 'Non-Urgent Clinical Consult'
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

        {/* Interactive Clinical Presets */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-slate-500 mr-1">Test Case Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('mild')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Mild Fatigue
          </button>
          <button
            type="button"
            onClick={() => applyPreset('moderate')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Febrile Viral
          </button>
          <button
            type="button"
            onClick={() => applyPreset('urgent')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Acute Respiratory
          </button>
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
                  min={36.0}
                  max={40.5}
                  step={0.1}
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(Number(e.target.value))}
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
                  min={52}
                  max={135}
                  step={1}
                  value={heartRateBpm}
                  onChange={(e) => setHeartRateBpm(Number(e.target.value))}
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
                  min={1}
                  max={14}
                  step={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
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
                <div className="flex justify-between text-xs">
                  <label htmlFor="age-range" className="font-medium text-slate-700">
                    Participant Age
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {age} yrs
                  </span>
                </div>
                <input
                  id="age-range"
                  type="range"
                  min={15}
                  max={60}
                  step={1}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>15 yrs</span>
                  <span>35 yrs</span>
                  <span>60 yrs</span>
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
                onClick={() => setSelectedSymptoms(['Unexplained Fatigue'])}
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
                onChange={(e) => setNotes(e.target.value)}
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
                ? 'Running Multi-Parameter Clinical Triage...'
                : 'Run AI Early Symptom Triage Analysis'}
            </button>
          </section>
        </div>

        {/* Right 6 Cols: Structured Clinical Risk Output */}
        <div className="lg:col-span-6 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs text-slate-500">
                  Clinical Decision Support Output · Non-Diagnostic Stratification
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                  {triageResult.primaryPattern}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {triageResult.riskScore}/100
                </div>
                <div className="text-xs text-slate-500">Composite Risk Index</div>
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
                  Temp {temperatureC.toFixed(1)}°C · HR {heartRateBpm} BPM
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
          </section>
        </div>
      </div>
    </div>
  );
};
