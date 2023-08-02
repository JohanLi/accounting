import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { transactionTypeEnum, Transactions } from '../../schema'
import { z } from 'zod'
import { desc, InferModel } from 'drizzle-orm'
import { getHash, krToOre } from '../../utils'

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
  type: z.enum(transactionTypeEnum.enumValues),
})

const outgoingOrIngoingSchema = z.union([
  outgoingSchema.merge(commonSchema),
  ingoingSchema.merge(commonSchema),
])

const taxTransactionSchema = z.array(
  z.object({
    date: z.string(),
    description: z.string(),
    amount: z.string(),
    balance: z.string(),
  }),
)

export type TransactionsResponse = InferModel<typeof Transactions>[]

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
  return getHash(fields.join('-'))
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<TransactionsResponse>,
) => {
  if (req.method === 'GET') {
    const transactions = await db
      .select()
      .from(Transactions)
      .orderBy(desc(Transactions.id))

    res.status(200).json(transactions)
    return
  }

  if (req.method === 'POST') {
    try {
      const bankTransactions = outgoingOrIngoingSchema
        .array()
        .safeParse(req.body)

      let transactions: InferModel<typeof Transactions, 'insert'>[] = []

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
        .insert(Transactions)
        .values(transactions)
        .onConflictDoNothing()
        .returning()

      res.status(200).json(insertedTransactions)
    } catch (e) {
      console.error(e)
      res.status(500).end()
    }

    return
  }

  res.status(405).end()
  return
}

export default handler
