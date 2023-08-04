import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { eq, InferModel, isNull } from 'drizzle-orm'
import {
  JournalEntries,
  Documents,
  JournalEntryTransactions,
} from '../../schema'
import { getPdfHash } from '../../getPdfHash'
import { documentToTransactions, parseDetails } from '../../document'

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

export type DocumentsResponse = Pick<
  InferModel<typeof Documents>,
  'id' | 'filename'
>[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DocumentsResponse>,
) {
  if (req.method === 'GET') {
    const id = parseInt(req.query.id as string)

    if (id) {
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

    const insertedDocuments = await db.transaction(async (tx) => {
      const insertedDocuments = await tx
        .insert(Documents)
        .values(documents)
        .onConflictDoNothing()
        .returning()

      const journalEntryDocuments = (
        await Promise.all(
          insertedDocuments.map(async (document) => ({
            ...document,
            details: await parseDetails(document.data),
          })),
        )
      ).filter((document) => document.details)

      if (!journalEntryDocuments.length) {
        return insertedDocuments
      }

      const insertedJournalEntries = await tx
        .insert(JournalEntries)
        .values(
          journalEntryDocuments.map((document) => ({
            date: document.details!.date,
            description: document.details!.description,
          })),
        )
        .returning()

      await tx.insert(JournalEntryTransactions).values(
        journalEntryDocuments.flatMap((document, i) => {
          const transactions = documentToTransactions(document.details!)

          return transactions.map((transaction) => ({
            ...transaction,
            journalEntryId: insertedJournalEntries[i].id,
          }))
        }),
      )

      for (const [i, insertedDocument] of journalEntryDocuments.entries()) {
        await tx
          .update(Documents)
          .set({
            journalEntryId: insertedJournalEntries[i].id,
          })
          .where(eq(Documents.id, insertedDocument.id))
      }

      return insertedDocuments
    })

    res.status(200).json(insertedDocuments)
    return
  }

  res.status(405)
}
