import { useQuery } from '@tanstack/react-query'
import DocumentUpload from './DocumentUpload'
import { PendingDocumentsResponse } from '../pages/api/documentsPending'
import { DateFormatted } from './DateFormatted'

export default function Documents() {
  const documents = useQuery<PendingDocumentsResponse>({
    queryKey: ['documents'],
    queryFn: () => fetch('/api/documentsPending').then((res) => res.json()),
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
      <h2 className="mt-8 text-base font-semibold leading-6 text-gray-900">
        Pending
      </h2>
      <table className="mt-4 min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              ID
            </th>
            <th
              scope="col"
              className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Filename
            </th>
            <th
              scope="col"
              className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Values
            </th>
            <th
              scope="col"
              className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Dates
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {documents.data.map((document) => (
            <tr key={document.id}>
              <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                {document.id}
              </td>
              <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                <a
                  href={`/api/documents?id=${document.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {document.filename}
                </a>
              </td>
              <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                {document.values.map((value, i) => (
                  <div key={i}>
                    {value}
                    {document.foreignCurrency && ` ${document.foreignCurrency}`}
                  </div>
                ))}
              </td>
              <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
                {document.dates.map((date, i) => (
                  <div key={i}>
                    <DateFormatted date={date} />
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
