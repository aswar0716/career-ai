import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProjectType } from '@prisma/client';

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }] });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, githubUrl, demoUrl, paperUrl, techStack, highlights, type, featured } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      githubUrl: githubUrl?.trim() || null,
      demoUrl: demoUrl?.trim() || null,
      paperUrl: paperUrl?.trim() || null,
      techStack: techStack?.trim() || null,
      highlights: highlights?.trim() || null,
      type: (type as ProjectType) || ProjectType.PERSONAL,
      featured: Boolean(featured),
    },
  });
  return NextResponse.json(project, { status: 201 });
}
