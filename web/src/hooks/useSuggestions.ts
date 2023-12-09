import { useQuery } from '@tanstack/react-query'
import { JournalEntryUpsert } from '../../app/upsertJournalEntry'

export function useSuggestions() {
  return useQuery<JournalEntryUpsert[]>({
    queryKey: ['journalEntriesSuggestions'],
    queryFn: () =>
      fetch('/api/journalEntries/suggestions').then((res) => res.json()),
  })
}
