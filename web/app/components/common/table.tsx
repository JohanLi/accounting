import { ReactNode } from 'react'
import { classNames } from '../../utils'

export function Table({ children }: { children: ReactNode }) {
  return (
    <table className="w-[60rem] divide-y divide-gray-300">{children}</table>
  )
}

export function DateOrAccountCodeTh({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
    >
      {children}
    </th>
  )
}

export function DateOrAccountCodeTd({ children }: { children: ReactNode }) {
  return (
    <td className="whitespace-nowrap py-4 pr-3 text-xs text-gray-500">
      {children}
    </td>
  )
}

export function DescriptionTh({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="py-3.5 pr-6 text-left text-sm font-semibold text-gray-900"
    >
      {children}
    </th>
  )
}

export function DescriptionTd({ children }: { children: ReactNode }) {
  return (
    <td className="whitespace-nowrap py-4 pr-6 text-sm font-medium text-gray-900">
      {children}
    </td>
  )
}

export function AmountTh({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="w-32 py-3.5 pr-3 text-right text-sm font-semibold text-gray-900"
    >
      {children}
    </th>
  )
}

export function AmountTd({ children }: { children: ReactNode }) {
  return (
    <td className="whitespace-nowrap py-4 pr-3 text-right text-sm">
      {children}
    </td>
  )
}

export function DocumentTh() {
  return <th scope="col" className="w-12" />
}

export function DocumentTd({ children }: { children: ReactNode }) {
  return (
    <td className="whitespace-nowrap py-4 text-sm text-gray-500">{children}</td>
  )
}

export function LinkedTh() {
  return <th scope="col" className="w-24" />
}

export function LinkedTd({
  children,
  right,
}: {
  children: ReactNode
  right?: true
}) {
  return (
    <td
      className={classNames(
        'relative whitespace-nowrap pl-3 text-xs font-medium',
        right ? 'text-right' : '',
      )}
    >
      {children}
    </td>
  )
}

const linkClass =
  'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
export function Link({ onClick }: { onClick?: () => void }) {
  if (!onClick) {
    return <div className={linkClass}>Linked</div>
  }

  return (
    <a
      href="#"
      className={classNames(linkClass, 'hover:bg-green-100')}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      Linked
    </a>
  )
}

export function AddLink({ onClick }: { onClick: () => void }) {
  return (
    <a
      href="#"
      className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 hover:bg-gray-100"
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      Add link
    </a>
  )
}
