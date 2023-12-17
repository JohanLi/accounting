import { classNames } from '../utils'

/*
  I prefer sv-SE, because most documents involved with my accounting use space as the thousand separator.
  However, Intl.NumberFormat() sv-SE uses non-breaking spaces as well as the actual minus symbol,
  both of which are a nuisance.
 */
export function formatAmount(amount: number) {
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
    .format(amount / 100)
    .replace(/,/g, ' ')
}

/*
 I find that showing ören clutters the UI too much and have decided to remove it
 If I find cases where it's needed, perhaps the value can have a subtle underline
 and show ören on hover.
 */
export function Amount({ amount }: { amount: number }) {
  const color = amount > 0 ? 'text-green-600' : 'text-red-600'

  return (
    <span className={classNames(color, 'font-mono')}>
      {formatAmount(amount)}
    </span>
  )
}
