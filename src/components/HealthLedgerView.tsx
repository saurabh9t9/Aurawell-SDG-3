import React, { useState, useMemo } from 'react';
import { CheckInLogEntry } from '../data/sdg3Data';
import { Download, Search, Plus, Trash2, Eye } from 'lucide-react';

interface HealthLedgerViewProps {
  entries: CheckInLogEntry[];
  onAddEntry: (entry: CheckInLogEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const HealthLedgerView: React.FC<HealthLedgerViewProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'Nominal' | 'Elevated Stress' | 'Clinical Follow-Up'
  >('ALL');
  const [selectedEntry, setSelectedEntry] = useState<CheckInLogEntry | null>(
    entries[0] || null
  );
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Quick new entry form state
  const [newCohort, setNewCohort] = useState<string>('Undergraduate CS · Year 2');
  const [newTrigger, setNewTrigger] = useState<string>('Academic & Exam Pressure');
  const [newMood, setNewMood] = useState<number>(6);
  const [newPhq, setNewPhq] = useState<number>(4);
  const [newSleep, setNewSleep] = useState<number>(6.5);
  const [newNote, setNewNote] = useState<string>(
    'Completed scheduled preventive check-in and 5-minute breathing exercise.'
  );

  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      const matchesStatus =
        statusFilter === 'ALL' || item.triageStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.participantCode.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.cohort.toLowerCase().includes(q) ||
        item.primaryTrigger.toLowerCase().includes(q) ||
        item.interventionCompleted.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [entries, statusFilter, searchQuery]);

  // Cohort metrics
  const metrics = useMemo(() => {
    if (entries.length === 0) {
      return { total: 0, avgPhq: '0.0', avgSleep: '0.0', highRiskCount: 0 };
    }
    const total = entries.length;
    const avgPhq = (
      entries.reduce((acc, e) => acc + e.phq4Score, 0) / total
    ).toFixed(1);
    const avgSleep = (
      entries.reduce((acc, e) => acc + e.sleepHours, 0) / total
    ).toFixed(1);
    const highRiskCount = entries.filter(
      (e) => e.triageStatus === 'Clinical Follow-Up'
    ).length;
    return { total, avgPhq, avgSleep, highRiskCount };
  }, [entries]);

  const handleExportCsv = () => {
    const headers = [
      'Record ID',
      'Timestamp',
      'Participant Code',
      'Age',
      'Cohort',
      'Mood (1-10)',
      'PHQ-4 (0-12)',
      'Sleep (Hrs)',
      'Resting BPM',
      'Primary Stressor / Symptom',
      'Triage Status',
      'Intervention Completed',
    ];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.timestamp,
      e.participantCode,
      e.age,
      `"${e.cohort}"`,
      e.moodScore,
      e.phq4Score,
      e.sleepHours,
      e.restingBpm,
      `"${e.primaryTrigger}"`,
      e.triageStatus,
      `"${e.interventionCompleted}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'aurawell_sdg3_health_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const entry: CheckInLogEntry = {
      id: `CHK-2026-${Math.floor(820 + Math.random() * 170)}`,
      timestamp: formattedDate,
      participantCode: `YTH-${Math.floor(1000 + Math.random() * 8999)}`,
      age: 20,
      cohort: newCohort,
      moodScore: newMood,
      phq4Score: newPhq,
      sleepHours: newSleep,
      restingBpm: 74,
      primaryTrigger: newTrigger,
      triageStatus:
        newPhq >= 9
          ? 'Clinical Follow-Up'
          : newPhq >= 5
          ? 'Elevated Stress'
          : 'Nominal',
      interventionCompleted: 'Manual Cohort Screening Log',
      summaryNote: newNote,
    };

    onAddEntry(entry);
    setSelectedEntry(entry);
    setShowAddForm(false);
  };

  return (
    <div className="health-ledger-view space-y-8">
      {/* Top Quantitative KPI Strip */}
      <div className="ledger-metrics grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Total SDG 3 Screenings Logged
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {metrics.total}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Anonymized youth cohort sessions
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Cohort Mean PHQ-4 Distress
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {metrics.avgPhq} <span className="text-sm font-normal text-slate-500">/ 12.0</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Target threshold &lt; 4.5 after 4 weeks
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Mean Sleep Recovery
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {metrics.avgSleep} <span className="text-sm font-normal text-slate-500">hrs/night</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tracked alongside resting heart rate
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Warm Referrals to Counselors
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-800 mt-1">
            {metrics.highRiskCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Screenings with PHQ-4 &ge; 9 or Red Flags
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="ledger-toolbar bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Segmented Status Filter */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['ALL', 'Nominal', 'Elevated Stress', 'Clinical Follow-Up'] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Records' : st}
              </button>
            )
          )}
        </div>

        {/* Search + Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, cohort, stressor..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Entry
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Collapsible Manual Entry Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateManualEntry}
          className="ledger-entry-form bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Log New Anonymized Youth Check-In Record
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Student Cohort
              </label>
              <input
                type="text"
                value={newCohort}
                onChange={(e) => setNewCohort(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Stressor / Symptom
              </label>
              <input
                type="text"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mood Score (1–10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={newMood}
                onChange={(e) => setNewMood(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                PHQ-4 Score (0–12)
              </label>
              <input
                type="number"
                min={0}
                max={12}
                value={newPhq}
                onChange={(e) => setNewPhq(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sleep Recovery (Hrs)
              </label>
              <input
                type="number"
                step={0.5}
                min={2}
                max={12}
                value={newSleep}
                onChange={(e) => setNewSleep(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Clinical summary note..."
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* High-Density Data Grid + Selected Record Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="ledger-records lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="text-sm font-semibold text-slate-900">
                {entries.length === 0 ? 'No screening records yet' : 'No matching screening logs found'}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {entries.length === 0
                  ? 'Complete a wellness check-in or symptom triage, or add a record to start your health ledger.'
                  : 'Adjust your search query or status filter, or log a new check-in entry above.'}
              </p>
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Record / Participant</th>
                    <th className="py-3 px-4">Cohort & Primary Trigger</th>
                    <th className="py-3 px-3 text-right">Mood</th>
                    <th className="py-3 px-3 text-right">PHQ-4</th>
                    <th className="py-3 px-3 text-right">Sleep</th>
                    <th className="py-3 px-4">Triage Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredEntries.map((row) => {
                    const isSelected = selectedEntry?.id === row.id;
                    const statusColor =
                      row.triageStatus === 'Clinical Follow-Up'
                        ? 'text-red-700 font-semibold'
                        : row.triageStatus === 'Elevated Stress'
                        ? 'text-amber-800 font-semibold'
                        : 'text-emerald-700 font-medium';

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedEntry(row)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono tabular-nums font-semibold text-slate-900">
                            {row.participantCode}
                          </div>
                          <div className="font-mono tabular-nums text-[11px] text-slate-500">
                            {row.id} · {row.timestamp}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900 truncate max-w-[210px]">
                            {row.primaryTrigger}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[210px]">
                            {row.cohort}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                          {row.moodScore}/10
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {row.phq4Score}/12
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {row.sleepHours.toFixed(1)}h
                        </td>
                        <td className={`py-3 px-4 whitespace-nowrap ${statusColor}`}>
                          {row.triageStatus}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEntry(row);
                              }}
                              title="Inspect Record"
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEntry(row.id);
                                if (selectedEntry?.id === row.id) {
                                  setSelectedEntry(null);
                                }
                              }}
                              title="Remove Record"
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Selected Check-In Record Clinical Inspector */}
        <div className="ledger-inspector lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {selectedEntry ? (
            <>
              <div className="border-b border-slate-100 pb-3 flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    {selectedEntry.id} · {selectedEntry.timestamp}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                    Participant {selectedEntry.participantCode}
                  </h3>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-600">
                  Age {selectedEntry.age}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-500">Cohort:</span>{' '}
                  <strong className="text-slate-900">{selectedEntry.cohort}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Primary Stressor / Cluster:</span>{' '}
                  <strong className="text-slate-900">{selectedEntry.primaryTrigger}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Triage Status:</span>{' '}
                  <strong className="text-slate-900">{selectedEntry.triageStatus}</strong>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div>
                  <div className="text-[11px] text-slate-500">PHQ-4</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {selectedEntry.phq4Score}/12
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Sleep</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {selectedEntry.sleepHours.toFixed(1)}h
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Resting HR</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {selectedEntry.restingBpm} BPM
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-semibold text-slate-900">
                  Intervention Delivered
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedEntry.interventionCompleted}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-900">
                  Clinical Observation & Outcome Note
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedEntry.summaryNote}
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              {entries.length === 0
                ? 'Record details will appear here after you add your first health ledger entry.'
                : 'Select any screening record from the table to inspect full vitals and intervention details.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
