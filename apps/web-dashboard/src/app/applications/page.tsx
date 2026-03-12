'use client';

import { useEffect, useState } from 'react';
import { Plus, X, ExternalLink, ChevronDown, Search, Briefcase, Star } from 'lucide-react';

const STATUSES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  SCREENING: 'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  OFFER: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-400',
  MEDIUM: 'text-amber-500',
  HIGH: 'text-red-500',
};

type Resume = { id: string; name: string };
type CoverLetter = { id: string; name: string };

type Application = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  url: string | null;
  status: string;
  priority: string;
  appliedAt: string;
  notes: string | null;
  salary: string | null;
  contactName: string | null;
  contactEmail: string | null;
  nextAction: string | null;
  resume: Resume | null;
  coverLetter: CoverLetter | null;
};

const blank = {
  company: '', role: '', location: '', url: '', status: 'APPLIED',
  priority: 'MEDIUM', notes: '', salary: '', contactName: '', contactEmail: '',
  nextAction: '', resumeId: '', coverLetterId: '',
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/applications').then(r => r.json()).then(setApps);
    fetch('/api/resumes').then(r => r.json()).then(setResumes);
    fetch('/api/cover-letters').then(r => r.json()).then(setCoverLetters);
  }, []);

  const filtered = apps.filter(a => {
    const matchStatus = filter === 'ALL' || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const app = await res.json();
      setApps(prev => [app, ...prev]);
      setForm(blank);
      setShowForm(false);
    } else {
      const err = await res.json();
      alert(err.error);
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setApps(prev => prev.map(a => a.id === id ? updated : a));
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this application?')) return;
    await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    setApps(prev => prev.filter(a => a.id !== id));
  }

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter(a => a.status === s).length }), {} as Record<string, number>);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">{apps.length} total · {counts['INTERVIEW'] ?? 0} interviews · {counts['OFFER'] ?? 0} offers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Log Application
        </button>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['ALL', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === s
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            {s === 'ALL' ? `All (${apps.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search company or role..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-lg">Log New Application</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Company *</label>
                  <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="e.g. OpenAI" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role *</label>
                  <input required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="e.g. ML Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Remote / San Francisco" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Salary</label>
                  <input value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="$150k – $200k" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Job URL</label>
                  <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Name</label>
                  <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Recruiter name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Email</label>
                  <input value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="recruiter@company.com" />
                </div>
                {resumes.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Attach Resume</label>
                    <select value={form.resumeId} onChange={e => setForm(f => ({ ...f, resumeId: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                      <option value="">— none —</option>
                      {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                )}
                {coverLetters.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Attach Cover Letter</label>
                    <select value={form.coverLetterId} onChange={e => setForm(f => ({ ...f, coverLetterId: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                      <option value="">— none —</option>
                      {coverLetters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Next Action</label>
                  <input value={form.nextAction} onChange={e => setForm(f => ({ ...f, nextAction: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="e.g. Follow up on 2025-03-20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                  <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" placeholder="Job description highlights, requirements, etc." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Application'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No applications found.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-indigo-600 text-sm hover:underline">+ Log one now</button>
          </div>
        ) : (
          filtered.map(app => (
            <div key={app.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{app.company}</p>
                    <Star className={`w-3.5 h-3.5 flex-shrink-0 ${PRIORITY_COLORS[app.priority] ?? 'text-slate-300'}`} fill="currentColor" />
                  </div>
                  <p className="text-sm text-slate-500 truncate">{app.role}{app.location ? ` · ${app.location}` : ''}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {app.salary && <span className="text-xs text-slate-500 hidden md:block">{app.salary}</span>}
                  <select
                    value={app.status}
                    onChange={e => updateStatus(app.id, e.target.value)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-indigo-300 ${STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                  <span className="text-xs text-slate-400 hidden md:block">
                    {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {app.url && (
                    <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => setExpandedId(expandedId === app.id ? null : app.id)} className="text-slate-400 hover:text-slate-600">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`} />
                  </button>
                  <button onClick={() => del(app.id)} className="text-slate-300 hover:text-red-500 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded */}
              {expandedId === app.id && (
                <div className="px-5 pb-4 pt-0 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {app.contactName && (
                    <div><p className="text-slate-400 font-medium">Contact</p><p className="text-slate-700">{app.contactName}</p></div>
                  )}
                  {app.contactEmail && (
                    <div><p className="text-slate-400 font-medium">Email</p><p className="text-slate-700">{app.contactEmail}</p></div>
                  )}
                  {app.nextAction && (
                    <div><p className="text-slate-400 font-medium">Next Action</p><p className="text-slate-700">{app.nextAction}</p></div>
                  )}
                  {app.resume && (
                    <div><p className="text-slate-400 font-medium">Resume</p><p className="text-slate-700">{app.resume.name}</p></div>
                  )}
                  {app.coverLetter && (
                    <div><p className="text-slate-400 font-medium">Cover Letter</p><p className="text-slate-700">{app.coverLetter.name}</p></div>
                  )}
                  {app.notes && (
                    <div className="col-span-2 md:col-span-4">
                      <p className="text-slate-400 font-medium">Notes</p>
                      <p className="text-slate-700 mt-0.5 leading-relaxed whitespace-pre-wrap">{app.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
