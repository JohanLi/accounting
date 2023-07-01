export function DateFormatted({ date }: { date: string | Date }) {
  return (
    <span className="font-mono">
      {new Date(date).toLocaleDateString('sv-SE')}
    </span>
  )
}
