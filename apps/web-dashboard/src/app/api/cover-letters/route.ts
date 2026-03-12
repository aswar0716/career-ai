import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const letters = await prisma.coverLetter.findMany({
    include: { resume: { select: { id: true, name: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(letters);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, content, jobTitle, company, resumeId } = body;
  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'name and content are required' }, { status: 400 });
  }
  const letter = await prisma.coverLetter.create({
    data: {
      name: name.trim(),
      content: content.trim(),
      jobTitle: jobTitle?.trim() || null,
      company: company?.trim() || null,
      resumeId: resumeId || null,
    },
    include: { resume: { select: { id: true, name: true } } },
  });
  return NextResponse.json(letter, { status: 201 });
}
