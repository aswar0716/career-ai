import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ResourceType, ResourceStatus } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const resource = await prisma.learningResource.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.url !== undefined && { url: body.url || null }),
      ...(body.type !== undefined && { type: body.type as ResourceType }),
      ...(body.topic !== undefined && { topic: body.topic }),
      ...(body.status !== undefined && {
        status: body.status as ResourceStatus,
        completedAt: body.status === 'COMPLETED' ? new Date() : null,
      }),
      ...(body.priority !== undefined && { priority: Number(body.priority) }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
    },
  });
  return NextResponse.json(resource);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.learningResource.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
