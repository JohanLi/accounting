import JournalEntryForm from './JournalEntryForm'
import { useSuggestions } from '../hooks/useSuggestions'

export default function JournalEntrySuggestions() {
  const suggestions = useSuggestions()

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
            // TODO consider generating a key on the server instead
            key={`linkedToTransactionIds-${suggestion.linkedToTransactionIds.join(
              ',',
            )}-documentId-${suggestion.documentId}`}
            journalEntry={suggestion}
            onClose={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
