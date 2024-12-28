import { useFormStatus } from 'react-dom'

import { classNames } from '../utils'

type Props = {
  disabled: boolean
}

export function Submit(props: Props) {
  const status = useFormStatus()

  return (
    <button
      type="submit"
      className={classNames(
        'rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
        props.disabled || status.pending
          ? 'pointer-events-none opacity-40'
          : '',
      )}
    >
      Submit
    </button>
  )
}
