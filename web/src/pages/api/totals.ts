import type { NextApiRequest, NextApiResponse } from 'next'
import { asc, eq, isNull, sql } from 'drizzle-orm'
import db from '../../db'
import { Transactions, Verifications } from '../../schema'

export type Total = {
  accountCode: number
  amount: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Total[]>,
) {
  if (req.method === 'GET') {
    const totals = await db
      .select({
        accountCode: Transactions.accountCode,
        amount: sql<number>`sum(amount)`,
      })
      .from(Transactions)
      .leftJoin(
        Verifications,
        eq(Transactions.verificationId, Verifications.id),
      )
      .groupBy(Transactions.accountCode)
      .orderBy(asc(Transactions.accountCode))

    res.status(200).json(totals)
    return
  }

  res.status(405)
}
