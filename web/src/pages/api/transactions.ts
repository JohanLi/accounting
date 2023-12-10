import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'
import { transactionTypeEnum, Transactions, JournalEntries } from '../../schema'
import { z } from 'zod'
import {
  and,
  desc,
  eq,
  gte,
  InferInsertModel,
  InferSelectModel,
  isNull,
  lt,
  ne,
  or,
} from 'drizzle-orm'
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

export type TransactionsResponse = InferSelectModel<typeof Transactions>[]

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

export function getTransactions() {
  return db
    .select()
    .from(Transactions)
    .orderBy(desc(Transactions.date), desc(Transactions.id))
}

/*
  When transferring money, whether to the tax account or as part of paying invoices, it often
  takes a day or two before the bank transaction is registered. This day range is temporarily
  changed in the event of edge cases.

  One thing it doesn't handle well is when invoices are paid much earlier than the due date.
  Instead of complicating the business logic, I've simply changed my own process to pay
  them close to the due date.
 */
const SEARCH_DAY_RANGE = 3

export async function getTransactionsForLinkForm(journalEntryId: number) {
  const result = await db
    .select({ date: JournalEntries.date })
    .from(JournalEntries)
    .where(eq(JournalEntries.id, journalEntryId))

  if (!result.length) {
    return []
  }

  const startInclusive = new Date(result[0].date)
  startInclusive.setDate(startInclusive.getDate() - SEARCH_DAY_RANGE)

  const endExclusive = new Date(result[0].date)
  endExclusive.setDate(endExclusive.getDate() + SEARCH_DAY_RANGE)

  const nonLinkedInRange = and(
    isNull(Transactions.journalEntryId),
    gte(Transactions.date, startInclusive),
    lt(Transactions.date, endExclusive),
  )

  return db
    .select()
    .from(Transactions)
    .where(
      or(eq(Transactions.journalEntryId, journalEntryId), nonLinkedInRange),
    )
    .orderBy(
      ne(Transactions.journalEntryId, journalEntryId), // linked transactions first
      desc(Transactions.date),
      desc(Transactions.id),
    )
}

async function getExternalId(...fields: string[]) {
  return getHash(fields.join('-'))
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<TransactionsResponse>,
) => {
  if (req.method === 'GET') {
    const { journalEntryId } = req.query as { journalEntryId: string }
    const transactions = await getTransactionsForLinkForm(
      parseInt(journalEntryId),
    )

    res.status(200).json(transactions)
    return
  }

  if (req.method === 'POST') {
    try {
      const bankTransactions = outgoingOrIngoingSchema
        .array()
        .safeParse(req.body)

      let transactions: InferInsertModel<typeof Transactions>[] = []

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
