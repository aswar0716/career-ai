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

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const updated = await prisma.jobApplication.update({
    where: { id },
    data: {
      ...(body.company !== undefined && { company: String(body.company).trim() }),
      ...(body.role !== undefined && { role: String(body.role).trim() }),
      ...(body.location !== undefined && { location: body.location?.trim() || null }),
      ...(body.url !== undefined && { url: body.url?.trim() || null }),
      ...(body.status !== undefined && { status: toStatus(body.status) }),
      ...(body.priority !== undefined && { priority: toPriority(body.priority) }),
      ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
      ...(body.salary !== undefined && { salary: body.salary?.trim() || null }),
      ...(body.contactName !== undefined && { contactName: body.contactName?.trim() || null }),
      ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail?.trim() || null }),
      ...(body.nextAction !== undefined && { nextAction: body.nextAction?.trim() || null }),
      ...(body.resumeId !== undefined && { resumeId: body.resumeId || null }),
      ...(body.coverLetterId !== undefined && { coverLetterId: body.coverLetterId || null }),
    },
    include: {
      resume: { select: { id: true, name: true } },
      coverLetter: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await prisma.jobApplication.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
