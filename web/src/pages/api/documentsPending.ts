import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { Documents } from '../../schema'
import { getPdfHash } from '../../getPdfHash'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

export type UploadFile = {
  filename: string
  data: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PUT') {
    res.status(405)
    return
  }

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
    res.status(500).json({})
    return
  }
}
