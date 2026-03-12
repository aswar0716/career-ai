import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProjectType } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.githubUrl !== undefined && { githubUrl: body.githubUrl || null }),
      ...(body.demoUrl !== undefined && { demoUrl: body.demoUrl || null }),
      ...(body.paperUrl !== undefined && { paperUrl: body.paperUrl || null }),
      ...(body.techStack !== undefined && { techStack: body.techStack || null }),
      ...(body.highlights !== undefined && { highlights: body.highlights || null }),
      ...(body.type !== undefined && { type: body.type as ProjectType }),
      ...(body.featured !== undefined && { featured: Boolean(body.featured) }),
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
