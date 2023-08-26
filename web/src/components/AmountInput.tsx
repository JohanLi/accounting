type Props = {
  value: number
  onChange: (value: number) => void
  placeholder?: string
}

/*
 test cases:
 - formats the string, e.g., '100000' becomes '100 000'
 - non-numeric characters are removed
 - having no numeric characters (or '0') should make the input an empty string
 - handling negative numbers
 */

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(
    amount / 100,
  )
}

// input name="" needs to be there, otherwise Chrome treats it as a password field
export function AmountInput(props: Props) {
  return (
    <input
      type="text"
      name="amount"
      value={props.value === 0 ? '' : formatAmount(props.value)}
      onChange={(e) => {
        const value = e.target.value.replace(/[^0-9]/g, '')

        if (!value) {
          props.onChange(0)
          return
        }

        // the non-minus sign seems to be caused by formatAmount()
        const isNegative = ['-', '−'].includes(e.target.value[0])

        // known limitation: can't begin inputting "-". Need to type the number first, and then add the minus sign
        if (isNegative) {
          props.onChange(-Math.abs(parseInt(value) * 100))
        } else {
          props.onChange(parseInt(value) * 100)
        }
      }}
      placeholder={props.placeholder}
      autoComplete="off"
      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
    />
  )
}
