import { classNames } from '../utils'

const typeClass = {
  primary:
    'cursor-pointer rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  secondary:
    'cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
}

type Type = keyof typeof typeClass

type Props = {
  type: Type
  text: string
  onClick?: () => void
  disabled?: boolean
}

export function Button(props: Props) {
  return (
    <button
      type="button"
      className={classNames(
        typeClass[props.type],
        props.disabled ? 'pointer-events-none opacity-40' : '',
      )}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  )
}
