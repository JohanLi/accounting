import DocumentLinks from './DocumentLinks'
import { useQuery } from '@tanstack/react-query'
import DocumentUpload from './DocumentUpload'
import { DocumentsResponse } from '../pages/api/documents'

export default function Documents() {
  const documents = useQuery<DocumentsResponse>({
    queryKey: ['documents'],
    queryFn: () => fetch('/api/documents').then((res) => res.json()),
  })

  if (!documents.data) {
    return null
  }

  return (
    <>
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Documents
      </h1>
      <DocumentUpload />
      <h2 className="text-base font-semibold leading-6 text-gray-900">
        Pending
      </h2>
      <table className="mt-4 min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Filename
            </th>
            <th
              scope="col"
              className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            ></th>
            <th scope="col" className="w-16 py-3.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {documents.data.map((document) => (
            <tr key={document.id}>
              <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                {document.filename}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <DocumentLinks documents={[document]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
