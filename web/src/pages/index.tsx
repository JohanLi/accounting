import Layout from '../components/Layout'
import JournalEntryCreate from '../components/JournalEntryCreate'
import JournalEntries from './journalEntries'

export default function Home() {
  return (
    <Layout>
      <JournalEntryCreate />
      <JournalEntries />
    </Layout>
  )
}
