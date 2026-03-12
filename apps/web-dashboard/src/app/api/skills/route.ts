import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SkillCategory, SkillLevel } from '@prisma/client';

export async function GET() {
  const skills = await prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, category, level, yearsExp, notes } = body;
  if (!name?.trim() || !category) {
    return NextResponse.json({ error: 'name and category are required' }, { status: 400 });
  }
  const skill = await prisma.skill.create({
    data: {
      name: name.trim(),
      category: category as SkillCategory,
      level: (level as SkillLevel) || SkillLevel.BEGINNER,
      yearsExp: yearsExp ? Number(yearsExp) : null,
      notes: notes?.trim() || null,
    },
  });
  return NextResponse.json(skill, { status: 201 });
}
