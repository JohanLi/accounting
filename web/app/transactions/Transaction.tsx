import { InferSelectModel } from 'drizzle-orm'
import { Transactions } from '../schema'
import { DateFormatted } from '../components/DateFormatted'
import { Amount } from '../components/Amount'
import {
  AmountTd,
  DateOrAccountCodeTd,
  DescriptionTd,
  LinkedTd,
} from '../components/common/table'

type Props = {
  transaction: InferSelectModel<typeof Transactions>
}

export function Transaction({ transaction }: Props) {
  return (
    <tr>
      <DateOrAccountCodeTd>
        <DateFormatted date={transaction.date} />
      </DateOrAccountCodeTd>
      <DescriptionTd>{transaction.description}</DescriptionTd>
      <AmountTd>
        <Amount amount={transaction.amount} />
      </AmountTd>
      <AmountTd>
        <Amount amount={transaction.balance} />
      </AmountTd>
      <LinkedTd>
        {transaction.journalEntryId && (
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-green-700 ring-1 ring-inset ring-green-600/20">
            Linked
          </span>
        )}
      </LinkedTd>
    </tr>
  )
}
