import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(resume);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.isDefault) {
    await prisma.resume.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }
  const resume = await prisma.resume.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.targetRole !== undefined && { targetRole: body.targetRole || null }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.skills !== undefined && { skills: body.skills || null }),
      ...(body.atsScore !== undefined && { atsScore: body.atsScore ? Number(body.atsScore) : null }),
      ...(body.isDefault !== undefined && { isDefault: Boolean(body.isDefault) }),
    },
  });
  return NextResponse.json(resume);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.resume.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
