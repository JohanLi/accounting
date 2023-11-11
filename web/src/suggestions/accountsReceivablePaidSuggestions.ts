import db from '../db'
import {
  JournalEntries,
  JournalEntryTransactions,
  Transactions,
} from '../schema'
import { and, asc, eq, gte, inArray, lt, isNull } from 'drizzle-orm'
import { getCurrentFiscalYear, getFiscalYear } from '../utils'

/*
  Possible feature enhancement: is there a need to visually link
  an accounts receivable entry to the entry that paid it?

  I think having something more explicit that signals if an accounts receivable
  has been paid will make this logic clearer. Otherwise, you have to look at
  all entries involving accounts receivables to figure that out.

  For now, we'll look at entries created midway through the previous and
  midway before the current fiscal year. This approach works as long as
  there aren't invoices that are paid after a massive delay.
 */

export function getUnpaid(accountReceivables: number[]) {
  const paid = accountReceivables.filter((amount) => amount < 0)
  const initialUnpaid = accountReceivables.filter((amount) => amount > 0)

  const unpaid = initialUnpaid.filter((amount) => {
    const paidIndex = paid.indexOf(-amount)

    if (paidIndex === -1) {
      return true
    }

    paid.splice(paidIndex, 1)
    return false
  })

  if (paid.length > 0) {
    throw new Error(
      'Some account receivables seem to have been paid more than once',
    )
  }

  return unpaid
}

export async function getAccountsReceivablePaidSuggestions() {
  const { startInclusive } = getFiscalYear(getCurrentFiscalYear())

  const midwayPrevious = new Date(startInclusive)
  midwayPrevious.setMonth(midwayPrevious.getMonth() - 6)

  const midwayCurrent = new Date(startInclusive)
  midwayCurrent.setMonth(midwayCurrent.getMonth() + 6)

  const accountReceivables = (
    await db
      .select({ amount: JournalEntryTransactions.amount })
      .from(JournalEntries)
      .innerJoin(
        JournalEntryTransactions,
        and(
          eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
          eq(JournalEntryTransactions.accountId, 1510),
        ),
      )
      .where(
        and(
          gte(JournalEntries.date, midwayPrevious),
          lt(JournalEntries.date, midwayCurrent),
        ),
      )
      .orderBy(asc(JournalEntries.date), asc(JournalEntries.id))
  ).map(({ amount }) => amount)

  const unpaid = getUnpaid(accountReceivables)

  if (unpaid.length === 0) {
    return []
  }

  const paymentTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankRegular'),
        inArray(Transactions.amount, unpaid),
        isNull(Transactions.journalEntryId),
        gte(Transactions.date, startInclusive),
      ),
    )
    .orderBy(asc(Transactions.id))

  return paymentTransactions.map((paymentTransaction) => {
    const transactions = [
      { accountId: 1510, amount: -paymentTransaction.amount },
      { accountId: 1930, amount: paymentTransaction.amount },
    ]

    const linkedToTransactionIds = [paymentTransaction.id]

    return {
      date: paymentTransaction.date,
      // TODO implement a way to tag journal entries
      description: `Inkomst – betalning av kundfordran`,
      transactions,
      linkedToTransactionIds,
    }
  })
}
