import Documents from '../components/Documents'
import { useQuery } from '@tanstack/react-query'
import { PendingDocumentsResponse } from '../pages/api/documentsPending'
import PendingDocumentsUpload from './PendingDocumentsUpload'

export default function PendingDocuments() {
  const documents = useQuery<PendingDocumentsResponse>({
    queryKey: ['pendingDocuments'],
    queryFn: () => fetch('/api/documentsPending').then((res) => res.json()),
  })

  if (!documents.data) {
    return null
  }

  return (
    <>
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Pending documents
      </h1>
      <PendingDocumentsUpload />
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
                <Documents documents={[document]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
