import { classNames } from '../utils'

export function Amount({ amount }: { amount: number }) {
  const color = amount > 0 ? 'text-green-600' : 'text-red-600'

  return (
    <span className={classNames(color, 'font-mono')}>
      {new Intl.NumberFormat('en-US').format(amount / 100)}
    </span>
  )
}
