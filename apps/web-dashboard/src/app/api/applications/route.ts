import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ALLOWED_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

type ApplicationStatus = (typeof ALLOWED_STATUSES)[number];

function toStatus(input: unknown): ApplicationStatus {
  const raw = String(input ?? "APPLIED").toUpperCase();
  return (ALLOWED_STATUSES as readonly string[]).includes(raw)
    ? (raw as ApplicationStatus)
    : "APPLIED";
}

export async function GET() {
  const apps = await prisma.jobApplication.findMany({
    orderBy: { appliedAt: "desc" },
  });

  return Response.json(apps);
}

export async function POST(req: Request) {
  const body = await req.json();

  const company = String(body.company ?? "").trim();
  const role = String(body.role ?? "").trim();

  if (!company || !role) {
    return new Response(
      JSON.stringify({ error: "company and role are required" }),
      { status: 400 }
    );
  }

  const status = toStatus(body.status);

  const created = await prisma.jobApplication.create({
    data: {
      company,
      role,
      location: body.location ? String(body.location).trim() : null,
      url: body.url ? String(body.url).trim() : null,
      status: status as any,
      notes: body.notes ? String(body.notes).trim() : null,
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
    },
  });

  return Response.json(created, { status: 201 });
}
