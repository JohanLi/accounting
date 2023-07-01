import { classNames } from '../utils'

/*
 I find that showing ören clutters the UI too much and have decided to remove it
 If I find cases where it's needed, perhaps the value can have a subtle underline
 and show ören on hover.
 */
export function Amount({ amount }: { amount: number }) {
  const color = amount > 0 ? 'text-green-600' : 'text-red-600'

  return (
    <span className={classNames(color, 'font-mono')}>
      {new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(
        amount / 100,
      )}
    </span>
  )
}
