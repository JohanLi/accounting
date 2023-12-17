import { formatAmount } from './Amount'
import { useEffect, useState } from 'react'

export type NumberOrMinus = number | '-'

export function toNumberOrMinus(value: string): NumberOrMinus {
  if (value === '-') {
    return value
  }

  const minusCount = value.split('-').length - 1

  const numberOrMinus: NumberOrMinus = parseInt(value.replace(/[^0-9]/g, ''))

  if (isNaN(numberOrMinus)) {
    return 0
  }

  return (minusCount === 1 ? -numberOrMinus : numberOrMinus) * 100
}

export function displayAmountInput(numberOrMinus: NumberOrMinus) {
  if (numberOrMinus === 0) {
    return ''
  }

  if (numberOrMinus === '-') {
    return numberOrMinus
  }

  return formatAmount(numberOrMinus)
}

type Props = {
  value: number
  onChange: (value: number) => void
  placeholder?: string
}

export function AmountInput(props: Props) {
  const [numberOrMinus, setNumberOrMinus] = useState<NumberOrMinus>(props.value)

  useEffect(() => {
    props.onChange(numberOrMinus === '-' ? 0 : numberOrMinus)
  }, [numberOrMinus])

  useEffect(() => {
    if (props.value === 0) {
      setNumberOrMinus(0)
    }
  }, [props.value])

  return (
    <input
      type="text"
      name="amount"
      value={displayAmountInput(numberOrMinus)}
      onChange={(e) => {
        setNumberOrMinus(toNumberOrMinus(e.target.value))
      }}
      placeholder={props.placeholder}
      autoComplete="off"
      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
    />
  )
}
