'use client'

import { Popover, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

import { updateLinks } from '../../actions/updateLinks'
import { TransactionsResponse } from '../../api/transactions/transactions'
import { Amount } from '../../components/Amount'
import { Button } from '../../components/Button'
import { DateFormatted } from '../../components/DateFormatted'
import { Submit } from '../../components/Submit'
import { AmountTd, DateOrAccountCodeTd, DescriptionTd, TableBody } from '../../components/common/table'
import { JournalEntryType } from '../../getJournalEntries'
import { transactionTypes } from '../../schema'
import { transactionTypeToLabel } from '../../transactions/transactionTypeToLabel'
import { classNames } from '../../utils'
import { AddLinkButton, EditLinkButton } from './LinkButton'

/*
  TODO
    handle cases where there are no transactions to suggest for a given journal entry
    closing the popover should reset the checked transactions
    investigate if it's better to fetch transactions as part of the initial server response already
 */

export function LinkPopover({
  journalEntry,
}: {
  journalEntry: JournalEntryType
}) {
  return (
    <Popover className="relative z-10">
      {({ open }) => <LinkForm journalEntry={journalEntry} open={open} />}
    </Popover>
  )
}

function LinkForm({
  journalEntry,
  open,
}: {
  journalEntry: JournalEntryType
  open: boolean
}) {
  const router = useRouter()

  const [transactions, setTransactions] = useState<TransactionsResponse>()

  const [checkedTransactionIds, setCheckedTransactionIds] = useState<number[]>()

  // TIL, better late than never https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (!checkedTransactionIds && transactions) {
    setCheckedTransactionIds(
      transactions
        .filter((t) => t.journalEntryId === journalEntry.id)
        .map((t) => t.id),
    )
  }

  useEffect(() => {
    if (!open) {
      return
    }

    fetch(`/api/transactions?journalEntryId=${journalEntry.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data)
      })
  }, [open, journalEntry.id])

  return (
    <>
      {!journalEntry.linkedToTransactionIds.length && (
        <AddLinkButton open={open} />
      )}
      {journalEntry.linkedToTransactionIds.length > 0 && (
        <EditLinkButton open={open} />
      )}
      <Transition
        show={open && !!transactions && !!checkedTransactionIds}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          static
          className="absolute left-20 top-1/2 w-screen max-w-lg -translate-y-1/2 transform"
        >
          {({ close }) => (
            <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              {transactions && checkedTransactionIds && (
                <>
                  <TableBody>
                    {transactionTypes.map((transactionType) => {
                      const transactionsOfType = transactions.filter(
                        (t) => t.type === transactionType,
                      )

                      if (!transactionsOfType.length) return null

                      return (
                        <Fragment key={transactionType}>
                          <div
                            className="bg-gray-100 py-2 px-4 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                          >
                            {transactionTypeToLabel[transactionType]}
                          </div>
                          {transactionsOfType.map((transaction) => (
                            <div
                              key={transaction.id}
                              onClick={() => {
                                if (
                                  checkedTransactionIds.includes(transaction.id)
                                ) {
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
                                'cursor-pointer flex items-center py-4 px-4',
                                checkedTransactionIds.includes(transaction.id)
                                  ? 'bg-yellow-100'
                                  : '',
                              )}
                            >
                              <DateOrAccountCodeTd>
                                <DateFormatted date={transaction.date} />
                              </DateOrAccountCodeTd>
                              <DescriptionTd>
                                {transaction.description}
                              </DescriptionTd>
                              <AmountTd>
                                <Amount amount={transaction.amount} />
                              </AmountTd>
                            </div>
                          ))}
                        </Fragment>
                      )
                    })}
                  </TableBody>
                  <div className="bg-gray-50 p-4">
                    <form
                      action={async () => {
                        if (!checkedTransactionIds) {
                          return
                        }

                        await updateLinks(
                          journalEntry.id,
                          checkedTransactionIds,
                        )

                        router.refresh()
                        close()
                      }}
                      className="space-x-4"
                    >
                      <Submit disabled={!checkedTransactionIds} />
                      <Button type="secondary" onClick={close} text="Cancel" />
                    </form>
                  </div>
                </>
              )}
            </div>
          )}
        </Popover.Panel>
      </Transition>
    </>
  )
}
