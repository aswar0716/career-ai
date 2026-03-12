'use client';

import { useEffect, useState } from 'react';
import { Plus, X, ExternalLink, BookOpen, Check } from 'lucide-react';

const RESOURCE_TYPES = [
  { value: 'COURSE', label: 'Course', icon: '🎓' },
  { value: 'BOOK', label: 'Book', icon: '📚' },
  { value: 'PAPER', label: 'Paper', icon: '📄' },
  { value: 'VIDEO', label: 'Video', icon: '🎬' },
  { value: 'ARTICLE', label: 'Article', icon: '📰' },
  { value: 'PRACTICE', label: 'Practice', icon: '💻' },
];

const STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'bg-slate-100 text-slate-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'PAUSED', label: 'Paused', color: 'bg-yellow-100 text-yellow-700' },
];

const SUGGESTED = [
  { title: 'fast.ai Practical Deep Learning', type: 'COURSE', topic: 'Deep Learning', url: 'https://course.fast.ai' },
  { title: 'Attention Is All You Need', type: 'PAPER', topic: 'Transformers', url: 'https://arxiv.org/abs/1706.03762' },
  { title: 'LLM Bootcamp (Full Stack Deep Learning)', type: 'COURSE', topic: 'LLMs', url: 'https://fullstackdeeplearning.com/llm-bootcamp/' },
  { title: 'Hands-On Machine Learning (Géron)', type: 'BOOK', topic: 'ML', url: '' },
  { title: 'MLOps Zoomcamp', type: 'COURSE', topic: 'MLOps', url: 'https://github.com/DataTalksClub/mlops-zoomcamp' },
  { title: 'Deep Learning Specialization (Coursera)', type: 'COURSE', topic: 'Deep Learning', url: 'https://www.coursera.org/specializations/deep-learning' },
  { title: 'LoRA: Low-Rank Adaptation Paper', type: 'PAPER', topic: 'Fine-Tuning', url: 'https://arxiv.org/abs/2106.09685' },
  { title: 'LeetCode — ML Interview Problems', type: 'PRACTICE', topic: 'Interviews', url: 'https://leetcode.com' },
];

type Resource = {
  id: string;
  title: string;
  url: string | null;
  type: string;
  topic: string;
  status: string;
  priority: number;
  notes: string | null;
  completedAt: string | null;
};

const blank = { title: '', url: '', type: 'COURSE', topic: '', status: 'NOT_STARTED', priority: 2, notes: '' };

export default function LearningPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [topicFilter, setTopicFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/learning').then(r => r.json()).then(setResources);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const saved: Resource = await res.json();
      setResources(prev => [saved, ...prev]);
      setForm(blank);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/learning/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated: Resource = await res.json();
      setResources(prev => prev.map(r => r.id === id ? updated : r));
    }
  }

  async function del(id: string) {
    if (!confirm('Delete?')) return;
    await fetch(`/api/learning/${id}`, { method: 'DELETE' });
    setResources(prev => prev.filter(r => r.id !== id));
  }

  async function addSuggested(s: typeof SUGGESTED[0]) {
    const res = await fetch('/api/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, status: 'NOT_STARTED', priority: 2 }),
    });
    if (res.ok) {
      const saved: Resource = await res.json();
      setResources(prev => [saved, ...prev]);
    }
  }

  const topics = Array.from(new Set(resources.map(r => r.topic))).sort();

  const filtered = resources.filter(r => {
    const ms = statusFilter === 'ALL' || r.status === statusFilter;
    const mt = topicFilter === 'ALL' || r.topic === topicFilter;
    return ms && mt;
  });

  const counts = {
    total: resources.length,
    completed: resources.filter(r => r.status === 'COMPLETED').length,
    inProgress: resources.filter(r => r.status === 'IN_PROGRESS').length,
  };

  const getTypeInfo = (type: string) => RESOURCE_TYPES.find(t => t.value === type) ?? { icon: '📖', label: type };
  const getStatusInfo = (status: string) => STATUSES.find(s => s.value === status) ?? STATUSES[0];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Tracker</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {counts.completed} completed · {counts.inProgress} in progress · {counts.total} total
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      {/* Progress bar */}
      {counts.total > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Learning Progress</span>
            <span className="text-slate-500">{counts.completed}/{counts.total} completed</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
              style={{ width: `${(counts.completed / counts.total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-1.5">
          {['ALL', ...STATUSES.map(s => s.value)].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
              {s === 'ALL' ? 'All' : STATUSES.find(st => st.value === s)?.label}
            </button>
          ))}
        </div>
        {topics.length > 0 && (
          <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="ALL">All Topics</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Resources list */}
        <div className="col-span-2 space-y-3">
          {filtered.length === 0 && resources.length === 0 ? null : filtered.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-100">
              <p className="text-slate-400 text-sm">No resources match your filters</p>
            </div>
          ) : (
            filtered.map(r => {
              const typeInfo = getTypeInfo(r.type);
              const statusInfo = getStatusInfo(r.status);
              return (
                <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{typeInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{r.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{r.topic}</span>
                            <span className="text-xs text-slate-400">{typeInfo.label}</span>
                            {'•'.repeat(r.priority) && (
                              <span className="text-xs text-amber-500">{'★'.repeat(r.priority)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-indigo-300 ${statusInfo.color}`}>
                            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button onClick={() => del(r.id)} className="text-slate-300 hover:text-red-500 transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {r.notes && <p className="text-xs text-slate-500 mt-1.5">{r.notes}</p>}
                      {r.completedAt && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Completed {new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {resources.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-1">No resources yet.</p>
              <p className="text-xs text-slate-400 mb-4">Add courses, books, papers, and practice resources to track your AI/ML learning journey.</p>
              <button onClick={() => setShowForm(true)} className="text-indigo-600 text-sm hover:underline">+ Add a resource</button>
            </div>
          )}
        </div>

        {/* Sidebar - suggestions */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">🎯 Suggested for AI/ML</h3>
            <div className="space-y-2">
              {SUGGESTED.map((s, i) => {
                const alreadyAdded = resources.some(r => r.title === s.title);
                const typeInfo = getTypeInfo(s.type);
                return (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <span className="text-base">{typeInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 leading-tight">{s.title}</p>
                      <p className="text-xs text-slate-400">{s.topic}</p>
                    </div>
                    {alreadyAdded ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <button onClick={() => addSuggested(s)} className="text-indigo-600 hover:text-indigo-800 flex-shrink-0 text-xs font-medium">+ Add</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-lg">Add Learning Resource</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="fast.ai Practical Deep Learning" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Topic *</label>
                  <input required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="LLMs, MLOps, Math" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority (1-3)</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    <option value={1}>★ Low</option>
                    <option value={2}>★★ Medium</option>
                    <option value={3}>★★★ High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">URL</label>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
                  {saving ? 'Saving...' : 'Add Resource'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
