import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export type Total = {
  accountCode: number
  amount: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const totals: Total[] = (
      await prisma.transaction.groupBy({
        by: ['accountCode'],
        _sum: {
          amount: true,
        },
        where: {
          verification: {
            deletedAt: null,
          },
        },
        orderBy: {
          accountCode: 'asc',
        },
      })
    ).map((total) => ({
      accountCode: total.accountCode,
      amount: total._sum.amount || 0,
    }))

    res.status(200).json(totals)
    return
  }

  res.status(405)
}
