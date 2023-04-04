import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { receiptToTransaction, UPLOAD_FORM_KEY } from '../../utils'
import { parse } from '../../receipt'
import { readFile, unlink } from 'fs/promises'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const form = formidable({ multiples: true, hashAlgorithm: 'md5' })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405)
    return
  }

  return new Promise<void>((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err)
        res.status(500)
        resolve()
        return
      }

      let documents = files[UPLOAD_FORM_KEY]

      if (!Array.isArray(documents)) {
        documents = [documents]
      }

      for (const document of documents) {
        const extension = document.originalFilename?.split('.').pop() || ''
        const hash = document.hash || ''
        const file = await readFile(document.filepath)

        try {
          const receipt = await parse(document.filepath)

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
                  file,
                },
              },
            },
          })
        } catch (e) {
          console.error(e)
        }

        await unlink(document.filepath)
      }

      res.status(200).json({})
      resolve()
    })
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler
