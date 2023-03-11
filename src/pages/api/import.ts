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

    // https://stackoverflow.com/a/71409459
    const account = await prisma.$transaction(
      accounts.map((account) =>
        prisma.account.upsert({
          where: { code: account.code },
          update: {
            description: account.description,
          },
          create: account,
        }),
      ),
    )

    for (const verification of verifications) {
      await prisma.verification.create({
        data: {
          ...verification,
          transactions: {
            create: verification.transactions,
          },
          /*
            Verification IDs in SIE seem to start from 1 for each fiscal year,
            and likely don't have any intrinsic meaning
           */
          id: undefined,
        },
      })
    }

    res.status(200).json({ account })
    return
  }

  res.status(405)
}
