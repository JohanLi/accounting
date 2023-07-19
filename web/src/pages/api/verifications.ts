import type { NextApiRequest, NextApiResponse } from 'next'
import { asc, isNull, InferModel, isNotNull } from 'drizzle-orm'
import db from '../../db'
import {
  Verifications,
  Documents,
  Transactions,
  TransactionsBankTax,
} from '../../schema'

export type Verification = InferModel<typeof Verifications> & {
  documents: Pick<InferModel<typeof Documents>, 'id' | 'extension'>[]
  transactions: InferModel<typeof Transactions>[]
  hasLink: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Verification[]>,
) {
  if (req.method === 'GET') {
    const linkedVerificationIds = new Set(
      (
        await db
          .selectDistinct({
            verificationId: TransactionsBankTax.verificationId,
          })
          .from(TransactionsBankTax)
          .where(isNotNull(TransactionsBankTax.verificationId))
      ).map((t) => t.verificationId),
    )

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

    res.status(200).json(
      verifications.map((v) => ({
        ...v,
        hasLink: linkedVerificationIds.has(v.id),
      })),
    )
    return
  }

  res.status(405)
}
