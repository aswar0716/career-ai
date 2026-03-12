import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const STATUSES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
type AppStatus = (typeof STATUSES)[number];
type AppPriority = (typeof PRIORITIES)[number];

function toStatus(v: unknown): AppStatus {
  const s = String(v ?? 'APPLIED').toUpperCase();
  return (STATUSES as readonly string[]).includes(s) ? (s as AppStatus) : 'APPLIED';
}
function toPriority(v: unknown): AppPriority {
  const s = String(v ?? 'MEDIUM').toUpperCase();
  return (PRIORITIES as readonly string[]).includes(s) ? (s as AppPriority) : 'MEDIUM';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status')?.toUpperCase();
  const validStatus = status && (STATUSES as readonly string[]).includes(status) ? (status as AppStatus) : null;

  const apps = await prisma.jobApplication.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    include: {
      resume: { select: { id: true, name: true } },
      coverLetter: { select: { id: true, name: true } },
    },
    orderBy: { appliedAt: 'desc' },
  });
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const company = String(body.company ?? '').trim();
  const role = String(body.role ?? '').trim();
  if (!company || !role) {
    return NextResponse.json({ error: 'company and role are required' }, { status: 400 });
  }
  const app = await prisma.jobApplication.create({
    data: {
      company,
      role,
      location: body.location?.trim() || null,
      url: body.url?.trim() || null,
      status: toStatus(body.status),
      priority: toPriority(body.priority),
      notes: body.notes?.trim() || null,
      salary: body.salary?.trim() || null,
      contactName: body.contactName?.trim() || null,
      contactEmail: body.contactEmail?.trim() || null,
      nextAction: body.nextAction?.trim() || null,
      resumeId: body.resumeId || null,
      coverLetterId: body.coverLetterId || null,
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
    },
    include: {
      resume: { select: { id: true, name: true } },
      coverLetter: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(app, { status: 201 });
}
