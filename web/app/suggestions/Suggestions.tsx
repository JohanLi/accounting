import { H2 } from '../components/common/heading'
import { SuggestionKnownForm } from './SuggestionKnownForm'
import { getSuggestions } from './getSuggestions'

export default async function Suggestions() {
  const suggestions =
    await getSuggestions()

  return (
    <div className="mt-8 space-y-8">
      <H2>Suggestions</H2>
      {suggestions.length > 0 && (
        <div>
          <div className="flex space-x-4">
            <div className="w-32 text-sm font-semibold text-gray-900">Date</div>
            <div className="w-96 text-sm font-semibold text-gray-900">
              Description
            </div>
            <div className="w-44 text-sm font-semibold text-gray-900">
              Transactions
            </div>
          </div>
          <div>
            {suggestions.map((suggestion) => (
              <SuggestionKnownForm
                key={`documentId-${
                  suggestion.documentId
                }-linkedToTransactionIds-${suggestion.linkedToTransactionIds.join(
                  ',',
                )}`}
                suggestion={suggestion}
              />
            ))}
          </div>
        </div>
      )}
      {suggestions.length === 0 && (
          <div>
            <span className="max-w-md text-sm text-gray-500">
              Download documents and transactions to start
              seeing suggestions
            </span>
          </div>
        )}
    </div>
  )
}
