import { ReactNode } from 'react'

/*
  When creating or editing journal entries, I prefer to have all forms inlined.
  This app is also not intended to be responsive — I only ever use it on desktop.

  Because of the above reasons, I've found it more convenient to use divs
  rather than tables (where you have to keep track of colspan).
 */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div role="table" className="divide-y divide-gray-300">
      {children}
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <div role="rowgroup">
      <div
        role="row"
        className="flex py-3.5 text-sm font-semibold text-gray-900"
      >
        {children}
      </div>
    </div>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return (
    <div role="rowgroup" className="divide-y divide-gray-200">
      {children}
    </div>
  )
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <div role="row" className="flex items-center py-4">
      {children}
    </div>
  )
}

export function DateOrAccountCodeTh({ children }: { children: ReactNode }) {
  return (
    <div
      role="columnheader"
      className="w-32 text-left text-sm font-semibold text-gray-900"
    >
      {children}
    </div>
  )
}

export function DateOrAccountCodeTd({ children }: { children: ReactNode }) {
  return (
    <div role="cell" className="whitespace-nowrap w-32 text-xs text-gray-500">
      {children}
    </div>
  )
}

export function DescriptionTh({ children }: { children: ReactNode }) {
  return (
    <div
      role="columnheader"
      className="flex-1 pr-6 text-left text-sm font-semibold text-gray-900"
    >
      {children}
    </div>
  )
}

export function DescriptionTd({ children }: { children: ReactNode }) {
  return (
    <div
      role="cell"
      className="whitespace-nowrap flex-1 pr-6 text-sm font-medium text-gray-900"
    >
      {children}
    </div>
  )
}

export function TransactionsTh({ children }: { children: ReactNode }) {
  return (
    <div
      role="columnheader"
      className="w-44 text-left text-sm font-semibold text-gray-900"
    >
      {children}
    </div>
  )
}

export function TransactionsTd({ children }: { children: ReactNode }) {
  return (
    <div role="cell" className="whitespace-nowrap w-44 text-sm text-gray-500">
      {children}
    </div>
  )
}

export function AmountTh({ children }: { children: ReactNode }) {
  return (
    <div
      role="columnheader"
      className="w-32 text-right text-sm font-semibold text-gray-900"
    >
      {children}
    </div>
  )
}

export function AmountTd({ children }: { children: ReactNode }) {
  return (
    <div role="cell" className="whitespace-nowrap w-32 text-right text-sm">
      {children}
    </div>
  )
}

export function DocumentTh() {
  return <div role="columnheader" className="w-12" />
}

export function DocumentTd({ children }: { children: ReactNode }) {
  return (
    <div
      role="cell"
      className="w-12 whitespace-nowrap text-sm text-gray-500 text-right"
    >
      {children}
    </div>
  )
}

export function LinkedTh() {
  return <div role="columnheader" className="w-24" />
}

export function LinkedTd({ children }: { children: ReactNode }) {
  return (
    <div
      role="cell"
      className="whitespace-nowrap w-24 text-xs font-medium -my-3.5 flex justify-end"
    >
      {children}
    </div>
  )
}

export function EditTh() {
  return <div role="columnheader" className="w-24" />
}

export function EditTd({ children }: { children: ReactNode }) {
  return (
    <div role="cell" className="w-24 space-x-2 text-right">
      {children}
    </div>
  )
}
