import React, { useState, useEffect } from 'react';
import {
  PHQ4_QUESTIONS,
  YOUTH_STRESS_TRIGGERS,
  CheckInLogEntry,
} from '../data/sdg3Data';
import {
  Send,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

interface ChatTurn {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text: string;
  perspective?: string;
  nextStep?: string;
  breathingSuggestion?: string;
  healthReference?: string;
}

interface WellnessAgentViewProps {
  onAddLedgerEntry: (entry: CheckInLogEntry) => void;
  onNavigateToLedger: () => void;
}

const QUICK_PROMPTS = [
  'I have been feeling overwhelmed lately.',
  'Can you help me check in with myself?',
  'I want to talk through something on my mind.',
  'What are some gentle ways to manage stress?',
];

export const WellnessAgentView: React.FC<WellnessAgentViewProps> = ({
  onAddLedgerEntry,
  onNavigateToLedger,
}) => {
  // PHQ-4 state (4 questions, 0..3 each => 0..12 total)
  const [phqAnswers, setPhqAnswers] = useState<Record<string, number>>({
    gad1: 1,
    gad2: 1,
    phq1: 1,
    phq2: 0,
  });
  const [moodScore, setMoodScore] = useState<number>(6);
  const [sleepHours, setSleepHours] = useState<number>(6.5);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([
    'Academic & Exam Pressure',
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      timestamp: '08:30',
      text: 'Hi, I’m AuraWell Assistant. I’m here to support your wellbeing. We can talk through what’s on your mind, check in with how you’re feeling, explore gentle ways to manage stress, or try a breathing exercise. What feels helpful right now?',
    },
  ]);

  // 4-7-8 Breathing Timer state
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathSecond, setBreathSecond] = useState<number>(0); // 0..18 (19s total per 4-7-8 cycle)
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  useEffect(() => {
    if (!breathingActive) return;
    const interval = setInterval(() => {
      setBreathSecond((prev) => {
        if (prev >= 18) {
          setCompletedCycles((c) => c + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathingActive]);

  const totalPhqScore = Object.values(phqAnswers).reduce((sum, val) => sum + val, 0);
  const gad2Subscore = (phqAnswers.gad1 ?? 0) + (phqAnswers.gad2 ?? 0);
  const phq2Subscore = (phqAnswers.phq1 ?? 0) + (phqAnswers.phq2 ?? 0);

  const getPhqSeverity = (score: number) => {
    if (score <= 2) return { label: 'Nominal Baseline', tone: 'text-emerald-700' };
    if (score <= 5) return { label: 'Mild Stress Load', tone: 'text-amber-700' };
    if (score <= 8) return { label: 'Moderate Distress', tone: 'text-amber-800' };
    return { label: 'Clinical Follow-Up Advised', tone: 'text-red-700' };
  };

  const severity = getPhqSeverity(totalPhqScore);

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText ?? chatInput).trim();
    if (!textToSend || isSending) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: nowStr,
      text: textToSend,
    };

    setMessages((prev) => [...prev, userTurn]);
    if (!customText) setChatInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/wellness-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages
            .filter((turn) => turn.id !== 'welcome-1')
            .slice(-12)
            .map((turn) => ({
              role: turn.sender === 'agent' ? 'assistant' : 'user',
              text: turn.text,
            })),
        }),
      });
      const responseText = await response.text();
      let data: { error?: string; reply?: string; perspective?: string; nextStep?: string; breathingSuggestion?: string; healthReference?: string };
      try {
        data = JSON.parse(responseText);
      } catch {
        const contentType = response.headers.get('content-type') || 'unknown content type';
        throw new Error(
          `AuraWell Assistant received an unreadable response (HTTP ${response.status}, ${contentType}). Check the Vercel function logs.`
        );
      }
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}.`);
      }

      const agentTurn: ChatTurn = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        text:
          data.reply ||
          'AuraWell Assistant could not provide a response. Please try again.',
        perspective: data.perspective,
        nextStep: data.nextStep,
        breathingSuggestion: data.breathingSuggestion,
        healthReference: data.healthReference,
      };
      setMessages((prev) => [...prev, agentTurn]);
    } catch (err) {
      const errorTurn: ChatTurn = {
        id: `agent-error-${Date.now()}`,
        sender: 'agent',
        timestamp: nowStr,
        text: err instanceof Error ? err.message : 'The request failed. Please try again.',
      };
      setMessages((prev) => [...prev, errorTurn]);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogToLedger = () => {
    const latestAgentMsg = [...messages].reverse().find((m) => m.sender === 'agent');
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry: CheckInLogEntry = {
      id: `CHK-2026-${Math.floor(810 + Math.random() * 180)}`,
      timestamp: formattedDate,
      participantCode: `YTH-${Math.floor(1000 + Math.random() * 8999)}`,
      age: 20,
      cohort: 'Self Check-In · Web Session',
      moodScore,
      phq4Score: totalPhqScore,
      sleepHours,
      restingBpm: completedCycles > 0 ? 70 : 82,
      primaryTrigger: selectedTriggers[0] || 'Academic & Exam Pressure',
      triageStatus:
        totalPhqScore >= 9
          ? 'Clinical Follow-Up'
          : totalPhqScore >= 5
          ? 'Elevated Stress'
          : 'Nominal',
      interventionCompleted:
        completedCycles > 0
          ? `CBT Check-In + ${completedCycles}x 4-7-8 Breathing Cycles`
          : 'Conversational CBT Check-In & PHQ-4 Screening',
      summaryNote:
        latestAgentMsg?.nextStep ||
        'Completed a conversational youth mental wellness check-in.',
    };

    onAddLedgerEntry(newEntry);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  };

  // Breathing phase calculation (0..3 Inhale, 4..10 Hold, 11..18 Exhale)
  const breathPhase =
    breathSecond < 4
      ? { name: 'Inhale Slowly Through Nose', remaining: 4 - breathSecond, progress: ((breathSecond + 1) / 4) * 100 }
      : breathSecond < 11
      ? { name: 'Hold Breath Gently', remaining: 11 - breathSecond, progress: ((breathSecond - 3) / 7) * 100 }
      : { name: 'Exhale Completely Through Mouth', remaining: 19 - breathSecond, progress: ((breathSecond - 10) / 8) * 100 };

  return (
    <div className="wellness-view space-y-8">
      {/* Problem Statement Context Bar */}
      <div className="view-intro">
        <div className="view-intro-copy">
          <div className="view-intro-label">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            A GENTLE CHECK-IN
          </div>
          <h2>Check in, then take it one step at a time</h2>
          <p>
            Reflect on how you’re feeling, talk something through, or try a
            breathing exercise. Start wherever feels comfortable.
          </p>
        </div>

        <div className="view-intro-actions flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleLogToLedger}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            Save this check-in
          </button>
          {savedNotice && (
            <button
              onClick={onNavigateToLedger}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Logged — View Health Ledger
            </button>
          )}
        </div>
      </div>

      {/* Main 12-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Validated PHQ-4 Screening + Triggers + Breathing Pacer */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: PHQ-4 & Daily Vitals Check-In */}
          <section className="checkin-panel bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  01. Daily Vitals & PHQ-4 Brief Screening
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validated 4-item anxiety (GAD-2) and mood (PHQ-2) self-check
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {totalPhqScore}/12
                </div>
                <div className={`text-xs font-medium ${severity.tone}`}>
                  {severity.label}
                </div>
              </div>
            </div>

            {/* Mood & Sleep Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="mood-slider" className="font-medium text-slate-700">
                    Current Mood Rating
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {moodScore}/10
                  </span>
                </div>
                <input
                  id="mood-slider"
                  type="range"
                  min={1}
                  max={10}
                  value={moodScore}
                  onChange={(e) => setMoodScore(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 (Depleted)</span>
                  <span>10 (Restored)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="sleep-slider" className="font-medium text-slate-700">
                    Last Night Sleep
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {sleepHours.toFixed(1)} hrs
                  </span>
                </div>
                <input
                  id="sleep-slider"
                  type="range"
                  min={3}
                  max={10}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>3.0h</span>
                  <span>10.0h</span>
                </div>
              </div>
            </div>

            {/* PHQ-4 Questions */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {PHQ4_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Item 0{idx + 1} · {q.domain}
                    </span>
                    <span className="font-mono tabular-nums">
                      Score: {phqAnswers[q.id] ?? 0}/3
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-snug">
                    {q.prompt}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200/70">
                    {[
                      { val: 0, label: 'Not at all' },
                      { val: 1, label: 'Several days' },
                      { val: 2, label: '> Half days' },
                      { val: 3, label: 'Nearly daily' },
                    ].map((opt) => {
                      const active = (phqAnswers[q.id] ?? 0) === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() =>
                            setPhqAnswers((prev) => ({ ...prev, [q.id]: opt.val }))
                          }
                          className={`py-1.5 px-2 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                            active
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Subscore summary line */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>
                Anxiety Subscore (GAD-2):{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {gad2Subscore}/6
                </strong>
              </span>
              <span>·</span>
              <span>
                Mood Subscore (PHQ-2):{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {phq2Subscore}/6
                </strong>
              </span>
            </div>
          </section>

          {/* Card 2: Youth Stress Triggers */}
          <section className="wellness-detail-panel bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                02. Active Youth Stressors
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select context factors to personalize your AI cognitive reframe
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {YOUTH_STRESS_TRIGGERS.map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger);
                return (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors truncate cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950 text-white border-emerald-950'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {trigger}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card 3: Interactive 4-7-8 Parasympathetic Breathing Pacer */}
          <section className="breathing-panel bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  03. 4-7-8 Somatic Breathing Pacer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lowers sympathetic heart-rate arousal in 90 seconds
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-600">
                Cycles: {completedCycles}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {breathingActive ? breathPhase.name : 'Ready — 4s Inhale · 7s Hold · 8s Exhale'}
                </span>
                <span className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                  {breathingActive ? `${breathPhase.remaining}s` : '19s/cycle'}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${breathingActive ? breathPhase.progress : 0}%` }}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBreathingActive((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {breathingActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Pause Pacer
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Start Breathing Exercise
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBreathingActive(false);
                    setBreathSecond(0);
                    setCompletedCycles(0);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (7 cols): Conversational AI Mental Wellness Agent */}
        <div className="lg:col-span-7 space-y-6">
          <section className="assistant-panel bg-white border border-slate-200 rounded-xl flex flex-col h-[740px]">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  AuraWell AI Assistant
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Open conversation · Personalized responses · Non-diagnostic health support
                </div>
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
                Mood {moodScore}/10 · PHQ-4 {totalPhqScore}/12
              </div>
            </div>

            {/* Quick Prompt Starters */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80">
              <div className="text-[11px] font-medium text-slate-500 mb-2">
                Choose a prompt or ask about wellbeing:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isSending}
                    className="px-2.5 py-1 text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-left truncate max-w-full cursor-pointer disabled:opacity-50"
                  >
                    “{prompt}”
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Scroll Viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="font-medium text-slate-600">
                      {m.sender === 'user' ? 'You' : 'AuraWell Assistant'}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-2xl rounded-xl p-4 text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 space-y-3'
                    }`}
                  >
                    <p>{m.text}</p>

                    {m.sender === 'agent' &&
                      (m.perspective || m.nextStep || m.breathingSuggestion || m.healthReference) && (
                      <div className="pt-3 border-t border-slate-200/80 space-y-2.5 text-xs">
                        {m.perspective && (
                          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                            <div className="font-semibold text-emerald-800 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              Helpful Context
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {m.perspective}
                            </p>
                          </div>
                        )}

                        {m.nextStep && (
                          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                            <div className="font-semibold text-slate-900">
                              Suggested Next Step
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {m.nextStep}
                            </p>
                          </div>
                        )}

                        {(m.breathingSuggestion || m.healthReference) && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                            {m.breathingSuggestion && (
                              <span>Optional breathing: {m.breathingSuggestion}</span>
                            )}
                            {m.breathingSuggestion && m.healthReference && <span>·</span>}
                            {m.healthReference && <span>{m.healthReference}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>Thinking about your message...</span>
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 border-t border-slate-200 bg-white rounded-b-xl flex items-center gap-3"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Share what’s on your mind or ask a wellness question..."
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-slate-900"
              />
              <button
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Check In
              </button>
            </form>
          </section>

          {/* Safety & Crisis Escalation Banner */}
          <div className="safety-panel bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>24/7 Confidential Youth Crisis & Counselor Escalation Protocol</span>
              </div>
              <p className="text-xs text-slate-600">
                AuraWell provides preventive mental wellness check-ins and CBT skill building. If you or a peer are in immediate distress, connect with a human counselor immediately:
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-800 space-y-1 shrink-0 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200">
              <div>National Crisis Line: 988 (24/7 Free)</div>
              <div>Tele-MANAS Youth Helpline: 14416</div>
              <div>Campus Health Desk: Ext. 4400</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
