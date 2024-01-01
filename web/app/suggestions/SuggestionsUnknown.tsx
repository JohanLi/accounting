'use client'

import { SuggestionFromUnknown } from './getSuggestions'
import { Category, SuggestionsUnknownForm } from './SuggestionsUnknownForm'
import { useState } from 'react'

export default function SuggestionsUnknown({
  suggestions,
}: {
  suggestions: SuggestionFromUnknown[]
}) {
  /*
    Letting a single form select/change the category for all forms is intentional.
    The idea is that I typically upload receipts that belong to the same category in the same batch.
    There's probably a more elegant solution UI-wise, but this will do.
   */
  const [selectedCategory, setSelectedCategory] = useState<Category>()

  return (
    <div>
      <div className="flex space-x-4">
        <div className="w-64 text-sm font-semibold text-gray-900">
          Bank transactions
        </div>
        <div className="w-64 text-sm font-semibold text-gray-900">
          Description
        </div>
        <div className="flex items-center text-sm font-semibold text-gray-900">
          Transactions
          {!!selectedCategory && (
            <span
              className="-m-3 ml-2 inline-flex cursor-pointer items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              onClick={() => setSelectedCategory(undefined)}
            >
              {selectedCategory.name}
            </span>
          )}
        </div>
      </div>
      <div>
        {suggestions.map((suggestion) => (
          <SuggestionsUnknownForm
            key={`documentId-${suggestion.documentId}`}
            suggestion={suggestion}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        ))}
      </div>
    </div>
  )
}
