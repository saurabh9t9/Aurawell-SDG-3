import React, { useState } from 'react';
import { LEAN_CANVAS_PRESETS, LeanCanvasData } from '../data/sdg3Data';
import { Printer, Download, Edit3, Check, RotateCcw } from 'lucide-react';

export const LeanCanvasView: React.FC = () => {
  const [activePresetKey, setActivePresetKey] = useState<string>('combined');
  const [canvas, setCanvas] = useState<LeanCanvasData>(
    LEAN_CANVAS_PRESETS.combined
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleSelectPreset = (key: string) => {
    setActivePresetKey(key);
    setCanvas(LEAN_CANVAS_PRESETS[key]);
    setIsEditing(false);
  };

  const updateListField = (field: keyof LeanCanvasData, value: string) => {
    const lines = value.split('\n').filter((line) => line.trim() !== '');
    setCanvas((prev) => ({
      ...prev,
      [field]: lines,
    }));
  };

  const handleDownloadMarkdown = () => {
    const md = `# ${canvas.title}
**${canvas.subtitle}**  
*${canvas.lastUpdated}*

---

## 1. PROBLEM
${canvas.problem.map((p) => `- ${p}`).join('\n')}

### Existing Alternatives
${canvas.existingAlternatives.map((a) => `- ${a}`).join('\n')}

## 2. CUSTOMER SEGMENTS
${canvas.customerSegments.map((c) => `- ${c}`).join('\n')}

### Early Adopters
${canvas.earlyAdopters.map((e) => `- ${e}`).join('\n')}

## 3. UNIQUE VALUE PROPOSITION
${canvas.uniqueValueProposition}

### High-Level Concept
${canvas.highLevelConcept}

## 4. SOLUTION
${canvas.solution.map((s) => `- ${s}`).join('\n')}

## 5. CHANNELS
${canvas.channels.map((ch) => `- ${ch}`).join('\n')}

## 6. REVENUE STREAMS
${canvas.revenueStreams.map((r) => `- ${r}`).join('\n')}

## 7. COST STRUCTURE
${canvas.costStructure.map((c) => `- ${c}`).join('\n')}

## 8. KEY METRICS
${canvas.keyMetrics.map((k) => `- ${k}`).join('\n')}

## 9. UNFAIR ADVANTAGE
${canvas.unfairAdvantage.map((u) => `- ${u}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SDG3_AuraWell_Lean_Canvas.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar (Hidden when printing Lean Canvas PDF) */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-500">
            IBM SkillsBuild Masterclass 5 Deliverable #1 · Lean Canvas Architecture
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Interactive 9-Block Lean Canvas Studio (UN SDG 3)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'combined', label: 'Combined SDG 3 Platform' },
              { id: 'mental_health', label: 'Youth Mental Health Agent' },
              { id: 'symptom_triage', label: 'Early Disease Detection' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectPreset(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activePresetKey === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                Done Editing
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                Customize Blocks
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCanvas(LEAN_CANVAS_PRESETS[activePresetKey])}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export .MD
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save Lean Canvas PDF
          </button>
        </div>
      </div>

      {/* Printable Lean Canvas Sheet matching Page 3 of the PDF */}
      <div className="bg-white border-2 border-slate-900 rounded-xl overflow-hidden">
        {/* Canvas Document Header */}
        <div className="px-6 py-4 border-b-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {canvas.title}
            </h3>
            <p className="text-xs text-slate-600">{canvas.subtitle}</p>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
            Lean Canvas · {canvas.lastUpdated}
          </div>
        </div>

        {/* Top 5-Column Architectural Grid (Problem | Solution+Metrics | UVP | UnfairAdv+Channels | CustomerSegments) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-slate-900 border-b-2 border-slate-900">
          {/* Column 1: Problem & Existing Alternatives */}
          <div className="flex flex-col justify-between divide-y divide-slate-300">
            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-tight text-slate-900">
                  1. PROBLEM
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Top 1–3 Problems
                </span>
              </div>
              {isEditing ? (
                <textarea
                  rows={8}
                  value={canvas.problem.join('\n')}
                  onChange={(e) => updateListField('problem', e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  {canvas.problem.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 space-y-2 bg-slate-50/60">
              <div className="text-[11px] font-bold text-slate-700">
                EXISTING ALTERNATIVES
              </div>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={canvas.existingAlternatives.join('\n')}
                  onChange={(e) =>
                    updateListField('existingAlternatives', e.target.value)
                  }
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <ul className="space-y-1 text-xs text-slate-600">
                  {canvas.existingAlternatives.map((alt, i) => (
                    <li key={i}>• {alt}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Column 2: Solution (Top) & Key Metrics (Bottom) */}
          <div className="flex flex-col justify-between divide-y-2 divide-slate-900">
            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-tight text-slate-900">
                  4. SOLUTION
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Core AI Capabilities
                </span>
              </div>
              {isEditing ? (
                <textarea
                  rows={7}
                  value={canvas.solution.join('\n')}
                  onChange={(e) => updateListField('solution', e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  {canvas.solution.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-tight text-slate-900">
                  8. KEY METRICS
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Impact KPIs
                </span>
              </div>
              {isEditing ? (
                <textarea
                  rows={5}
                  value={canvas.keyMetrics.join('\n')}
                  onChange={(e) => updateListField('keyMetrics', e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                  {canvas.keyMetrics.map((m, i) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Column 3: Unique Value Proposition & High-Level Concept */}
          <div className="flex flex-col justify-between divide-y divide-slate-300">
            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-tight text-slate-900">
                  3. UNIQUE VALUE PROPOSITION
                </span>
              </div>
              {isEditing ? (
                <textarea
                  rows={6}
                  value={canvas.uniqueValueProposition}
                  onChange={(e) =>
                    setCanvas((prev) => ({
                      ...prev,
                      uniqueValueProposition: e.target.value,
                    }))
                  }
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {canvas.uniqueValueProposition}
                </p>
              )}
            </div>

            <div className="p-4 space-y-2 bg-slate-50/60">
              <div className="text-[11px] font-bold text-slate-700">
                HIGH-LEVEL CONCEPT
              </div>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={canvas.highLevelConcept}
                  onChange={(e) =>
                    setCanvas((prev) => ({
                      ...prev,
                      highLevelConcept: e.target.value,
                    }))
                  }
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                  {canvas.highLevelConcept}
                </p>
              )}
            </div>
          </div>

          {/* Column 4: Unfair Advantage (Top) & Channels (Bottom) */}
          <div className="flex flex-col justify-between divide-y-2 divide-slate-900">
            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-tight text-slate-900">
                  9. UNFAIR ADVANTAGE
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Defensibility
                </span>
              </div>
              {isEditing ? (
                <textarea
                  rows={5}
                  value={canvas.unfairAdvantage.join('\n')}
                  onChange={(e) =>
                    updateListField('unfairAdvantage', e.target.value)
                  }
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                  {canvas.unfairAdvantage.map((u, i) => (
                    <li key={i}>• {u}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-tight text-slate-900">
                  5. CHANNELS
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Path to Users
                </span>
              </div>
              {isEditing ? (
                <textarea
                  rows={5}
                  value={canvas.channels.join('\n')}
                  onChange={(e) => updateListField('channels', e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                  {canvas.channels.map((ch, i) => (
                    <li key={i}>• {ch}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Column 5: Customer Segments & Early Adopters */}
          <div className="flex flex-col justify-between divide-y divide-slate-300">
            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-tight text-slate-900">
                  2. CUSTOMER SEGMENTS
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Target Users
                </span>
              </div>
              {isEditing ? (
                <textarea
                  rows={6}
                  value={canvas.customerSegments.join('\n')}
                  onChange={(e) =>
                    updateListField('customerSegments', e.target.value)
                  }
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  {canvas.customerSegments.map((seg, i) => (
                    <li key={i}>• {seg}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 space-y-2 bg-slate-50/60">
              <div className="text-[11px] font-bold text-slate-700">
                EARLY ADOPTERS
              </div>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={canvas.earlyAdopters.join('\n')}
                  onChange={(e) =>
                    updateListField('earlyAdopters', e.target.value)
                  }
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {canvas.earlyAdopters.map((ea, i) => (
                    <li key={i}>• {ea}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Bottom 2-Column Row: Cost Structure (Left) & Revenue Streams (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-slate-900">
          <div className="p-5 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold tracking-tight text-slate-900">
                7. COST STRUCTURE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Fixed & Variable Operational Costs
              </span>
            </div>
            {isEditing ? (
              <textarea
                rows={4}
                value={canvas.costStructure.join('\n')}
                onChange={(e) =>
                  updateListField('costStructure', e.target.value)
                }
                className="w-full p-2 text-xs border border-slate-300 rounded"
              />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {canvas.costStructure.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-5 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold tracking-tight text-slate-900">
                6. REVENUE STREAMS
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Sustainability & Institutional Funding
              </span>
            </div>
            {isEditing ? (
              <textarea
                rows={4}
                value={canvas.revenueStreams.join('\n')}
                onChange={(e) =>
                  updateListField('revenueStreams', e.target.value)
                }
                className="w-full p-2 text-xs border border-slate-300 rounded"
              />
            ) : (
              <ul className="space-y-1.5 text-xs text-slate-700">
                {canvas.revenueStreams.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
