import type { NextApiRequest, NextApiResponse } from 'next'
import {
  Account,
  PrismaClient,
  Transaction,
  Verification,
} from '@prisma/client'

const prisma = new PrismaClient()

export type VerificationInsert = Verification & {
  transactions: Pick<Transaction, 'accountCode' | 'amount'>[]
}
export type VerificationWithTransactions = Verification & {
  transactions: Transaction[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { accounts, verifications } = req.body as {
      accounts: Account[]
      verifications: VerificationInsert[]
    }

    const account = await prisma.account.createMany({
      data: accounts,
    })

    for (const verification of verifications) {
      await prisma.verification.create({
        data: {
          ...verification,
          transactions: {
            create: verification.transactions,
          },
        },
      })
    }

    res.status(200).json({ account })
    return
  }

  res.status(405)
}
