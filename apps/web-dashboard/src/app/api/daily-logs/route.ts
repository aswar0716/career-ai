import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');
  if (dateStr) {
    const start = new Date(dateStr);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setUTCHours(23, 59, 59, 999);
    const log = await prisma.dailyLog.findFirst({ where: { date: { gte: start, lte: end } } });
    return NextResponse.json(log);
  }
  const logs = await prisma.dailyLog.findMany({ orderBy: { date: 'desc' }, take: 30 });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, mood, energy, applicationsGoal, applicationsDone, studyMinutes, exercised, notes, gratitude, wins, blockers, tomorrowPlan } = body;
  const d = new Date(date || new Date().toISOString().split('T')[0]);
  d.setUTCHours(12, 0, 0, 0);

  const log = await prisma.dailyLog.upsert({
    where: { date: d },
    create: {
      date: d,
      mood: Number(mood) || 3,
      energy: Number(energy) || 3,
      applicationsGoal: Number(applicationsGoal) || 3,
      applicationsDone: Number(applicationsDone) || 0,
      studyMinutes: Number(studyMinutes) || 0,
      exercised: Boolean(exercised),
      notes: notes?.trim() || null,
      gratitude: gratitude?.trim() || null,
      wins: wins?.trim() || null,
      blockers: blockers?.trim() || null,
      tomorrowPlan: tomorrowPlan?.trim() || null,
    },
    update: {
      mood: Number(mood) || 3,
      energy: Number(energy) || 3,
      applicationsGoal: Number(applicationsGoal) || 3,
      applicationsDone: Number(applicationsDone) || 0,
      studyMinutes: Number(studyMinutes) || 0,
      exercised: Boolean(exercised),
      notes: notes?.trim() || null,
      gratitude: gratitude?.trim() || null,
      wins: wins?.trim() || null,
      blockers: blockers?.trim() || null,
      tomorrowPlan: tomorrowPlan?.trim() || null,
    },
  });
  return NextResponse.json(log, { status: 201 });
}
