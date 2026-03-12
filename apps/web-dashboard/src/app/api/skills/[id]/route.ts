import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SkillCategory, SkillLevel } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const skill = await prisma.skill.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.category !== undefined && { category: body.category as SkillCategory }),
      ...(body.level !== undefined && { level: body.level as SkillLevel }),
      ...(body.yearsExp !== undefined && { yearsExp: body.yearsExp ? Number(body.yearsExp) : null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
    },
  });
  return NextResponse.json(skill);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.skill.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
