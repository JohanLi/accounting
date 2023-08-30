import Layout from '../components/Layout'
import JournalEntryCreate from '../components/JournalEntryCreate'
import JournalEntries from './journalEntries'
import DocumentUpload from '../components/DocumentUpload'

export default function Home() {
  return (
    <Layout>
      <DocumentUpload />
      <JournalEntryCreate />
      <JournalEntries />
    </Layout>
  )
}
