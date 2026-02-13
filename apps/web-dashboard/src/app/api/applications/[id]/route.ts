import { prisma } from '@/lib/prisma'

const ALLOWED_STATUSES = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
] as const

type ApplicationStatus = (typeof ALLOWED_STATUSES)[number]

function toStatus(input: unknown): ApplicationStatus {
  const raw = String(input ?? 'APPLIED').toUpperCase()
  return (ALLOWED_STATUSES as readonly string[]).includes(raw)
    ? (raw as ApplicationStatus)
    : 'APPLIED'
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  const body = await req.json()

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: {
      status: body.status ? (toStatus(body.status) as any) : undefined,
      notes:
        body.notes !== undefined
          ? String(body.notes).trim() || null
          : undefined,
      url: body.url !== undefined ? String(body.url).trim() || null : undefined,
      location:
        body.location !== undefined
          ? String(body.location).trim() || null
          : undefined,
      role: body.role !== undefined ? String(body.role).trim() : undefined,
      company:
        body.company !== undefined ? String(body.company).trim() : undefined,
    },
  })

  return Response.json(updated)
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params

  await prisma.jobApplication.delete({ where: { id } })

  return new Response(null, { status: 204 })
}
