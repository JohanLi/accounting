import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LinksRequest } from '../pages/api/links'

export default function useLinksMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LinksRequest) =>
      fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['journalEntries'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ]),
  })
}
