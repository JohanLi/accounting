import { useQuery } from '@tanstack/react-query'
import { JournalEntry } from '../pages/api/journalEntries'
import { InferModel } from 'drizzle-orm'
import { Transactions } from '../schema'
import { LinkedToResponse } from '../pages/api/linkedTo'

export type LinkedToProps =
  | {
      journalEntry: JournalEntry
      transaction?: never
    }
  | {
      journalEntry?: never
      transaction: InferModel<typeof Transactions>
    }

export default function LinkedTo({ journalEntry, transaction }: LinkedToProps) {
  const linkedTo = useQuery<LinkedToResponse>({
    queryKey: [
      'linkedTo',
      journalEntry
        ? `journalEntryId=${journalEntry.id}`
        : `bankTransactionId=${transaction.id}`,
    ],
    queryFn: ({ queryKey }) =>
      fetch(`/api/linkedTo?${queryKey[1]}`).then((res) => res.json()),
  })

  if (!linkedTo.data) {
    return null
  }

  const { linkedBankTransactions, linkedJournalEntry } = linkedTo.data

  return (
    <div className="divide-y divide-gray-300">
      {journalEntry && (
        <div>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Journal entry
          </h2>
          <pre>{JSON.stringify(journalEntry, null, 2)}</pre>
        </div>
      )}
      {transaction && (
        <div>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            {transaction.type}
          </h2>
          <pre>{JSON.stringify(transaction, null, 2)}</pre>
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          Transactions
        </h2>
        <pre>{JSON.stringify(linkedBankTransactions, null, 2)}</pre>
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          Journal entries
        </h2>
        <pre>{JSON.stringify(linkedJournalEntry, null, 2)}</pre>
      </div>
    </div>
  )
}
