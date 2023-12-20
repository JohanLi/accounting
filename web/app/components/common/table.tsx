import { ReactNode } from 'react'

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
      className="py-3.5 pr-12 text-left text-sm font-semibold text-gray-900"
    >
      {children}
    </th>
  )
}

export function DescriptionTd({ children }: { children: ReactNode }) {
  return (
    <td className="whitespace-nowrap py-4 pr-12 text-sm font-medium text-gray-900">
      {children}
    </td>
  )
}

export function AmountTh({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="w-32 py-3.5 text-right text-sm font-semibold text-gray-900"
    >
      {children}
    </th>
  )
}

export function AmountTd({ children }: { children: ReactNode }) {
  return (
    <td className="whitespace-nowrap py-4 text-right text-sm">{children}</td>
  )
}

export function LinkedTh() {
  return (
    <th
      scope="col"
      className="w-32 py-3.5 pl-12 text-left text-sm font-semibold text-gray-900"
    >
      Linked
    </th>
  )
}

export function LinkedTd({ children }: { children: ReactNode }) {
  return (
    <td className="relative whitespace-nowrap pl-12 text-xs font-medium">
      {children}
    </td>
  )
}
