import { InferSelectModel } from 'drizzle-orm'

import { Amount } from '../components/Amount'
import { DateFormatted } from '../components/DateFormatted'
import {
  AmountTd,
  DateOrAccountCodeTd,
  DescriptionTd,
  LinkedTd, TableRow,
} from '../components/common/table'
import { Linked } from '../journalEntries/link/LinkButton'
import { Transactions } from '../schema'

type Props = {
  transaction: InferSelectModel<typeof Transactions>
}

export function Transaction({ transaction }: Props) {
  return (
    <TableRow>
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
      <LinkedTd>{transaction.journalEntryId && <Linked />}</LinkedTd>
    </TableRow>
  )
}
