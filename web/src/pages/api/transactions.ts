import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { TransactionsBank, TransactionsTax } from '../../schema'
import { z } from 'zod'
import { desc, eq, InferModel } from 'drizzle-orm'
import { krToOre } from '../../utils'

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
    date: z.string(),
    description: z.string(),
    amount: z.string(),
    balance: z.string(),
  }),
)

export type TransactionsResponse = {
  regular: InferModel<typeof TransactionsBank>[]
  savings: InferModel<typeof TransactionsBank>[]
  tax: InferModel<typeof TransactionsTax>[]
}

function throwIfWrongSequence(
  transactions: { amount: number; balance: number }[],
) {
  if (transactions.length === 0) {
    return
  }

  let balance = 0

  transactions.forEach((transaction) => {
    balance += transaction.amount

    if (transaction.balance !== balance) {
      throw new Error(
        'The transactions do not appear to be in the correct sequence',
      )
    }
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const bankTransactions = await db
      .select()
      .from(TransactionsBank)
      .where(eq(TransactionsBank.accountId, '1'))
      .orderBy(desc(TransactionsBank.id))
    const bankSavingsTransactions = await db
      .select()
      .from(TransactionsBank)
      .where(eq(TransactionsBank.accountId, '2'))
      .orderBy(desc(TransactionsBank.id))
    const taxTransactions = await db
      .select()
      .from(TransactionsTax)
      .orderBy(desc(TransactionsTax.id))

    res.status(200).json({
      regular: bankTransactions,
      savings: bankSavingsTransactions,
      tax: taxTransactions,
    })
    return
  }

  if (req.method === 'POST') {
    try {
      const bankTransactions = outgoingOrIngoingSchema
        .array()
        .safeParse(req.body)

      if (bankTransactions.success) {
        /*
          TODO
            It might be advisable to have less "predefined" columns. E.g.,
            use "date" instead of "bookedDate" and "valueDate", and remove "externalId".
            Instead, have a JSON column that stores the entire transaction.
         */
        const transactions = bankTransactions.data.map((transaction) => ({
          bookedDate: new Date(transaction.bookedDate),
          valueDate: new Date(transaction.valueDate),
          description: transaction.text,
          amount: krToOre(
            'outgoingAmount' in transaction
              ? transaction.outgoingAmount
              : transaction.ingoingAmount,
          ),
          balance: krToOre(transaction.availableBalance),
          externalId: transaction.id,
          accountId: transaction.accountId,
        }))

        transactions.reverse()
        throwIfWrongSequence(
          transactions.filter((transaction) => transaction.accountId === '1'),
        )
        throwIfWrongSequence(
          transactions.filter((transaction) => transaction.accountId === '2'),
        )

        const insertedTransactions = await db
          .insert(TransactionsBank)
          .values(transactions)
          .onConflictDoNothing()
          .returning()

        res.status(200).json(insertedTransactions)
        return
      }

      const taxTransactions = taxTransactionSchema
        .parse(req.body)
        .map((transaction) => ({
          date: new Date(transaction.date),
          description: transaction.description,
          amount: krToOre(transaction.amount),
          balance: krToOre(transaction.balance),
        }))

      throwIfWrongSequence(taxTransactions)

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

    return
  }

  res.status(405).end()
  return
}

export default handler
