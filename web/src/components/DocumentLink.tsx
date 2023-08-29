type Props = {
  // TODO shouldn't need to have undefined here
  id?: number | null
}

export default function DocumentLink(props: Props) {
  if (!props.id) {
    return null
  }

  const url = `/api/documents?id=${props.id}`

  return (
    <a href={url} className="text-indigo-600 hover:text-indigo-900">
      pdf
    </a>
  )
}
