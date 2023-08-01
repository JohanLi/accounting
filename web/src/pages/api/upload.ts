import type { NextApiRequest, NextApiResponse } from 'next'
import { getPDFStrings, parse, receiptToTransactions } from '../../receipt'
import crypto from 'crypto'
import db from '../../db'
import {
  JournalEntryDocuments,
  JournalEntryTransactions,
  JournalEntries,
} from '../../schema'
import { inArray } from 'drizzle-orm'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

async function md5(buffer: Buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex')
}

export type UploadFile = {
  extension: string
  data: string
}

/*
  Developers Bay generates a slightly different PDF each time you download
  an invoice — specifically CreationDate and ModDate in the PDF metadata.

  Because of this, the hash is instead based on the PDF strings.
 */
export async function getHash(data: Buffer, extension: string) {
  if (extension !== 'pdf') {
    return md5(data)
  }

  const pdfStrings = await getPDFStrings(data)
  return md5(Buffer.from(JSON.stringify(pdfStrings)))
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const files = req.body as UploadFile[]

  const documents = await Promise.all(
    files.map(async (file) => {
      const data = Buffer.from(file.data, 'base64')

      return {
        data,
        extension: file.extension,
        hash: await getHash(data, file.extension),
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
      .select({ hash: JournalEntryDocuments.hash })
      .from(JournalEntryDocuments)
      .where(
        inArray(
          JournalEntryDocuments.hash,
          documents.map((document) => document.hash),
        ),
      )
  ).map((document) => document.hash)

  const journalEntries = await Promise.all(
    documents
      .filter((document) => !hashes.includes(document.hash))
      .map(async (document) => {
        const receipt = await parse(document.data)

        return {
          date: receipt.date,
          description: receipt.description,
          transactions: receiptToTransactions(receipt),
          documents: document,
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
    await db.insert(JournalEntryDocuments).values(documents)

    res.status(200).json(insertedJournalEntries)
  } catch (e) {
    console.error(e)
    res.status(500).json({})
  }
}

export default handler
