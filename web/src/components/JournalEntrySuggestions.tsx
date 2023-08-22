import JournalEntryForm from './JournalEntryForm'
import { useQuery } from '@tanstack/react-query'
import { SuggestionsResponse } from '../pages/api/journalEntries/suggestions'

export default function JournalEntrySuggestions() {
  const suggestions = useQuery<SuggestionsResponse>({
    queryKey: ['journalEntriesSuggestions'],
    queryFn: () =>
      fetch('/api/journalEntries/suggestions').then((res) => res.json()),
  })

  if (!suggestions.data) {
    return null
  }

  return (
    <div className="mt-8">
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Suggestions
      </h1>
      <div className="mt-4">
        {suggestions.data.map((suggestion) => (
          <JournalEntryForm
            key={suggestion.linkedToTransactionIds.join(',')}
            journalEntry={suggestion}
            onClose={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
