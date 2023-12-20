import DocumentUpload from './upload/DocumentUpload'
import JournalEntrySuggestions from './suggestions/JournalEntrySuggestions'
import { H1 } from './components/common/heading'

export default async function Home() {
  return (
    <>
      <H1>Home</H1>
      <DocumentUpload />
      <JournalEntrySuggestions />
    </>
  )
}
