import DocumentUpload from './upload/DocumentUpload'
import Suggestions from './suggestions/Suggestions'
import { H1 } from './components/common/heading'

export default async function Home() {
  return (
    <>
      <H1>Home</H1>
      <DocumentUpload />
      <Suggestions />
    </>
  )
}
