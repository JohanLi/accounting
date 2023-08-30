import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DocumentUpload } from '../pages/api/documents'

export function useDocumentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: DocumentUpload[]) =>
      fetch('/api/documents', {
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
