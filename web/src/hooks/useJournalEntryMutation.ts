import { useMutation, useQueryClient } from '@tanstack/react-query'
import { JournalEntryUpsert } from '../pages/api/journalEntries'

export default function useJournalEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: JournalEntryUpsert) =>
      fetch('/api/journalEntries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['journalEntries'] }),
        queryClient.invalidateQueries({
          queryKey: ['journalEntriesSuggestions'],
        }),
      ]),
  })
}
