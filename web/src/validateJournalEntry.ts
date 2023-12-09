import { JournalEntryUpsert } from '../app/upsertJournalEntry'

export class JournalEntryInputError extends Error {}

export function validate(entry: JournalEntryUpsert) {
  if (!entry.date) {
    throw new JournalEntryInputError('Date not provided')
  }

  entry.transactions = entry.transactions.filter((t) => t.amount !== 0)

  const isBalanced =
    entry.transactions.reduce((acc, v) => acc + v.amount, 0) === 0

  if (!isBalanced) {
    throw new JournalEntryInputError('Transactions do not balance')
  }

  return entry
}
