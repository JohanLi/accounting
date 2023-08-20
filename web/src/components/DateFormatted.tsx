export function DateFormatted({ date }: { date: string | Date }) {
  return <span className="font-mono">{formatDate(date)}</span>
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('sv-SE')
}
