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
        code: 2640,
        description: 'Ingående moms',
      },
      {
        code: 2890,
        description: 'Övriga kortfristiga skulder',
      },
      {
        code: 3011,
        description: 'Försäljning inom Sverige 25%',
      },
      {
        code: 6212,
        description: 'Mobiltelefoni',
      },
      {
        code: 6570,
        description: 'Bankkostnader',
      },
      {
        code: 7699,
        description: 'Övriga personalkostnader',
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
