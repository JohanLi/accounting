import type { NextApiRequest, NextApiResponse } from 'next'
import { asc } from 'drizzle-orm'
import db from '../../db'
import { Accounts } from '../../schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const accounts = await db.query.Accounts.findMany({
      orderBy: asc(Accounts.code),
    })

    res.status(200).json(accounts)
    return
  }

  if (req.method === 'PUT') {
    const { code, description } = req.body

    const account = (
      await db
        .insert(Accounts)
        .values({ code, description })
        .onConflictDoUpdate({
          target: Accounts.code,
          set: { description },
        })
        .returning()
    )[0]

    res.status(200).json({ account })
    return
  }

  res.status(405)
}
