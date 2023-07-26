import type { NextApiRequest, NextApiResponse } from 'next'
import { and, asc, eq, gte, lt, sql } from 'drizzle-orm'
import db from '../../db'
import { Accounts, Transactions, Verifications } from '../../schema'
import { getFiscalYear } from '../../utils'

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
    const fiscalYear = Number(req.query.fiscalYear)

    const { startInclusive, endExclusive } = getFiscalYear(fiscalYear)

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
      .where(
        and(
          gte(Verifications.date, startInclusive),
          lt(Verifications.date, endExclusive),
        ),
      )
      .groupBy(Accounts.code)
      .orderBy(asc(Accounts.code))

    res.status(200).json(accounts)
    return
  }

  res.status(405)
}
