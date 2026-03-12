import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const letter = await prisma.coverLetter.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle || null }),
      ...(body.company !== undefined && { company: body.company || null }),
      ...(body.resumeId !== undefined && { resumeId: body.resumeId || null }),
    },
    include: { resume: { select: { id: true, name: true } } },
  });
  return NextResponse.json(letter);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.coverLetter.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
