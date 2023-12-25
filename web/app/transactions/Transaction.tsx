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
import { Linked } from '../journalEntries/link/LinkButton'

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
      <LinkedTd right>{transaction.journalEntryId && <Linked />}</LinkedTd>
    </tr>
  )
}
