import type { NextApiRequest, NextApiResponse } from 'next'
import {
  Transaction,
  Document,
  Verification,
} from '@prisma/client'
import { prisma } from '../../db'

export type VerificationWithTransactionsAndDocuments = Verification & {
  transactions: Transaction[]
  documents: Pick<Document, 'id' | 'extension'>[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationWithTransactionsAndDocuments[]>,
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
        documents: {
          select: {
            id: true,
            extension: true,
          },
        },
      },
    })

    res.status(200).json(verifications)
    return
  }

  res.status(405)
}
