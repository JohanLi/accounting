import { H1 } from './components/common/heading'
import Suggestions from './suggestions/Suggestions'
import DocumentUpload from './upload/DocumentUpload'

export default async function Home() {
  return (
    <>
      <H1>Home</H1>
      <DocumentUpload />
      <Suggestions />
    </>
  )
}
