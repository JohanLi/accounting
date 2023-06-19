import type { NextApiRequest, NextApiResponse } from 'next'
import { getPDFStrings, parse, receiptToTransactions } from '../../receipt'
import crypto from 'crypto'
import db from '../../db'
import { Documents, Transactions, Verifications } from '../../schema'
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
      .select({ hash: Documents.hash })
      .from(Documents)
      .where(
        inArray(
          Documents.hash,
          documents.map((document) => document.hash),
        ),
      )
  ).map((document) => document.hash)

  const verifications = await Promise.all(
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

  if (!verifications.length) {
    res.status(200).json([])
    return
  }

  try {
    const insertedVerifications = await db
      .insert(Verifications)
      .values(
        verifications.map((verification) => ({
          date: verification.date,
          description: verification.description,
        })),
      )
      .returning()

    const transactions = verifications
      .map((verification, i) =>
        verification.transactions.map((transaction) => ({
          ...transaction,
          verificationId: insertedVerifications[i].id,
        })),
      )
      .flat()

    const documents = verifications.map((verification, i) => ({
      ...verification.documents,
      verificationId: insertedVerifications[i].id,
    }))

    await db.insert(Transactions).values(transactions)
    await db.insert(Documents).values(documents)

    res.status(200).json(insertedVerifications)
  } catch (e) {
    console.error(e)
    res.status(500).json({})
  }
}

export default handler
