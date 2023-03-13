export function Amount({ amount }: { amount: number }) {
  const color = amount > 0 ? 'text-green-600' : 'text-red-600'

  return (
    <span className={color}>
      {new Intl.NumberFormat('en-US').format(amount / 100)}
    </span>
  )
}
