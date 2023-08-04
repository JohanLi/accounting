import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { eq, inArray } from 'drizzle-orm'
import {
  JournalEntries,
  Documents,
  JournalEntryTransactions,
} from '../../schema'
import { getPdfHash } from '../../getPdfHash'
import { documentToTransactions, parse } from '../../document'

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
    const files = req.body as UploadFile[]

    const documents = await Promise.all(
      files.map(async (file) => {
        const data = Buffer.from(file.data, 'base64')

        return {
          data,
          hash: await getPdfHash(data),
        }
      }),
    )

    /*
      TODO
        Rethink this approach. Basically, the reason document hashes
        are explicitly checked for is because we repeatedly download
        old documents through the Chrome extension.
     */

    const hashes = (
      await db
        .select({ hash: Documents.hash })
        .from(Documents)
        .where(
          inArray(
            Documents.hash,
            documents.map((document) => document.hash),
          ),
        )
    ).map((document) => document.hash)

    const journalEntries = await Promise.all(
      documents
        .filter((document) => !hashes.includes(document.hash))
        .map(async (d) => {
          const document = await parse(d.data)

          return {
            date: document.date,
            description: document.description,
            transactions: documentToTransactions(document),
            documents: d,
          }
        }),
    )

    if (!journalEntries.length) {
      res.status(200).json([])
      return
    }

    try {
      const insertedJournalEntries = await db
        .insert(JournalEntries)
        .values(
          journalEntries.map((journalEntry) => ({
            date: journalEntry.date,
            description: journalEntry.description,
          })),
        )
        .returning()

      const transactions = journalEntries
        .map((journalEntry, i) =>
          journalEntry.transactions.map((transaction) => ({
            ...transaction,
            journalEntryId: insertedJournalEntries[i].id,
          })),
        )
        .flat()

      const documents = journalEntries.map((journalEntry, i) => ({
        ...journalEntry.documents,
        journalEntryId: insertedJournalEntries[i].id,
      }))

      await db.insert(JournalEntryTransactions).values(transactions)
      await db.insert(Documents).values(documents)

      res.status(200).json(insertedJournalEntries)
    } catch (e) {
      console.error(e)
      res.status(500).json({})
    }
  }

  res.status(405)
}
