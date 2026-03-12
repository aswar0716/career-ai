'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase, FileText, Mail, Code2, CalendarDays, BookOpen,
  TrendingUp, Target, Award, Clock, ChevronRight, Flame,
  CheckCircle2, BarChart3, Sparkles,
} from 'lucide-react';

const QUOTES = [
  { q: 'The best time to plant a tree was 20 years ago. The second best time is now.', a: 'Chinese Proverb' },
  { q: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', a: 'Winston Churchill' },
  { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
  { q: "Don't watch the clock; do what it does. Keep going.", a: 'Sam Levenson' },
  { q: "Believe you can and you're halfway there.", a: 'Theodore Roosevelt' },
  { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
  { q: "You don't have to be great to start, but you have to start to be great.", a: 'Zig Ziglar' },
  { q: 'The future belongs to those who learn more skills and combine them in creative ways.', a: 'Robert Greene' },
  { q: 'AI/ML engineers are not born — they are built, one project at a time.', a: 'Career.AI' },
  { q: 'Every rejection is a redirect toward the right opportunity.', a: 'Career.AI' },
  { q: 'Your GitHub is your resume. Build in public.', a: 'Career.AI' },
  { q: 'Consistency beats intensity. Apply daily, learn daily, grow daily.', a: 'Career.AI' },
  { q: 'The models you build today open doors tomorrow.', a: 'Career.AI' },
  { q: 'Data speaks louder than words. Let your projects do the talking.', a: 'Career.AI' },
];

const ML_TIPS = [
  { tip: 'Fine-tune an open-source LLM on a custom dataset for your portfolio', tag: 'Projects' },
  { tip: "Write system design docs for your ML projects — interviewers love this", tag: 'Interviews' },
  { tip: 'Add metrics to your resume: "Reduced inference latency by 40%"', tag: 'Resume' },
  { tip: "Contribute to HuggingFace transformers or datasets — it's visible to recruiters", tag: 'Open Source' },
  { tip: 'Get comfortable with MLflow or W&B for experiment tracking', tag: 'MLOps' },
  { tip: 'Study LLM papers: Attention is All You Need, RLHF, LoRA, RAG', tag: 'Research' },
  { tip: 'Deploy at least one model to production — even a simple FastAPI + HuggingFace', tag: 'Deployment' },
  { tip: 'Practice ML system design: recommendation systems, search ranking, content moderation', tag: 'Interviews' },
  { tip: 'Set up a personal website with your portfolio — GitHub Pages is free', tag: 'Portfolio' },
  { tip: 'Learn Docker + basic Kubernetes — most ML engineer roles expect this', tag: 'MLOps' },
  { tip: 'Practice explaining your ML projects like a story: problem → approach → result', tag: 'Interviews' },
  { tip: 'Network 1:1 with AI engineers — most jobs are referral-driven', tag: 'Networking' },
  { tip: 'Write a blog post about an ML project — it shows depth and communication skills', tag: 'Content' },
  { tip: 'Track your applications and follow up after 7 days of silence', tag: 'Strategy' },
];

type RecentApp = { id: string; company: string; role: string; status: string; appliedAt: string };
type TodayLog = { applicationsDone: number; applicationsGoal: number; studyMinutes: number } | null;

type Stats = {
  total: number;
  interview: number;
  offer: number;
  responseRate: number;
  appliedThisWeek: number;
  todayLog: TodayLog;
  recentApps: RecentApp[];
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    APPLIED: 'bg-blue-100 text-blue-700',
    SCREENING: 'bg-yellow-100 text-yellow-700',
    INTERVIEW: 'bg-purple-100 text-purple-700',
    OFFER: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    WITHDRAWN: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const today = new Date();
  const dayIndex = today.getDate() + today.getMonth() * 31;
  const quote = QUOTES[dayIndex % QUOTES.length];
  const tip = ML_TIPS[dayIndex % ML_TIPS.length];

  useEffect(() => {
    async function load() {
      const dateStr = today.toISOString().split('T')[0];
      const [appsRes, logRes] = await Promise.all([
        fetch('/api/applications'),
        fetch(`/api/daily-logs?date=${dateStr}`),
      ]);
      const apps = appsRes.ok ? await appsRes.json() : [];
      const logData = logRes.ok ? await logRes.json() : null;

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const interviews = apps.filter((a: RecentApp) => a.status === 'INTERVIEW').length;
      const offers = apps.filter((a: RecentApp) => a.status === 'OFFER').length;
      const responded = apps.filter((a: RecentApp) =>
        ['SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(a.status)
      ).length;
      const thisWeek = apps.filter((a: RecentApp) => new Date(a.appliedAt) >= weekAgo).length;

      setStats({
        total: apps.length,
        interview: interviews,
        offer: offers,
        responseRate: apps.length > 0 ? Math.round((responded / apps.length) * 100) : 0,
        appliedThisWeek: thisWeek,
        todayLog: logData,
        recentApps: apps.slice(0, 5),
      });
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    { label: 'Total Applied', value: stats?.total ?? '—', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Interviews', value: stats?.interview ?? '—', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Offers', value: stats?.offer ?? '—', icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Response Rate', value: stats ? `${stats.responseRate}%` : '—', icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'This Week', value: stats?.appliedThisWeek ?? '—', icon: Flame, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const quickLinks = [
    { href: '/applications', label: 'Log Application', icon: Briefcase, color: 'bg-blue-600' },
    { href: '/resumes', label: 'Edit Resume', icon: FileText, color: 'bg-indigo-600' },
    { href: '/cover-letters', label: 'Cover Letter', icon: Mail, color: 'bg-violet-600' },
    { href: '/skills', label: 'Update Skills', icon: Code2, color: 'bg-emerald-600' },
    { href: '/daily', label: "Daily Check-in", icon: CalendarDays, color: 'bg-rose-600' },
    { href: '/learning', label: 'Track Learning', icon: BookOpen, color: 'bg-amber-600' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm mb-1">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          {getGreeting()}! Let&apos;s land that AI/ML role. 🚀
        </h1>
      </div>

      {/* Motivation Quote */}
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-80" />
          <div>
            <p className="text-lg font-medium leading-relaxed">&ldquo;{quote.q}&rdquo;</p>
            <p className="mt-2 text-indigo-200 text-sm">— {quote.a}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Today's Progress */}
        <div className="col-span-1 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Today&apos;s Focus
            </h2>
            <Link href="/daily" className="text-xs text-indigo-600 hover:underline">Log →</Link>
          </div>
          {stats?.todayLog ? (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Applications</span>
                  <span className="font-medium">
                    {stats.todayLog.applicationsDone}/{stats.todayLog.applicationsGoal}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (stats.todayLog.applicationsDone / Math.max(1, stats.todayLog.applicationsGoal)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Study time</span>
                  <span className="font-medium">{stats.todayLog.studyMinutes} min</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (stats.todayLog.studyMinutes / 120) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-3">No log yet today.</p>
              <Link
                href="/daily"
                className="inline-block bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Start Daily Check-in
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${l.color} flex items-center justify-center shadow-sm`}>
                  <l.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center group-hover:text-indigo-700">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Recent Applications
            </h2>
            <Link href="/applications" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {stats && stats.recentApps.length > 0 ? (
            <div className="space-y-1">
              {stats.recentApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{app.company}</p>
                    <p className="text-xs text-slate-500">{app.role}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-slate-400">
                      {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm mb-3">No applications yet. Start applying!</p>
              <Link
                href="/applications"
                className="inline-block bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Log First Application
              </Link>
            </div>
          )}
        </div>

        {/* AI/ML Career Tip */}
        <div className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h2 className="font-semibold text-sm">AI/ML Career Tip</h2>
          </div>
          <span className="inline-block text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full mb-3">
            {tip.tag}
          </span>
          <p className="text-sm text-slate-300 leading-relaxed">{tip.tip}</p>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">New tip every day — come back tomorrow!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
