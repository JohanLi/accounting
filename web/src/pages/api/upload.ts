import type { NextApiRequest, NextApiResponse } from 'next'
import { md5 } from '../../utils'
import { parse, receiptToTransaction } from '../../receipt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    }
  }
}

export type UploadFile = {
  extension: string
  data: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const files = req.body as UploadFile[]

  for (const file of files) {
    const data = Buffer.from(file.data, 'base64')

    const extension = file.extension
    const hash = await md5(data)

    try {
      const receipt = await parse(data)

      await prisma.verification.create({
        data: {
          date: receipt.date,
          description: receipt.description,
          transactions: {
            create: receiptToTransaction(receipt),
          },
          documents: {
            create: {
              extension,
              hash,
              data,
            },
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
