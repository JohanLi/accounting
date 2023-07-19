import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { TransactionsBankTax, Verifications } from '../../schema'
import { and, eq, InferModel, ne } from 'drizzle-orm'
import { Verification } from './verifications'

export type LinkedToResponse = {
  linkedBankTransactions: InferModel<typeof TransactionsBankTax>[]
  linkedVerification: Omit<Verification, 'hasLink'> | null
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<LinkedToResponse>,
) => {
  if (req.method === 'GET') {
    const bankTransactionId = parseInt(req.query.bankTransactionId as string)
    const verificationId = parseInt(req.query.verificationId as string)

    if (!bankTransactionId && !verificationId) {
      res.status(400).end()
      return
    }

    if (bankTransactionId) {
      const bankTransaction = await db
        .select()
        .from(TransactionsBankTax)
        .where(eq(TransactionsBankTax.id, bankTransactionId))

      const { verificationId } = bankTransaction[0]

      if (!verificationId) {
        res.status(200).json({
          linkedBankTransactions: [],
          linkedVerification: null,
        })
        return
      }

      const linkedBankTransactions = await db
        .select()
        .from(TransactionsBankTax)
        .where(
          and(
            eq(TransactionsBankTax.verificationId, verificationId),
            ne(TransactionsBankTax.id, bankTransactionId),
          ),
        )

      const linkedVerification =
        (await db.query.Verifications.findFirst({
          with: {
            transactions: true,
            documents: {
              columns: {
                id: true,
                extension: true,
              },
            },
          },
          where: eq(Verifications.id, verificationId),
        })) || null

      res.status(200).json({
        linkedBankTransactions,
        linkedVerification,
      })
      return
    }

    const linkedBankTransactions = await db
      .select()
      .from(TransactionsBankTax)
      .where(eq(TransactionsBankTax.verificationId, verificationId))

    res.status(200).json({
      linkedBankTransactions,
      linkedVerification: null,
    })
    return
  }

  res.status(405).end()
  return
}

export default handler
