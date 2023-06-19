import type { NextApiRequest, NextApiResponse } from 'next'
import { asc, isNull, InferModel } from 'drizzle-orm'
import db from '../../db'
import { Verifications, Documents, Transactions } from '../../schema'

export type Verification = InferModel<typeof Verifications> & {
  documents: Pick<InferModel<typeof Documents>, 'id' | 'extension'>[]
  transactions: InferModel<typeof Transactions>[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Verification[]>,
) {
  if (req.method === 'GET') {
    const verifications = await db.query.Verifications.findMany({
      with: {
        transactions: true,
        documents: {
          columns: {
            id: true,
            extension: true,
          },
        },
      },
      where: isNull(Verifications.deletedAt),
      orderBy: asc(Verifications.date),
    })

    res.status(200).json(verifications)
    return
  }

  res.status(405)
}
