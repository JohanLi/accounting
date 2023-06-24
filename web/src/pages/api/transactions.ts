import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { TransactionsBank } from '../../schema'
import { z } from 'zod'

const outgoingSchema = z.object({
  outgoingAmount: z.string(),
  outgoingCurrency: z.literal('SEK'),
})

const ingoingSchema = z.object({
  ingoingAmount: z.string(),
  ingoingCurrency: z.literal('SEK'),
})

const commonSchema = z.object({
  id: z.string().min(1).max(1000),
  bookedDate: z.string(),
  valueDate: z.string(),
  text: z.string(),
  availableBalance: z.string(),
  accountId: z.string(),
})

const outgoingOrIngoingSchema = z.union([
  outgoingSchema.merge(commonSchema),
  ingoingSchema.merge(commonSchema),
])

export const transactionSchema = z.object({
  transactions: z.array(outgoingOrIngoingSchema),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  try {
    const transactions = outgoingOrIngoingSchema.array().parse(req.body)

    const result = await db
      .insert(TransactionsBank)
      .values(
        transactions
          .sort(
            (a, b) =>
              new Date(a.bookedDate).getTime() -
              new Date(b.bookedDate).getTime(),
          )
          .map((transaction) => ({
            bookedDate: new Date(transaction.bookedDate),
            valueDate: new Date(transaction.valueDate),
            description: transaction.text,
            amount: parseInt(
              'outgoingAmount' in transaction
                ? transaction.outgoingAmount
                : transaction.ingoingAmount,
            ),
            balance: parseInt(transaction.availableBalance),
            externalId: transaction.id,
            accountId: transaction.accountId,
          })),
      )
      .onConflictDoNothing()
      .returning()

    res.status(200).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json({})
  }
}

export default handler
