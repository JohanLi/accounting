import { and, asc, eq, isNull } from 'drizzle-orm'

import db from '../db'
import { Transaction } from '../getJournalEntries'
import { getNonLinkedBankTransactions } from '../getNonLinkedBankTransactions'
import { TransactionType, Transactions } from '../schema'
import { AccountCode } from '../types'

const SAVINGS_ACCOUNTS: {
  type: TransactionType
  accountId: AccountCode
  interestDescription: string
  label: string
  transferDateMarginDays?: number
}[] = [
  {
    type: 'bankSavings',
    accountId: 1931,
    interestDescription: 'RÄNTA',
    label: 'sparkonto',
  },
  {
    type: 'bankSavings2',
    accountId: 1933,
    interestDescription: 'Capitalization',
    label: 'sparkonto 2',
    // transfers from another bank can arrive a business day or two later
    transferDateMarginDays: 3,
  },
]

export async function getBankSavingsSuggestions() {
  const suggestions = await Promise.all(
    SAVINGS_ACCOUNTS.map(getSavingsAccountSuggestions),
  )

  return suggestions.flat()
}

async function getSavingsAccountSuggestions({
  type,
  accountId,
  interestDescription,
  label,
  transferDateMarginDays,
}: (typeof SAVINGS_ACCOUNTS)[number]) {
  const bankSavingsTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(eq(Transactions.type, type), isNull(Transactions.journalEntryId)),
    )
    .orderBy(asc(Transactions.id))

  // doesn't need to be performant, as these suggestions are few and far between
  const transfers = bankSavingsTransactions
    .filter((transaction) => transaction.description !== interestDescription)
    .map(async (transaction) => {
      const bankRegularTransactionMatch = await getNonLinkedBankTransactions({
        date: transaction.date,
        dateMarginDays: transferDateMarginDays,
        where: and(eq(Transactions.amount, -transaction.amount)),
      })

      if (!bankRegularTransactionMatch.length) {
        return null
      }

      const transactions = [
        { accountId, amount: transaction.amount },
        { accountId: 1930, amount: -transaction.amount },
      ] satisfies Transaction[]

      const linkedToTransactionIds = [
        transaction.id,
        bankRegularTransactionMatch[0].id,
      ]

      return {
        date: transaction.date,
        // TODO implement a way to tag journal entries
        description: `Bank – överföring ${label}`,
        transactions,
        linkedToTransactionIds,
      }
    })

  const interests = bankSavingsTransactions
    .filter((transaction) => transaction.description === interestDescription)
    .map((transaction) => ({
      date: transaction.date,
      description: `Bank – ränta ${label}`,
      transactions: [
        { accountId, amount: transaction.amount },
        { accountId: 8310, amount: -transaction.amount },
      ] satisfies Transaction[],
      linkedToTransactionIds: [transaction.id],
    }))

  return Promise.all([...transfers, ...interests])
}
