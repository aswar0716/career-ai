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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where =
    status &&
    (ALLOWED_STATUSES as readonly string[]).includes(status.toUpperCase())
      ? { status: status.toUpperCase() as any }
      : undefined

  const apps = await prisma.jobApplication.findMany({
    where,
    orderBy: { appliedAt: 'desc' },
  })

  return Response.json(apps)
}

export async function POST(req: Request) {
  const body = await req.json()

  const company = String(body.company ?? '').trim()
  const role = String(body.role ?? '').trim()

  if (!company || !role) {
    return new Response(
      JSON.stringify({ error: 'company and role are required' }),
      {
        status: 400,
      },
    )
  }

  const created = await prisma.jobApplication.create({
    data: {
      company,
      role,
      location: body.location ? String(body.location).trim() : null,
      url: body.url ? String(body.url).trim() : null,
      status: toStatus(body.status) as any,
      notes: body.notes ? String(body.notes).trim() : null,
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
    },
  })

  return Response.json(created, { status: 201 })
}
