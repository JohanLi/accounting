import { H1 } from './components/common/heading'
import Suggestions from './suggestions/Suggestions'
import NonLinkedTransactions from "./nonLinkedTransactions/NonLinkedTransactions";

export default async function Home() {
  return (
    <>
      <H1>Home</H1>
      <Suggestions />
      <NonLinkedTransactions />
    </>
  )
}
