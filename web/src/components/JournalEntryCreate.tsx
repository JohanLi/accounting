import { useState } from 'react'
import JournalEntryCreateForm from './JournalEntryCreateForm'
import { Button } from './Button'

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
        <JournalEntryCreateForm onClose={() => setCreateBlank(false)} />
      )}
    </>
  )
}
