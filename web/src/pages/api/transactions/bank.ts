import type { NextApiRequest, NextApiResponse } from 'next'
import { BankTransaction } from '@prisma/client'
import Cors from 'cors'
import { prisma } from '../../../db'

const cors = Cors({
  methods: ['POST'],
})

const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) => new Promise((resolve, reject) => {
  fn(req, res, (result: any) => {
    if (result instanceof Error) {
      return reject(result)
    }

    return resolve(result)
  })
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors)

  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const transactions = req.body as BankTransaction[]

  try {
    await prisma.bankTransaction.createMany({
      data: transactions,
    })
  } catch (e) {
    console.error(e)
  }

  res.status(200).json({})
}

export default handler
