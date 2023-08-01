import Layout from '../components/Layout'
import Upload from '../components/Upload'
import Totals from '../components/Totals'
import Actions from '../components/Actions'
import JournalEntries from '../components/JournalEntries'

export default function Home() {
  return (
    <Layout>
      <Upload />
      <Totals />
      <Actions />
      <JournalEntries />
    </Layout>
  )
}
