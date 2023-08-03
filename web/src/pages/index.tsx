import Layout from '../components/Layout'
import Totals from '../components/Totals'
import Actions from '../components/Actions'
import PendingDocuments from '../components/PendingDocuments'

export default function Home() {
  return (
    <Layout>
      <PendingDocuments />
      <Totals />
      <Actions />
    </Layout>
  )
}
