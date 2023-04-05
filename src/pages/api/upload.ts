import type { NextApiRequest, NextApiResponse } from 'next'
import { md5, receiptToTransaction } from '../../utils'
import { parse } from '../../receipt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type UploadFiles = {
  extension: string
  data: string
}[]

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405)
    return
  }

  const files = req.body as UploadFiles

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
