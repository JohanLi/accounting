import type { NextApiRequest, NextApiResponse } from 'next'
import { md5 } from '../../utils'
import { getPDFStrings, parse, receiptToTransaction } from '../../receipt'
import { prisma } from '../../db'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
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
async function getHash(data: Buffer, extension: string) {
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

  const hashes = (
    await prisma.document.findMany({
      select: {
        hash: true,
      },
      where: {
        hash: { in: documents.map((document) => document.hash) },
      },
    })
  ).map((document) => document.hash)

  const newDocuments = documents.filter(
    (document) => !hashes.includes(document.hash),
  )

  for (const document of newDocuments) {
    try {
      const receipt = await parse(document.data)

      await prisma.verification.create({
        data: {
          date: receipt.date,
          description: receipt.description,
          transactions: {
            create: receiptToTransaction(receipt),
          },
          documents: {
            create: document,
          },
        },
      })
    } catch (e) {
      console.error(e)
    }
  }

  res.status(200).json({})
}

export default handler
