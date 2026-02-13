import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.jobApplication.upsert({
    where: { company_role: { company: 'ExampleCo', role: 'AI Engineer' } },
    update: {
      status: 'APPLIED' as any,
      location: 'Melbourne',
    },
    create: {
      company: 'ExampleCo',
      role: 'AI Engineer',
      status: 'APPLIED' as any,
      location: 'Melbourne',
    },
  })

  await prisma.jobApplication.upsert({
    where: {
      company_role: { company: 'VisionLabs', role: 'Computer Vision Engineer' },
    },
    update: {
      status: 'SCREENING' as any,
      location: 'Remote',
    },
    create: {
      company: 'VisionLabs',
      role: 'Computer Vision Engineer',
      status: 'SCREENING' as any,
      location: 'Remote',
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
