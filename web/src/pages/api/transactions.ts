import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { TransactionsBank, TransactionsTax } from '../../schema'
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

export const bankTransactionSchema = z.object({
  transactions: z.array(outgoingOrIngoingSchema),
})

const taxTransactionSchema = z.array(
  z.object({
    date: z.coerce.date(),
    description: z.string(),
    amount: z.coerce.number(),
    balance: z.coerce.number(),
  }),
)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  try {
    const bankTransactions = outgoingOrIngoingSchema.array().safeParse(req.body)

    if (bankTransactions.success) {
      const insertedTransactions = await db
        .insert(TransactionsBank)
        .values(
          bankTransactions.data
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

      res.status(200).json(insertedTransactions)
      return
    }

    const taxTransactions = taxTransactionSchema.parse(req.body)

    const insertedTransactions = await db
      .insert(TransactionsTax)
      .values(taxTransactions)
      .onConflictDoNothing()
      .returning()

    res.status(200).json(insertedTransactions)
  } catch (e) {
    console.error(e)
    res.status(500).json({})
  }
}

export default handler
