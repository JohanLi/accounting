import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const verifications = await prisma.verification.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        transactions: true,
        documents: true,
      },
    })

    res.status(200).json(verifications)
    return
  }

  res.status(405)
}
