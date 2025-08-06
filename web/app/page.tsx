import { H1 } from './components/common/heading'
import NonLinkedTransactions from './nonLinkedTransactions/NonLinkedTransactions'
import Suggestions from './suggestions/Suggestions'

export default async function Home() {
  return (
    <>
      <H1>Home</H1>
      <Suggestions />
      <NonLinkedTransactions />
    </>
  )
}
