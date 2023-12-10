import db from '../../../src/db'
import { Transactions } from '../../../src/schema'
import { InferInsertModel } from 'drizzle-orm'
import { krToOre } from '../../../src/utils'
import {
  getExternalId,
  getTransactionsForLinkForm,
  outgoingOrIngoingSchema,
  taxTransactionSchema,
  throwIfWrongSequence,
} from './transactions'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const journalEntryId = searchParams.get('journalEntryId')

  if (!journalEntryId) {
    return new Response('journalEntryId is required', { status: 400 })
  }

  const transactions = await getTransactionsForLinkForm(
    parseInt(journalEntryId),
  )

  return Response.json(transactions)
}

export async function PUT(request: Request) {
  const body = await request.json()

  try {
    const bankTransactions = outgoingOrIngoingSchema.array().safeParse(body)

    let transactions: InferInsertModel<typeof Transactions>[]

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
        taxTransactionSchema.parse(body).map(async (transaction) => ({
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

    return Response.json(insertedTransactions)
  } catch (e) {
    console.error(e)
    return Response.json({}, { status: 500 })
  }
}
