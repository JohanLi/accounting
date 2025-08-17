import { classNames } from '../utils'

type Props = {
  type: 'primary' | 'secondary'
  text: string
  onClick?: () => void
  disabled?: boolean
}

export function Button(props: Props) {
  return (
    <button
      type="button"
      className={classNames(
        props.type === 'primary' &&
          'cursor-pointer rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
        props.type === 'secondary' &&
          'cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50',
        props.disabled ? 'pointer-events-none opacity-40' : '',
      )}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  )
}
