import { useQuery } from '@tanstack/react-query'
import { JournalEntry as JournalEntryType } from '../pages/api/journalEntries'

export default function useJournalEntries() {
  return useQuery<JournalEntryType[]>({
    queryKey: ['journalEntries'],
    queryFn: () => fetch('/api/journalEntries').then((res) => res.json()),
  })
}
