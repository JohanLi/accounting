import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { eq, InferSelectModel } from 'drizzle-orm'
import { Documents } from '../../schema'
import { getPdfHash } from '../../getPdfHash'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

export type DocumentUpload = {
  filename: string
  data: string
}

export type DocumentsResponse = Pick<
  InferSelectModel<typeof Documents>,
  'id' | 'filename'
>[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DocumentsResponse>,
) {
  if (req.method === 'GET') {
    const id = parseInt(req.query.id as string)

    const document = await db.query.Documents.findFirst({
      where: eq(Documents.id, id),
    })

    if (!document) {
      throw Error(`Could not find document with id: ${id}`)
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.end(document.data)
    return
  }

  if (req.method === 'PUT') {
    const files = req.body as DocumentUpload[]

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

    const insertedDocuments = await db
      .insert(Documents)
      .values(documents)
      .onConflictDoNothing()
      .returning({ id: Documents.id, filename: Documents.filename })

    res.status(200).json(insertedDocuments)
    return
  }

  res.status(405)
}
