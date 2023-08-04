import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { InferModel, isNull } from 'drizzle-orm'
import { Documents } from '../../schema'
import { getDates, getMonetaryValues, getPDFStrings } from '../../document'

export type PendingDocumentsResponse = (Pick<
  InferModel<typeof Documents>,
  'id' | 'filename'
> & {
  values: string[]
  dates: Date[]
})[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PendingDocumentsResponse>,
) {
  if (req.method !== 'GET') {
    res.status(405)
    return
  }

  const documents = await db
    .select()
    .from(Documents)
    .where(isNull(Documents.journalEntryId))

  res.status(200).json(
    await Promise.all(
      documents.map(async (document) => {
        const strings = await getPDFStrings(document.data)
        const values = getMonetaryValues(strings)
        const dates = getDates(strings)

        return {
          id: document.id,
          filename: document.filename,
          values,
          dates,
        }
      }),
    ),
  )
}
