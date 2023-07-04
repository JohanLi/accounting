import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { transactionBankTaxTypeEnum, TransactionsBankTax } from '../../schema'
import { z } from 'zod'
import { desc, eq, InferModel } from 'drizzle-orm'
import { krToOre } from '../../utils'
import crypto from 'crypto'

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
  /*
   TODO
     accountId and type isn't really the best solution.
     The main issue lies in mapping accountId to type, and that it requires
     both "extension" and "web" to know about the same ENV variables.
     "type" is also saved in raw although it's a derived value.
   */
  accountId: z.string(),
  type: z.enum(transactionBankTaxTypeEnum.enumValues),
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
  regular: InferModel<typeof TransactionsBankTax>[]
  savings: InferModel<typeof TransactionsBankTax>[]
  tax: InferModel<typeof TransactionsBankTax>[]
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

async function getExternalId(...fields: string[]) {
  return crypto.createHash('sha256').update(fields.join('-')).digest('hex')
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const regular = await db
      .select()
      .from(TransactionsBankTax)
      .where(eq(TransactionsBankTax.type, 'bankRegular'))
      .orderBy(desc(TransactionsBankTax.id))

    const savings = await db
      .select()
      .from(TransactionsBankTax)
      .where(eq(TransactionsBankTax.type, 'bankSavings'))
      .orderBy(desc(TransactionsBankTax.id))

    const tax = await db
      .select()
      .from(TransactionsBankTax)
      .where(eq(TransactionsBankTax.type, 'tax'))
      .orderBy(desc(TransactionsBankTax.id))

    res.status(200).json({
      regular,
      savings,
      tax,
    })
    return
  }

  if (req.method === 'POST') {
    try {
      const bankTransactions = outgoingOrIngoingSchema
        .array()
        .safeParse(req.body)

      let transactions: InferModel<typeof TransactionsBankTax, 'insert'>[] = []

      if (bankTransactions.success) {
        transactions = await Promise.all(
          bankTransactions.data.map(async (transaction) => ({
            type: transaction.type,
            date: new Date(transaction.bookedDate),
            description: transaction.text,
            amount: krToOre(
              'outgoingAmount' in transaction
                ? transaction.outgoingAmount
                : transaction.ingoingAmount,
            ),
            balance: krToOre(transaction.availableBalance),
            raw: JSON.stringify(transaction),
            externalId: await getExternalId(transaction.id),
          })),
        )

        transactions.reverse()
        throwIfWrongSequence(
          transactions.filter(
            (transaction) => transaction.type === 'bankRegular',
          ),
        )
        throwIfWrongSequence(
          transactions.filter(
            (transaction) => transaction.type === 'bankSavings',
          ),
        )
      } else {
        transactions = await Promise.all(
          taxTransactionSchema.parse(req.body).map(async (transaction) => ({
            type: 'tax',
            date: new Date(transaction.date),
            description: transaction.description,
            amount: krToOre(transaction.amount),
            balance: krToOre(transaction.balance),
            raw: {},
            externalId: await getExternalId(
              transaction.date,
              transaction.amount,
              transaction.balance,
            ),
          })),
        )

        throwIfWrongSequence(transactions)
      }

      const insertedTransactions = await db
        .insert(TransactionsBankTax)
        .values(transactions)
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
