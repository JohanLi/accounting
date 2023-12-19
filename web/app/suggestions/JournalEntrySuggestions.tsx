import JournalEntryForm from '../journalEntries/JournalEntryForm'
import { getSuggestions } from './suggestions'

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
            key={`documentId-${
              suggestion.documentId
            }-linkedToTransactionIds-${suggestion.linkedToTransactionIds.join(
              ',',
            )}`}
            journalEntry={suggestion}
          />
        ))}
        {suggestions.length === 0 && (
          <span className="max-w-md text-sm text-gray-500">
            Upload a document or download documents and transactions to start
            seeing suggestions
          </span>
        )}
      </div>
    </div>
  )
}
