/*
  I prefer sv-SE, because most documents involved with my accounting use space as the thousand separator.
  However, Intl.NumberFormat() sv-SE uses non-breaking spaces as well as the actual minus symbol,
  both of which are a nuisance.
 */
export function displayCentsAsDollars(amount: number | '-') {
  if (amount === 0) {
    return ''
  }

  if (amount === '-') {
    return amount
  }

  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
    .format(amount / 100)
    .replace(/,/g, ' ')
}

export function displayToCents(display: string) {
  let isNegative = false

  if (display[0] === '-') {
    isNegative = true

    if (display.length === 1) {
      return '-'
    }
  }

  const value = display.replace(/[^0-9]/g, '')

  if (!value) {
    return 0
  }

  return parseInt(value) * 100 * (isNegative ? -1 : 1)
}

export type NumberOrMinus = number | '-'

type Props = {
  value: NumberOrMinus
  onChange: (value: NumberOrMinus) => void
  placeholder?: string
}

export function AmountInput(props: Props) {
  return (
    <input
      type="text"
      name="amount"
      value={displayCentsAsDollars(props.value)}
      onChange={(e) => {
        props.onChange(displayToCents(e.target.value))
      }}
      placeholder={props.placeholder}
      autoComplete="off"
      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
    />
  )
}
