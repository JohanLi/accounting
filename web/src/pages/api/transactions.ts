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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    /*
      TODO
        Need to figure out how to handle bookedDate and valueDate, particularly when sorting.
        Take special note of transactions that occur on the same day, and the balance
     */
    const bankTransactions = await db
      .select()
      .from(TransactionsBank)
      .where(eq(TransactionsBank.accountId, '1'))
      .orderBy(desc(TransactionsBank.valueDate))
    const bankSavingsTransactions = await db
      .select()
      .from(TransactionsBank)
      .where(eq(TransactionsBank.accountId, '2'))
      .orderBy(desc(TransactionsBank.valueDate))
    const taxTransactions = await db
      .select()
      .from(TransactionsTax)
      .orderBy(desc(TransactionsTax.date))

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
                amount: krToOre(
                  'outgoingAmount' in transaction
                    ? transaction.outgoingAmount
                    : transaction.ingoingAmount,
                ),
                balance: krToOre(transaction.availableBalance),
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
        .values(
          taxTransactions.map((transaction) => ({
            date: new Date(transaction.date),
            description: transaction.description,
            amount: krToOre(transaction.amount),
            balance: krToOre(transaction.balance),
          })),
        )
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
