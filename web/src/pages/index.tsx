import Layout from '../components/Layout'
import JournalEntryCreate from '../components/JournalEntryCreate'
import JournalEntries from '../components/JournalEntries'
import DocumentUpload from '../components/DocumentUpload'

export default function Home() {
  return (
    <Layout title="Home">
      <DocumentUpload />
      <JournalEntryCreate />
      <JournalEntries />
    </Layout>
  )
}
