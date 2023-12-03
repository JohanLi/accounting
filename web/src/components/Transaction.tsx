import { InferSelectModel } from 'drizzle-orm'
import { Transactions } from '../schema'
import { DateFormatted } from './DateFormatted'
import { Amount } from './Amount'
import { LinkIcon } from '@heroicons/react/20/solid'

type Props = {
  transaction: InferSelectModel<typeof Transactions>
}

export function Transaction({ transaction }: Props) {
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
        {transaction.journalEntryId && <LinkIcon className="h-4 w-4" />}
      </td>
    </tr>
  )
}
