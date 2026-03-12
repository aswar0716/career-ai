'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Edit2, ExternalLink, Star, Code2, Github } from 'lucide-react';

const SKILL_CATEGORIES = [
  { value: 'ML_FRAMEWORKS', label: 'ML Frameworks', color: 'bg-purple-100 text-purple-700' },
  { value: 'PYTHON_LIBS', label: 'Python Libraries', color: 'bg-blue-100 text-blue-700' },
  { value: 'LLM_TOOLS', label: 'LLM Tools', color: 'bg-violet-100 text-violet-700' },
  { value: 'MLOPS', label: 'MLOps', color: 'bg-orange-100 text-orange-700' },
  { value: 'CLOUD', label: 'Cloud', color: 'bg-sky-100 text-sky-700' },
  { value: 'PROGRAMMING', label: 'Programming', color: 'bg-green-100 text-green-700' },
  { value: 'DATA_ENGINEERING', label: 'Data Engineering', color: 'bg-amber-100 text-amber-700' },
  { value: 'TOOLS', label: 'Tools', color: 'bg-slate-100 text-slate-700' },
  { value: 'MATH_STATS', label: 'Math & Stats', color: 'bg-pink-100 text-pink-700' },
  { value: 'SOFT_SKILLS', label: 'Soft Skills', color: 'bg-teal-100 text-teal-700' },
];

const SKILL_LEVELS = [
  { value: 'LEARNING', label: 'Learning', width: '15%', color: 'bg-slate-300' },
  { value: 'BEGINNER', label: 'Beginner', width: '30%', color: 'bg-yellow-400' },
  { value: 'INTERMEDIATE', label: 'Intermediate', width: '55%', color: 'bg-blue-500' },
  { value: 'ADVANCED', label: 'Advanced', width: '80%', color: 'bg-indigo-600' },
  { value: 'EXPERT', label: 'Expert', width: '100%', color: 'bg-green-600' },
];

const PROJECT_TYPES = ['PERSONAL', 'OPEN_SOURCE', 'RESEARCH', 'PROFESSIONAL', 'COMPETITION'];

type Skill = { id: string; name: string; category: string; level: string; yearsExp: number | null; notes: string | null };
type Project = { id: string; name: string; description: string | null; githubUrl: string | null; demoUrl: string | null; paperUrl: string | null; techStack: string | null; highlights: string | null; type: string; featured: boolean };

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tab, setTab] = useState<'skills' | 'projects'>('skills');
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [skillForm, setSkillForm] = useState({ name: '', category: 'ML_FRAMEWORKS', level: 'BEGINNER', yearsExp: '', notes: '' });
  const [projForm, setProjForm] = useState({ name: '', description: '', githubUrl: '', demoUrl: '', paperUrl: '', techStack: '', highlights: '', type: 'PERSONAL', featured: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/skills').then(r => r.json()).then(setSkills);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  }, []);

  async function submitSkill(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingSkill ? `/api/skills/${editingSkill.id}` : '/api/skills';
    const res = await fetch(url, {
      method: editingSkill ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...skillForm, yearsExp: skillForm.yearsExp ? Number(skillForm.yearsExp) : null }),
    });
    if (res.ok) {
      const saved: Skill = await res.json();
      setSkills(prev => editingSkill ? prev.map(s => s.id === saved.id ? saved : s) : [...prev, saved]);
      setShowSkillForm(false);
    }
    setSaving(false);
  }

  async function submitProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
    const res = await fetch(url, {
      method: editingProject ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projForm),
    });
    if (res.ok) {
      const saved: Project = await res.json();
      setProjects(prev => editingProject ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]);
      setShowProjectForm(false);
    }
    setSaving(false);
  }

  async function delSkill(id: string) {
    if (!confirm('Delete skill?')) return;
    await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    setSkills(prev => prev.filter(s => s.id !== id));
  }

  async function delProject(id: string) {
    if (!confirm('Delete project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  const byCategory = SKILL_CATEGORIES.reduce((acc, cat) => {
    const catSkills = skills.filter(s => s.category === cat.value);
    if (catSkills.length > 0) acc[cat.value] = catSkills;
    return acc;
  }, {} as Record<string, Skill[]>);

  const getLevelInfo = (level: string) => SKILL_LEVELS.find(l => l.value === level) ?? SKILL_LEVELS[1];
  const getCatInfo = (cat: string) => SKILL_CATEGORIES.find(c => c.value === cat);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skills & Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5">{skills.length} skills · {projects.length} projects</p>
        </div>
        <button
          onClick={() => tab === 'skills' ? (setEditingSkill(null), setSkillForm({ name: '', category: 'ML_FRAMEWORKS', level: 'BEGINNER', yearsExp: '', notes: '' }), setShowSkillForm(true)) : (setEditingProject(null), setProjForm({ name: '', description: '', githubUrl: '', demoUrl: '', paperUrl: '', techStack: '', highlights: '', type: 'PERSONAL', featured: false }), setShowProjectForm(true))}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add {tab === 'skills' ? 'Skill' : 'Project'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
        {(['skills', 'projects'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'skills' ? (
        <div className="space-y-6">
          {Object.keys(byCategory).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
              <Code2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-3">No skills added yet. Start building your skill profile.</p>
              <button onClick={() => setShowSkillForm(true)} className="text-indigo-600 text-sm hover:underline">+ Add your first skill</button>
            </div>
          ) : (
            Object.entries(byCategory).map(([cat, catSkills]) => {
              const catInfo = getCatInfo(cat);
              return (
                <div key={cat} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catInfo?.color ?? 'bg-slate-100 text-slate-600'}`}>
                      {catInfo?.label ?? cat}
                    </span>
                    <span className="text-xs text-slate-400">{catSkills.length} skill{catSkills.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-3">
                    {catSkills.map(skill => {
                      const lvl = getLevelInfo(skill.level);
                      return (
                        <div key={skill.id} className="flex items-center gap-3">
                          <div className="w-36 flex-shrink-0">
                            <p className="text-sm font-medium text-slate-900">{skill.name}</p>
                            {skill.yearsExp && <p className="text-xs text-slate-400">{skill.yearsExp}y exp</p>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-slate-500">{lvl.label}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${lvl.color} rounded-full transition-all`} style={{ width: lvl.width }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => { setEditingSkill(skill); setSkillForm({ name: skill.name, category: skill.category, level: skill.level, yearsExp: skill.yearsExp?.toString() ?? '', notes: skill.notes ?? '' }); setShowSkillForm(true); }}
                              className="p-1.5 text-slate-300 hover:text-indigo-600 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => delSkill(skill.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-white rounded-xl border border-slate-100">
              <Github className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-3">No projects yet. Showcase your AI/ML work.</p>
              <button onClick={() => setShowProjectForm(true)} className="text-indigo-600 text-sm hover:underline">+ Add a project</button>
            </div>
          ) : (
            projects.map(p => (
              <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-5 ${p.featured ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.featured && <Star className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />}
                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingProject(p); setProjForm({ name: p.name, description: p.description ?? '', githubUrl: p.githubUrl ?? '', demoUrl: p.demoUrl ?? '', paperUrl: p.paperUrl ?? '', techStack: p.techStack ?? '', highlights: p.highlights ?? '', type: p.type, featured: p.featured }); setShowProjectForm(true); }}
                      className="p-1.5 text-slate-300 hover:text-indigo-600"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => delProject(p.id)} className="p-1.5 text-slate-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mb-2 inline-block">
                  {p.type.charAt(0) + p.type.slice(1).toLowerCase().replace('_', ' ')}
                </span>
                {p.description && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{p.description}</p>}
                {p.highlights && <p className="text-xs text-green-700 bg-green-50 rounded p-2 mt-2">{p.highlights}</p>}
                {p.techStack && (
                  <div className="flex gap-1 flex-wrap mt-3">
                    {p.techStack.split(',').map(t => t.trim()).filter(Boolean).map(tech => (
                      <span key={tech} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">{tech}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-3">
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"><Github className="w-3 h-3" /> GitHub</a>}
                  {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Demo</a>}
                  {p.paperUrl && <a href={p.paperUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Paper</a>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Skill Form Modal */}
      {showSkillForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">{editingSkill ? 'Edit Skill' : 'Add Skill'}</h2>
              <button onClick={() => setShowSkillForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitSkill} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Skill Name *</label>
                <input required value={skillForm.name} onChange={e => setSkillForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="e.g. PyTorch, LangChain, Docker" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
                <select value={skillForm.category} onChange={e => setSkillForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {SKILL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Level</label>
                <select value={skillForm.level} onChange={e => setSkillForm(f => ({ ...f, level: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {SKILL_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Years Experience</label>
                <input type="number" step="0.5" min="0" value={skillForm.yearsExp} onChange={e => setSkillForm(f => ({ ...f, yearsExp: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={2} value={skillForm.notes} onChange={e => setSkillForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Skill'}
                </button>
                <button type="button" onClick={() => setShowSkillForm(false)} className="px-5 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">{editingProject ? 'Edit Project' : 'Add Project'}</h2>
              <button onClick={() => setShowProjectForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitProject} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Project Name *</label>
                  <input required value={projForm.name} onChange={e => setProjForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="RAG Chat Assistant" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select value={projForm.type} onChange={e => setProjForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    {PROJECT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={projForm.featured} onChange={e => setProjForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded text-indigo-600" />
                    <span className="text-sm text-slate-700">Featured project</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                  <textarea rows={2} value={projForm.description} onChange={e => setProjForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" placeholder="Built a RAG pipeline using LangChain + FAISS to answer questions over internal docs" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Key Highlights / Metrics</label>
                  <input value={projForm.highlights} onChange={e => setProjForm(f => ({ ...f, highlights: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Reduced latency by 40%, 95% accuracy on held-out eval" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tech Stack (comma-separated)</label>
                  <input value={projForm.techStack} onChange={e => setProjForm(f => ({ ...f, techStack: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Python, LangChain, FAISS, FastAPI, Docker" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">GitHub URL</label>
                  <input value={projForm.githubUrl} onChange={e => setProjForm(f => ({ ...f, githubUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Demo URL</label>
                  <input value={projForm.demoUrl} onChange={e => setProjForm(f => ({ ...f, demoUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Paper URL (optional)</label>
                  <input value={projForm.paperUrl} onChange={e => setProjForm(f => ({ ...f, paperUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="https://arxiv.org/..." />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
                <button type="button" onClick={() => setShowProjectForm(false)} className="px-5 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
