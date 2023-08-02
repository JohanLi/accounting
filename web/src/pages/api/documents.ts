import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { eq } from 'drizzle-orm'
import { JournalEntryDocuments } from '../../schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const id = parseInt(req.query.id as string)

    const document = await db.query.JournalEntryDocuments.findFirst({
      where: eq(JournalEntryDocuments.id, id),
    })

    if (!document) {
      throw Error(`Could not find document with id: ${id}`)
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.end(document.data)
    return
  }

  res.status(405)
}
