'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Edit2, Mail, Link2 } from 'lucide-react';

type Resume = { id: string; name: string };
type CoverLetter = {
  id: string;
  name: string;
  content: string;
  jobTitle: string | null;
  company: string | null;
  resumeId: string | null;
  resume: Resume | null;
  updatedAt: string;
};

const blank = { name: '', content: '', jobTitle: '', company: '', resumeId: '' };

const TEMPLATE = `Dear Hiring Manager,

I am writing to express my strong interest in the [Role] position at [Company]. As an AI/ML engineer with hands-on experience in [relevant skills], I am excited by the opportunity to contribute to your team.

In my previous work, I [key achievement with metrics — e.g., "built a RAG pipeline that reduced query latency by 40%"]. I have a deep passion for [specific area relevant to the role], and I believe this aligns well with [Company]'s focus on [company's AI/ML direction].

My technical expertise includes:
- [Skill 1, e.g., PyTorch, TensorFlow, HuggingFace]
- [Skill 2, e.g., LLM fine-tuning, RAG systems, MLOps]
- [Skill 3, e.g., Python, FastAPI, Docker, Kubernetes]

I am particularly drawn to [Company] because [specific reason — research, product, mission]. I would love to bring my experience in [specific area] to help [specific goal].

I have attached my resume and portfolio. I would welcome the opportunity to discuss how I can contribute to your team.

Best regards,
[Your Name]
[LinkedIn] | [GitHub] | [Email]`;

export default function CoverLettersPage() {
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<CoverLetter | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CoverLetter | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/cover-letters').then(r => r.json()).then((data: CoverLetter[]) => {
      setLetters(data);
      if (data.length > 0) setSelected(data[0]);
    });
    fetch('/api/resumes').then(r => r.json()).then(setResumes);
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ ...blank, content: TEMPLATE });
    setShowForm(true);
  }

  function openEdit(l: CoverLetter) {
    setEditing(l);
    setForm({ name: l.name, content: l.content, jobTitle: l.jobTitle ?? '', company: l.company ?? '', resumeId: l.resumeId ?? '' });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/cover-letters/${editing.id}` : '/api/cover-letters';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const saved: CoverLetter = await res.json();
      setLetters(prev => editing ? prev.map(l => l.id === saved.id ? saved : l) : [saved, ...prev]);
      setSelected(saved);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Delete this cover letter?')) return;
    await fetch(`/api/cover-letters/${id}`, { method: 'DELETE' });
    setLetters(prev => {
      const updated = prev.filter(l => l.id !== id);
      setSelected(updated.length > 0 ? updated[0] : null);
      return updated;
    });
  }

  return (
    <div className="flex h-screen">
      {/* Left panel */}
      <div className="w-72 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Cover Letters</h2>
          <button onClick={openNew} className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {letters.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No cover letters yet</p>
              <button onClick={openNew} className="mt-2 text-xs text-indigo-600 hover:underline">Create from template</button>
            </div>
          ) : (
            letters.map(l => (
              <div
                key={l.id}
                onClick={() => setSelected(l)}
                className={`p-3 rounded-xl cursor-pointer transition ${selected?.id === l.id ? 'bg-indigo-50 border border-indigo-200' : 'border border-slate-100 hover:border-slate-200'}`}
              >
                <p className="text-sm font-medium text-slate-900 truncate">{l.name}</p>
                {(l.jobTitle || l.company) && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {[l.jobTitle, l.company].filter(Boolean).join(' @ ')}
                  </p>
                )}
                {l.resume && (
                  <div className="flex items-center gap-1 mt-1">
                    <Link2 className="w-2.5 h-2.5 text-indigo-400" />
                    <span className="text-xs text-indigo-600 truncate">{l.resume.name}</span>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(l.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="font-bold text-slate-900">{selected.name}</h1>
                {(selected.jobTitle || selected.company) && (
                  <p className="text-sm text-slate-500">{[selected.jobTitle, selected.company].filter(Boolean).join(' @ ')}</p>
                )}
                {selected.resume && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Link2 className="w-3 h-3 text-indigo-500" />
                    <span className="text-xs text-indigo-600">Linked to: {selected.resume.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(selected)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => del(selected.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{selected.content}</pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-3">Select a cover letter or create one from template</p>
              <button onClick={openNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                Use Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-lg">{editing ? 'Edit Cover Letter' : 'New Cover Letter'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Letter Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="OpenAI ML Engineer — March 2025" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
                  <input value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Machine Learning Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
                  <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="OpenAI" />
                </div>
                {resumes.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Link to Resume</label>
                    <select value={form.resumeId} onChange={e => setForm(f => ({ ...f, resumeId: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                      <option value="">— none —</option>
                      {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Content *</label>
                <textarea required rows={20} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none font-sans" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Cover Letter'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
