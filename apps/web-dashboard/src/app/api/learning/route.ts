import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ResourceType, ResourceStatus } from '@prisma/client';

export async function GET() {
  const resources = await prisma.learningResource.findMany({
    orderBy: [{ status: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
  });
  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, url, type, topic, status, priority, notes } = body;
  if (!title?.trim() || !type || !topic?.trim()) {
    return NextResponse.json({ error: 'title, type, and topic are required' }, { status: 400 });
  }
  const resource = await prisma.learningResource.create({
    data: {
      title: title.trim(),
      url: url?.trim() || null,
      type: type as ResourceType,
      topic: topic.trim(),
      status: (status as ResourceStatus) || ResourceStatus.NOT_STARTED,
      priority: Number(priority) || 2,
      notes: notes?.trim() || null,
    },
  });
  return NextResponse.json(resource, { status: 201 });
}
