import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { Documents } from '../../schema'
import { getPdfHash } from '../../getPdfHash'
import { InferModel, isNull } from 'drizzle-orm'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

export type PendingDocumentsResponse = Pick<
  InferModel<typeof Documents>,
  'id' | 'filename'
>[]

type UploadFile = {
  filename: string
  data: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PendingDocumentsResponse>,
) {
  if (req.method === 'GET') {
    const documents = await db
      .select({
        id: Documents.id,
        filename: Documents.filename,
      })
      .from(Documents)
      .where(isNull(Documents.journalEntryId))

    res.status(200).json(documents)
    return
  }

  if (req.method === 'PUT') {
    const files = req.body as UploadFile[]

    const documents = await Promise.all(
      files.map(async (file) => {
        const data = Buffer.from(file.data, 'base64')

        return {
          filename: file.filename,
          data,
          hash: await getPdfHash(data),
        }
      }),
    )

    try {
      const insertedDocuments = await db
        .insert(Documents)
        .values(documents)
        .onConflictDoNothing()
        .returning()

      res.status(200).json(insertedDocuments)
    } catch (e) {
      console.error(e)
      res.status(500)
      return
    }
  }

  res.status(405)
}
