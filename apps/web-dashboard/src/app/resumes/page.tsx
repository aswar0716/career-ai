'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Edit2, Star, FileText, Check } from 'lucide-react';

type Resume = {
  id: string;
  name: string;
  targetRole: string | null;
  content: string;
  skills: string | null;
  atsScore: number | null;
  isDefault: boolean;
  updatedAt: string;
};

const blank = { name: '', targetRole: '', content: '', skills: '', atsScore: '' };

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Resume | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch('/api/resumes').then(r => r.json()).then((data: Resume[]) => {
      setResumes(data);
      if (data.length > 0) setSelected(data.find(r => r.isDefault) ?? data[0]);
    });
  }, []);

  function openNew() {
    setEditing(null);
    setForm(blank);
    setShowForm(true);
  }

  function openEdit(r: Resume) {
    setEditing(r);
    setForm({ name: r.name, targetRole: r.targetRole ?? '', content: r.content, skills: r.skills ?? '', atsScore: r.atsScore?.toString() ?? '' });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/resumes/${editing.id}` : '/api/resumes';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, atsScore: form.atsScore ? Number(form.atsScore) : null }),
    });
    if (res.ok) {
      const saved: Resume = await res.json();
      setResumes(prev => editing ? prev.map(r => r.id === saved.id ? saved : r) : [saved, ...prev]);
      setSelected(saved);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function setDefault(id: string) {
    const res = await fetch(`/api/resumes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) {
      const saved: Resume = await res.json();
      setResumes(prev => prev.map(r => ({ ...r, isDefault: r.id === id })));
      setSelected(saved);
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this resume?')) return;
    await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
    setResumes(prev => {
      const updated = prev.filter(r => r.id !== id);
      setSelected(updated.length > 0 ? updated[0] : null);
      return updated;
    });
  }

  function renderMarkdown(text: string) {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-slate-800 mt-3 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="font-bold text-slate-900 text-lg mt-4 mb-1 border-b border-slate-200 pb-1">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="font-bold text-slate-900 text-xl mt-2 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className="flex h-screen">
      {/* Left panel - resume list */}
      <div className="w-72 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Resumes</h2>
          <button onClick={openNew} className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {resumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No resumes yet</p>
              <button onClick={openNew} className="mt-2 text-xs text-indigo-600 hover:underline">Create one</button>
            </div>
          ) : (
            resumes.map(r => (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className={`p-3 rounded-xl cursor-pointer transition ${selected?.id === r.id ? 'bg-indigo-50 border border-indigo-200' : 'border border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {r.isDefault && <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" fill="currentColor" />}
                      <p className="text-sm font-medium text-slate-900 truncate">{r.name}</p>
                    </div>
                    {r.targetRole && <p className="text-xs text-slate-500 truncate mt-0.5">{r.targetRole}</p>}
                  </div>
                  {r.atsScore != null && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${r.atsScore >= 80 ? 'bg-green-100 text-green-700' : r.atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                      {r.atsScore}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(r.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel - resume viewer/editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-900">{selected.name}</h1>
                  {selected.isDefault && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Default</span>}
                </div>
                {selected.targetRole && <p className="text-sm text-slate-500">{selected.targetRole}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreview(!preview)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${preview ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {preview ? 'Edit' : 'Preview'}
                </button>
                {!selected.isDefault && (
                  <button onClick={() => setDefault(selected.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1">
                    <Star className="w-3 h-3" /> Set Default
                  </button>
                )}
                <button onClick={() => openEdit(selected)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => del(selected.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selected.skills && (
              <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-2 flex gap-2 flex-wrap">
                {selected.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                  <span key={skill} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">{skill}</span>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-8">
              {preview ? (
                <div
                  className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-8 prose-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
                />
              ) : (
                <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <pre className="text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">{selected.content}</pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-3">Select a resume or create a new one</p>
              <button onClick={openNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                Create Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-lg">{editing ? 'Edit Resume' : 'New Resume'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Resume Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="ML Engineer Resume v2" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Role</label>
                  <input value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Machine Learning Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ATS Score (0-100)</label>
                  <input type="number" min="0" max="100" value={form.atsScore} onChange={e => setForm(f => ({ ...f, atsScore: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="85" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Key Skills (comma-separated)</label>
                  <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="PyTorch, LangChain, MLflow" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Content (Markdown) *</label>
                <p className="text-xs text-slate-400 mb-1">Use # for name, ## for sections, - for bullets, **bold**</p>
                <textarea required rows={18} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none font-mono"
                  placeholder={`# Your Name\nyour.email@example.com | linkedin.com/in/you | github.com/you\n\n## Summary\nML Engineer with 3+ years experience...\n\n## Experience\n### Company Name (2023 - Present)\n- Built a RAG pipeline that reduced query latency by 40%\n- Fine-tuned LLaMA-2 on domain data achieving 92% accuracy\n\n## Skills\nPyTorch, TensorFlow, HuggingFace, LangChain, MLflow, Docker`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Resume</>}
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
