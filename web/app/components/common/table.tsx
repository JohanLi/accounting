import { ReactNode } from 'react'

import { classNames } from '../../utils'

export function Table({ children }: { children: ReactNode }) {
  return <table className="w-full divide-y divide-gray-300">{children}</table>
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
        'whitespace-nowrap pl-3 text-xs font-medium',
        right ? 'text-right' : '',
      )}
    >
      {children}
    </td>
  )
}
