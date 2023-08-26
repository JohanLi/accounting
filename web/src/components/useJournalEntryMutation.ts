import { useMutation, useQueryClient } from '@tanstack/react-query'
import { JournalEntryInsert } from '../pages/api/journalEntries'

export default function useJournalEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: JournalEntryInsert) =>
      fetch('/api/journalEntries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['journalEntries'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({
          queryKey: ['journalEntriesSuggestions'],
        }),
      ]),
  })
}
