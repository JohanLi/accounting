import { Document } from '@prisma/client'

type Props = {
  documents: Document[]
}

export default function Documents({ documents }: Props) {
  if (documents.length === 0) {
    return null
  }

  return (
    <ul>
      {documents.map((document) => {
        const url = `/documents/${document.id}.${document.extension}`

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
