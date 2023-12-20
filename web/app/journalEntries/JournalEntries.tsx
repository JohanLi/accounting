import { JournalEntryType } from '../getJournalEntries'
import { JournalEntry } from './JournalEntry'
import {
  DateOrAccountCodeTh,
  DescriptionTh,
  LinkedTh,
  Table,
} from '../components/common/table'

export function JournalEntries({
  journalEntries,
}: {
  journalEntries: JournalEntryType[]
}) {
  return (
    <Table>
      <thead>
        <tr>
          <DateOrAccountCodeTh>Date</DateOrAccountCodeTh>
          <DescriptionTh>Description</DescriptionTh>
          <th
            scope="col"
            className="w-48 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
          >
            Transactions
          </th>
          <th
            scope="col"
            className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
          >
            Documents
          </th>
          <LinkedTh />
          <th scope="col" className="py-3.5" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {journalEntries.map((journalEntry) => (
          <JournalEntry key={journalEntry.id} journalEntry={journalEntry} />
        ))}
      </tbody>
    </Table>
  )
}
