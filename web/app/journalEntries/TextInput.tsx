type Props = {
  value: string
  onChange: (value: string) => void
}

export function TextInput(props: Props) {
  return (
    <input
      type="text"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset"
    />
  )
}
