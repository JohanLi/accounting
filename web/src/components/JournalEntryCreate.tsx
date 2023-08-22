import { useState } from 'react'
import JournalEntryForm from './JournalEntryForm'
import { Button } from './Button'
import JournalEntrySuggestions from './JournalEntrySuggestions'

export default function JournalEntryCreate() {
  const [createBlank, setCreateBlank] = useState(false)

  return (
    <>
      {!createBlank && (
        <Button
          type="primary"
          onClick={() => setCreateBlank(true)}
          text="Create blank"
        />
      )}
      {createBlank && (
        <JournalEntryForm onClose={() => setCreateBlank(false)} />
      )}
      <JournalEntrySuggestions />
    </>
  )
}
