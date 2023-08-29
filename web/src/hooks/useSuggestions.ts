import { useQuery } from '@tanstack/react-query'
import { JournalEntryUpsert } from '../pages/api/journalEntries'

export function useSuggestions() {
  return useQuery<JournalEntryUpsert[]>({
    queryKey: ['journalEntriesSuggestions'],
    queryFn: () =>
      fetch('/api/journalEntries/suggestions').then((res) => res.json()),
  })
}
