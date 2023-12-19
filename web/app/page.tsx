import DocumentUpload from './upload/DocumentUpload'
import JournalEntrySuggestions from './suggestions/JournalEntrySuggestions'

export default async function Home() {
  return (
    <>
      <DocumentUpload />
      <JournalEntrySuggestions />
    </>
  )
}
