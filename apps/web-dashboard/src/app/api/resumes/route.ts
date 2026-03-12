import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const resumes = await prisma.resume.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(resumes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, targetRole, content, skills, atsScore, isDefault } = body;
  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'name and content are required' }, { status: 400 });
  }
  if (isDefault) {
    await prisma.resume.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }
  const resume = await prisma.resume.create({
    data: {
      name: name.trim(),
      targetRole: targetRole?.trim() || null,
      content: content.trim(),
      skills: skills?.trim() || null,
      atsScore: atsScore ? Number(atsScore) : null,
      isDefault: Boolean(isDefault),
    },
  });
  return NextResponse.json(resume, { status: 201 });
}
