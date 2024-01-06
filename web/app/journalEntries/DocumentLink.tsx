import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type Props = {
  id: number | null
}

export default function DocumentLink(props: Props) {
  if (!props.id) {
    return null
  }

  // TODO should be covered by an e2e test
  const url = `/api/documents?id=${props.id}`

  return (
    <Link
      href={url}
      className="inline-flex p-1 text-gray-400 hover:text-gray-500"
    >
      <DocumentMagnifyingGlassIcon className="h-5 w-5" />
    </Link>
  )
}
