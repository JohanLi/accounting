import Layout from '../components/Layout'
import Totals from '../components/Totals'
import Actions from '../components/Actions'
import Documents from '../components/Documents'

export default function Home() {
  return (
    <Layout>
      <Documents />
      <Totals />
      <Actions />
    </Layout>
  )
}
