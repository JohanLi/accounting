import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const accounts = await prisma.account.findMany({
      orderBy: {
        code: 'asc',
      },
    })

    res.status(200).json(accounts)
    return
  }

  if (req.method === 'PUT') {
    const { code, description } = req.body

    const account = await prisma.account.upsert({
      where: {
        code,
      },
      update: {
        description,
      },
      create: {
        code,
        description,
      },
    })

    res.status(200).json({ account })
    return
  }

  res.status(405)
}
