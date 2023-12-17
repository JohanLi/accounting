import { DateFormatted } from '../components/DateFormatted'
import { Amount } from '../components/Amount'
import { JournalEntry as JournalEntryType } from '../getJournalEntries'
import { transactionTypes } from '../schema'
import { transactionTypeToLabel } from '../transactions/transactionTypeToLabel'
import { useEffect, useState } from 'react'
import { classNames } from '../utils'
import { Button } from '../components/Button'
import { useRouter } from 'next/navigation'
import { Submit } from '../components/Submit'
import { updateLinks } from '../actions/updateLinks'
import { TransactionsResponse } from '../api/transactions/transactions'

type Props = {
  journalEntry: JournalEntryType
  onClose: () => void
}

export function JournalEntryLinkForm({ journalEntry, onClose }: Props) {
  const router = useRouter()

  const [transactions, setTransactions] = useState<TransactionsResponse>()

  useEffect(() => {
    fetch(`/api/transactions?journalEntryId=${journalEntry.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data)
      })
  }, [])

  const [checkedTransactionIds, setCheckedTransactionIds] = useState<number[]>()

  // TIL, better late than never https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (!checkedTransactionIds && transactions) {
    setCheckedTransactionIds(
      transactions
        .filter((t) => t.journalEntryId === journalEntry.id)
        .map((t) => t.id),
    )
  }

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
              <DateFormatted date={journalEntry.date} />
            </td>
            <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
              {journalEntry.description}
            </td>
            <td className="whitespace-nowrap py-4 pr-3 text-sm text-gray-500">
              {journalEntry.transactions.length && (
                <table className="min-w-full divide-y divide-gray-300">
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {journalEntry.transactions.map((transaction, i) => (
                      <tr key={i}>
                        <td className="w-16 py-2 pr-3 text-sm text-gray-500">
                          {transaction.accountId}
                        </td>
                        <td className="px-2 py-2 text-right text-sm font-medium">
                          <Amount amount={transaction.amount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </td>
            <td>
              <form
                action={async () => {
                  if (!checkedTransactionIds) {
                    return
                  }

                  await updateLinks(journalEntry.id, checkedTransactionIds)

                  router.refresh()
                  onClose()
                }}
              >
                <Submit disabled={!checkedTransactionIds} />
              </form>
              <Button type="secondary" onClick={onClose} text="Cancel" />
            </td>
          </tr>
        </tbody>
      </table>
      {transactions &&
        checkedTransactionIds &&
        transactionTypes.map((transactionType) => {
          const transactionsOfType = transactions.filter(
            (t) => t.type === transactionType,
          )

          if (!transactionsOfType.length) return null

          return (
            <div key={transactionType}>
              <h2 className="text-base font-semibold leading-6 text-gray-900">
                {transactionTypeToLabel[transactionType]}
              </h2>
              <table>
                <tbody>
                  {transactionsOfType.map((transaction) => (
                    <tr
                      key={transaction.id}
                      onClick={() => {
                        if (checkedTransactionIds.includes(transaction.id)) {
                          setCheckedTransactionIds(
                            checkedTransactionIds.filter(
                              (id) => id !== transaction.id,
                            ),
                          )
                        } else {
                          setCheckedTransactionIds([
                            ...checkedTransactionIds,
                            transaction.id,
                          ])
                        }
                      }}
                      className={classNames(
                        'cursor-pointer',
                        checkedTransactionIds.includes(transaction.id)
                          ? 'bg-gray-200'
                          : '',
                      )}
                    >
                      <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                        <DateFormatted date={transaction.date} />
                      </td>
                      <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="whitespace-nowrap py-4 text-right text-sm">
                        <Amount amount={transaction.amount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
    </>
  )
}
