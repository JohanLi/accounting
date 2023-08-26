import { DateFormatted } from './DateFormatted'
import { Amount } from './Amount'
import { JournalEntry as JournalEntryType } from '../pages/api/journalEntries'
import useTransactions from './useTransactions'
import { transactionTypes } from '../schema'
import { transactionTypeToLabel } from '../pages/transactions/[type]'
import { useState } from 'react'
import { classNames } from '../utils'
import { Button } from './Button'
import useLinksMutation from './useLinksMutation'

type Props = {
  journalEntry: JournalEntryType
  onClose: () => void
}

/*
  Not entirely sure how to best handle this. Feels like currently linked
  and the best suggestion should be at the top.

  Is it worth presenting other suggestions that are close in time? Sort them
  by "likelihood", or chronologically? Scroll? Ideal time span?

  Similarly, the selection logic can be improved over time. Should all
  suggestions behave like checkboxes, or are there groups of radio buttons?
 */

const TIME_SPAN_IN_MS = 3600 * 24 * 3 * 1000

export function JournalEntryLinkForm({ journalEntry, onClose }: Props) {
  const transactions = useTransactions()

  const filteredTransactions = transactions.data?.filter((t) => {
    const notLinked = t.journalEntryId === null

    const closeInTime =
      Math.abs(
        new Date(t.date).getTime() - new Date(journalEntry.date).getTime(),
      ) <= TIME_SPAN_IN_MS

    const currentlyLinked = t.journalEntryId === journalEntry.id

    return (notLinked && closeInTime) || currentlyLinked
  })

  const [checkedTransactionIds, setCheckedTransactionIds] = useState<number[]>()

  const mutation = useLinksMutation()

  // TIL, better late than never https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (!checkedTransactionIds && filteredTransactions) {
    setCheckedTransactionIds(
      filteredTransactions
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
                    {journalEntry.transactions.map((transaction) => (
                      <tr key={transaction.id}>
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
              <Button
                type="primary"
                onClick={async () => {
                  if (!checkedTransactionIds) {
                    return
                  }

                  await mutation.mutateAsync({
                    journalEntryId: journalEntry.id,
                    transactionIds: checkedTransactionIds,
                  })

                  onClose()
                }}
                text="Submit"
              />
              <Button type="secondary" onClick={onClose} text="Cancel" />
            </td>
          </tr>
        </tbody>
      </table>
      {filteredTransactions &&
        checkedTransactionIds &&
        transactionTypes.map((transactionType) => {
          const transactionsOfType = filteredTransactions.filter(
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
