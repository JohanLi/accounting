import JournalEntryForm from './JournalEntryForm'
import { getSuggestions } from '../suggestions/suggestions'

export default async function JournalEntrySuggestions() {
  const suggestions = await getSuggestions()

  return (
    <div className="mt-8">
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Suggestions
      </h1>
      <div className="mt-4">
        {suggestions.map((suggestion) => (
          <JournalEntryForm
            // TODO consider generating a key on the server instead
            key={`linkedToTransactionIds-${suggestion.linkedToTransactionIds.join(
              ',',
            )}-documentId-${suggestion.documentId}`}
            journalEntry={suggestion}
          />
        ))}
      </div>
    </div>
  )
}
