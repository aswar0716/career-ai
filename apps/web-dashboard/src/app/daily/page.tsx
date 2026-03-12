'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Smile, Zap, Target, BookOpen, Dumbbell, Trophy, AlertCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

type DailyLog = {
  id: string;
  date: string;
  mood: number;
  energy: number;
  applicationsGoal: number;
  applicationsDone: number;
  studyMinutes: number;
  exercised: boolean;
  notes: string | null;
  gratitude: string | null;
  wins: string | null;
  blockers: string | null;
  tomorrowPlan: string | null;
};

const MOODS = ['😩', '😟', '😐', '🙂', '😄'];
const ENERGY = ['🪫', '😴', '⚡', '💪', '🔥'];

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">{children}</label>;
}

export default function DailyPage() {
  const [viewDate, setViewDate] = useState(formatDate(new Date()));
  const [log, setLog] = useState<DailyLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    mood: 3, energy: 3,
    applicationsGoal: 3, applicationsDone: 0, studyMinutes: 0,
    exercised: false,
    notes: '', gratitude: '', wins: '', blockers: '', tomorrowPlan: '',
  });

  useEffect(() => {
    fetch('/api/daily-logs').then(r => r.json()).then(setRecentLogs);
  }, []);

  useEffect(() => {
    fetch(`/api/daily-logs?date=${viewDate}`).then(r => r.json()).then((data: DailyLog | null) => {
      setLog(data);
      if (data) {
        setForm({
          mood: data.mood, energy: data.energy,
          applicationsGoal: data.applicationsGoal, applicationsDone: data.applicationsDone,
          studyMinutes: data.studyMinutes, exercised: data.exercised,
          notes: data.notes ?? '', gratitude: data.gratitude ?? '',
          wins: data.wins ?? '', blockers: data.blockers ?? '', tomorrowPlan: data.tomorrowPlan ?? '',
        });
      } else {
        setForm({ mood: 3, energy: 3, applicationsGoal: 3, applicationsDone: 0, studyMinutes: 0, exercised: false, notes: '', gratitude: '', wins: '', blockers: '', tomorrowPlan: '' });
      }
    });
  }, [viewDate]);

  async function save() {
    setSaving(true);
    const res = await fetch('/api/daily-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, date: viewDate }),
    });
    if (res.ok) {
      const saved = await res.json();
      setLog(saved);
      setRecentLogs(prev => {
        const filtered = prev.filter(l => !l.date.startsWith(viewDate));
        return [saved, ...filtered].slice(0, 30);
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  function prevDay() {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 1);
    setViewDate(formatDate(d));
  }

  function nextDay() {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 1);
    const today = new Date();
    if (d <= today) setViewDate(formatDate(d));
  }

  const isToday = viewDate === formatDate(new Date());
  const streak = (() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = formatDate(d);
      if (recentLogs.find(l => l.date.startsWith(ds))) s++;
      else break;
    }
    return s;
  })();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Tracker</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500 text-sm">Log your daily progress and reflections</p>
            {streak > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                🔥 {streak}-day streak
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main form */}
        <div className="col-span-2 space-y-5">
          {/* Date navigation */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <button onClick={prevDay} className="p-2 hover:bg-slate-100 rounded-lg transition"><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-center">
              <p className="font-semibold text-slate-900">
                {new Date(viewDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {isToday && <span className="text-xs text-indigo-600 font-medium">Today</span>}
              {log && !isToday && <span className="text-xs text-green-600 font-medium">✓ Logged</span>}
            </div>
            <button onClick={nextDay} disabled={isToday} className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>

          {/* Mood & Energy */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label><Smile className="w-3.5 h-3.5 inline mr-1" />Mood</Label>
                <div className="flex gap-2 mt-2">
                  {MOODS.map((emoji, i) => (
                    <button key={i} onClick={() => setForm(f => ({ ...f, mood: i + 1 }))}
                      className={`w-10 h-10 text-xl rounded-xl transition ${form.mood === i + 1 ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110' : 'hover:bg-slate-50'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label><Zap className="w-3.5 h-3.5 inline mr-1" />Energy</Label>
                <div className="flex gap-2 mt-2">
                  {ENERGY.map((emoji, i) => (
                    <button key={i} onClick={() => setForm(f => ({ ...f, energy: i + 1 }))}
                      className={`w-10 h-10 text-xl rounded-xl transition ${form.energy === i + 1 ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110' : 'hover:bg-slate-50'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-500" /> Today&apos;s Progress</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Applications Goal</Label>
                <input type="number" min="0" max="20" value={form.applicationsGoal}
                  onChange={e => setForm(f => ({ ...f, applicationsGoal: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-center font-semibold" />
              </div>
              <div>
                <Label>Applied Today</Label>
                <input type="number" min="0" max="20" value={form.applicationsDone}
                  onChange={e => setForm(f => ({ ...f, applicationsDone: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-center font-semibold" />
              </div>
              <div>
                <Label><BookOpen className="w-3 h-3 inline mr-1" />Study (min)</Label>
                <input type="number" min="0" max="600" step="15" value={form.studyMinutes}
                  onChange={e => setForm(f => ({ ...f, studyMinutes: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-center font-semibold" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Applications</span>
                <span>{form.applicationsDone}/{form.applicationsGoal}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (form.applicationsDone / Math.max(1, form.applicationsGoal)) * 100)}%` }} />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={form.exercised} onChange={e => setForm(f => ({ ...f, exercised: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600" />
              <span className="text-sm text-slate-700 flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5 text-slate-400" /> Exercised today</span>
            </label>
          </div>

          {/* Reflection */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Daily Reflection</h3>
            <div>
              <Label>🙏 Gratitude (3 things)</Label>
              <textarea rows={2} value={form.gratitude} onChange={e => setForm(f => ({ ...f, gratitude: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="1. Made progress on my ML project&#10;2. Got a recruiter message&#10;3. Learned something new about RAG" />
            </div>
            <div>
              <Label>🏆 Wins Today</Label>
              <textarea rows={2} value={form.wins} onChange={e => setForm(f => ({ ...f, wins: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="Applied to 3 roles, completed a LeetCode problem, refactored my portfolio project" />
            </div>
            <div>
              <Label><AlertCircle className="w-3 h-3 inline mr-1" />Blockers</Label>
              <textarea rows={2} value={form.blockers} onChange={e => setForm(f => ({ ...f, blockers: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="Not sure how to improve my resume ATS score..." />
            </div>
            <div>
              <Label><ArrowRight className="w-3 h-3 inline mr-1" />Tomorrow&apos;s Plan</Label>
              <textarea rows={2} value={form.tomorrowPlan} onChange={e => setForm(f => ({ ...f, tomorrowPlan: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="Apply to 5 roles, finish the fine-tuning tutorial, update GitHub README" />
            </div>
            <div>
              <Label>📝 Notes</Label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="Free-form thoughts for the day..." />
            </div>
          </div>

          <button onClick={save} disabled={saving}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? 'Saving...' : saved ? '✓ Saved!' : `Save ${isToday ? "Today's" : 'This'} Log`}
          </button>
        </div>

        {/* Sidebar - recent logs */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" /> Recent Logs
            </h3>
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No logs yet</p>
            ) : (
              <div className="space-y-2">
                {recentLogs.slice(0, 14).map(l => {
                  const d = new Date(l.date);
                  const ds = formatDate(d);
                  return (
                    <button key={l.id} onClick={() => setViewDate(ds)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition ${viewDate === ds ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'}`}>
                      <div>
                        <p className="text-xs font-medium text-slate-900">
                          {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500">{l.applicationsDone} apps · {l.studyMinutes}min</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{MOODS[l.mood - 1]}</span>
                        {l.exercised && <span className="text-xs">💪</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly summary */}
          {recentLogs.length > 0 && (() => {
            const weekLogs = recentLogs.slice(0, 7);
            const totalApps = weekLogs.reduce((s, l) => s + l.applicationsDone, 0);
            const totalStudy = weekLogs.reduce((s, l) => s + l.studyMinutes, 0);
            const exerciseDays = weekLogs.filter(l => l.exercised).length;
            const avgMood = weekLogs.reduce((s, l) => s + l.mood, 0) / weekLogs.length;
            return (
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-4 text-white">
                <h3 className="font-semibold text-sm mb-3">7-Day Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Applications</span>
                    <span className="font-semibold">{totalApps}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Study time</span>
                    <span className="font-semibold">{Math.round(totalStudy / 60)}h {totalStudy % 60}m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Exercise days</span>
                    <span className="font-semibold">{exerciseDays}/7</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Avg mood</span>
                    <span className="font-semibold">{MOODS[Math.round(avgMood) - 1]} {avgMood.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
