'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Mail,
  Code2,
  CalendarDays,
  BookOpen,
  Zap,
  TrendingUp,
} from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: Briefcase },
  { href: '/resumes', label: 'Resumes', icon: FileText },
  { href: '/cover-letters', label: 'Cover Letters', icon: Mail },
  { href: '/skills', label: 'Skills & Projects', icon: Code2 },
  { href: '/daily', label: 'Daily Tracker', icon: CalendarDays },
  { href: '/learning', label: 'Learning', icon: BookOpen },
];

const tips = [
  'Tailor each resume to the JD.',
  'Contribute to open-source ML repos.',
  'Write about your projects on LinkedIn.',
  'Apply to 3-5 roles daily, consistently.',
  'Follow up after 1 week of silence.',
  'Quantify your ML model results.',
  'Network with AI engineers on LinkedIn.',
  'Build in public — share your projects.',
  'LeetCode daily keeps rejections away.',
  'Star quality > spray-and-pray.',
];

export default function Sidebar() {
  const pathname = usePathname();
  const tip = tips[new Date().getDate() % tips.length];

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-slate-900 flex flex-col z-30 border-r border-slate-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Career.AI</p>
            <p className="text-slate-500 text-xs mt-0.5">Job Hunt HQ</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Daily Tip */}
      <div className="px-4 pb-4">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3 h-3 text-indigo-400" />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Daily Tip</p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
        </div>
      </div>
    </aside>
  );
}
