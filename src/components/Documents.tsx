import { VerificationWithTransactionsAndDocuments } from '../pages/api/verifications'

type Props = {
  documents: VerificationWithTransactionsAndDocuments['documents']
}

export default function Documents({ documents }: Props) {
  if (documents.length === 0) {
    return null
  }

  return (
    <ul>
      {documents.map((document) => {
        const url = `/api/documents?id=${document.id}`

        return (
          <li key={document.id}>
            <a href={url} className="text-indigo-600 hover:text-indigo-900">
              {document.extension}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
