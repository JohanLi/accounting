import { getDates, getLatestDate } from './document'
import db from './db'
import { Transactions } from './schema'
import { and, eq, gte, isNull, lte } from 'drizzle-orm'

const TIME_WINDOW_DAYS = 10

export async function getGoogleWorkspaceDocument(strings: any[]) {
  if (!strings.includes('Google Workspace')) {
    return null
  }

  const latestDate = getLatestDate(getDates(strings))

  if (!latestDate) {
    throw new Error(
      'Could not find the latest date in the Google Workspace document',
    )
  }

  const start = new Date(latestDate)
  start.setDate(start.getDate() - TIME_WINDOW_DAYS)

  const end = new Date(latestDate)
  end.setDate(end.getDate() + TIME_WINDOW_DAYS)

  const timeWindow = { start, end }

  const transactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankRegular'),
        isNull(Transactions.journalEntryId),
        gte(Transactions.date, timeWindow.start),
        lte(Transactions.date, timeWindow.end),
        gte(Transactions.amount, -7000),
        lte(Transactions.amount, -5000),
      ),
    )

  if (transactions.length > 1) {
    throw new Error(
      'Two or more transactions look like they may be linked to this Google Workspace document',
    )
  }

  const total = transactions[0].amount
  const vat = Math.round(total - total / (1 + 0.25))

  return {
    date: latestDate,
    // TODO implement a way to tag journal entries
    description: `Recognized document – Google Workspace`,
    transactions: [
      {
        accountId: 1930,
        /*
         TODO
           Evaluate if it'd be a good practice to force such values to be
           negative, or at least throw an exception if they aren't.
           (I was caught off guard by a double negative)
         */
        amount: total,
      },
      {
        accountId: 2614,
        amount: vat,
      },
      {
        accountId: 2645,
        amount: -vat,
      },
      {
        accountId: 4535,
        amount: -total,
      },
    ],
    linkedToTransactionIds: [transactions[0].id],
  }
}
