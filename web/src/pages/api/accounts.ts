import type { NextApiRequest, NextApiResponse } from 'next'
import { asc, eq, isNull, sql } from 'drizzle-orm'
import db from '../../db'
import { Accounts, Transactions, Verifications } from '../../schema'

export type AccountsResponse = {
  code: number
  description: string
  total: number
}[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AccountsResponse>,
) {
  if (req.method === 'GET') {
    const accounts = await db
      .select({
        code: Accounts.code,
        description: Accounts.description,
        total: sql<number>`sum(amount)`,
      })
      .from(Accounts)
      .leftJoin(Transactions, eq(Accounts.code, Transactions.accountCode))
      .leftJoin(
        Verifications,
        eq(Transactions.verificationId, Verifications.id),
      )
      .groupBy(Accounts.code)
      .orderBy(asc(Accounts.code))

    res.status(200).json(accounts)
    return
  }

  res.status(405)
}
