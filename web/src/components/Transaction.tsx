'use client'

import { useState } from 'react'
import { InferSelectModel } from 'drizzle-orm'
import { Transactions } from '../schema'
import { DateFormatted } from './DateFormatted'
import { Amount } from './Amount'
import { LinkIcon } from '@heroicons/react/20/solid'
import { Button } from './Button'
import { TransactionLinkForm } from './TransactionLinkForm'

type Props = {
  transaction: InferSelectModel<typeof Transactions>
}

export function Transaction({ transaction }: Props) {
  const [editLink, setEditLink] = useState(false)

  if (editLink) {
    return (
      <tr>
        <td colSpan={6}>
          <TransactionLinkForm
            transaction={transaction}
            onClose={() => setEditLink(false)}
          />
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
        <DateFormatted date={transaction.date} />
      </td>
      <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">
        {transaction.description}
      </td>
      <td className="whitespace-nowrap py-4 text-right text-sm">
        <Amount amount={transaction.amount} />
      </td>
      <td className="whitespace-nowrap py-4 text-right text-sm">
        <Amount amount={transaction.balance} />
      </td>
      <td className="relative whitespace-nowrap py-4 text-right text-xs">
        {transaction.journalEntryId && (
          <a
            href="#"
            className="inline-flex items-center text-gray-500 hover:text-gray-800"
            onClick={(e) => {
              e.preventDefault()

              setEditLink(true)
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </a>
        )}
      </td>
      <td className="text-right">
        {!transaction.journalEntryId && (
          <Button
            type="secondary"
            onClick={() => setEditLink(true)}
            text="Add link"
          />
        )}
      </td>
    </tr>
  )
}
