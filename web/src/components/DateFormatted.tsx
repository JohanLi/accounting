export function DateFormatted({ date }: { date: string | Date }) {
  return (
    <span className="font-mono text-gray-500">
      {new Date(date).toLocaleDateString('sv-SE')}
    </span>
  )
}
