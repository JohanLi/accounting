import { DateFormatted } from './DateFormatted'
import { Amount } from './Amount'
import useTransactions from '../hooks/useTransactions'
import { Transactions, transactionTypes } from '../schema'
import { transactionTypeToLabel } from '../pages/transactions/[type]'
import { useState } from 'react'
import { classNames } from '../utils'
import { Button } from './Button'
import { InferSelectModel } from 'drizzle-orm'
import useJournalEntries from '../hooks/useJournalEntries'
import useLinksMutation from '../hooks/useLinksMutation'

/*
  TODO
    This is quite a rough component. Lots of business logic.

    The functionality of linking a transaction to other transactions
    as well as to a journal entry is likely not needed after FY 2023.

    In the past, journal entries were created "in isolation", because
    the old accounting software neither had access to bank nor tax transactions.

    Moving forward, journal entries will be suggested based on
    unlinked transactions. Thus, in the rare event a transaction is unlinked,
    the user journey will be to navigate the list of journal entries and handle
    the linking there instead.
 */

type Props = {
  transaction: InferSelectModel<typeof Transactions>
  onClose: () => void
}

const TIME_SPAN_IN_MS = 3600 * 24 * 3 * 1000

export function TransactionLinkForm({ transaction, onClose }: Props) {
  const journalEntries = useJournalEntries()
  const transactions = useTransactions()

  const filteredJournalEntries = journalEntries.data?.filter((j) => {
    const notLinked = !j.linkedToTransactionIds.length

    const closeInTime =
      Math.abs(
        new Date(j.date).getTime() - new Date(transaction.date).getTime(),
      ) <= TIME_SPAN_IN_MS

    const currentlyLinked = j.id === transaction.journalEntryId

    return (notLinked && closeInTime) || currentlyLinked
  })

  const filteredTransactions = transactions.data?.filter((t) => {
    const notLinked = t.journalEntryId === null

    const closeInTime =
      Math.abs(
        new Date(t.date).getTime() - new Date(transaction.date).getTime(),
      ) <= TIME_SPAN_IN_MS

    const currentlyLinked =
      transaction.journalEntryId !== null &&
      t.journalEntryId === transaction.journalEntryId

    const notSelf = t.id !== transaction.id

    return ((notLinked && closeInTime) || currentlyLinked) && notSelf
  })

  const [checkedJournalEntryId, setCheckedJournalEntryId] = useState<
    number | null
  >()
  const [checkedTransactionIds, setCheckedTransactionIds] = useState<number[]>()

  const mutation = useLinksMutation()

  if (checkedJournalEntryId === undefined && filteredJournalEntries) {
    setCheckedJournalEntryId(
      filteredJournalEntries.find((j) => j.id === transaction.journalEntryId)
        ?.id || null,
    )
  }

  if (!checkedTransactionIds && filteredTransactions) {
    setCheckedTransactionIds(
      filteredTransactions
        .filter(
          (t) =>
            transaction.journalEntryId !== null &&
            t.journalEntryId === transaction.journalEntryId,
        )
        .map((t) => t.id),
    )
  }

  const disabled =
    checkedJournalEntryId === undefined || checkedTransactionIds === undefined

  return (
    <>
      <table>
        <tbody>
          <tr key={transaction.id}>
            <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
              <DateFormatted date={transaction.date} />
            </td>
            <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
              {transaction.description}
            </td>
            <td className="whitespace-nowrap py-4 pr-3 text-sm text-gray-500">
              <Amount amount={transaction.amount} />
            </td>
            <td>
              <Button
                type="primary"
                disabled={disabled}
                onClick={async () => {
                  if (disabled) {
                    return
                  }

                  await mutation.mutateAsync({
                    transactionId: transaction.id,
                    journalEntryId: checkedJournalEntryId,
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
      {filteredJournalEntries && checkedJournalEntryId !== undefined && (
        <div>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Journal entries
          </h2>
          <table>
            <tbody>
              {filteredJournalEntries.map((journalEntry) => (
                <tr
                  key={journalEntry.id}
                  onClick={() => {
                    if (checkedJournalEntryId === journalEntry.id) {
                      setCheckedJournalEntryId(null)
                      setCheckedTransactionIds([])
                    } else {
                      setCheckedJournalEntryId(journalEntry.id)
                    }
                  }}
                  className={classNames(
                    'cursor-pointer',
                    checkedJournalEntryId === journalEntry.id
                      ? 'bg-gray-200'
                      : '',
                  )}
                >
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {checkedJournalEntryId &&
        filteredTransactions &&
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
