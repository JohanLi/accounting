import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.account.createMany({
    data: [
      {
        code: 1930,
        description: 'Företagskonto',
      },
      {
        code: 2610,
        description: 'Utgående moms 25%',
      },
      {
        code: 3011,
        description: 'Försäljning inom Sverige 25%',
      },
    ],
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
