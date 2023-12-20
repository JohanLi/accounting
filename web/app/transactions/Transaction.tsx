import { InferSelectModel } from 'drizzle-orm'
import { Transactions } from '../schema'
import { DateFormatted } from '../components/DateFormatted'
import { Amount } from '../components/Amount'
import {
  AmountTd,
  DateOrAccountCodeTd,
  DescriptionTd,
  Link,
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
      <LinkedTd>{transaction.journalEntryId && <Link />}</LinkedTd>
    </tr>
  )
}
