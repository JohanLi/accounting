'use client'

import JournalEntryCreate from '../src/components/JournalEntryCreate'
import JournalEntries from '../src/components/JournalEntries'
import DocumentUpload from '../src/components/DocumentUpload'

export default function Home() {
  return (
    <>
      <DocumentUpload />
      <JournalEntryCreate />
      <JournalEntries />
    </>
  )
}
