'use client'

import { Popover } from '@headlessui/react'

import { classNames } from '../../utils'

export function AddLinkButton({ open }: { open: boolean }) {
  return (
    <Popover.Button
      className={classNames(
        'cursor-pointer inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-600/20 hover:bg-gray-100 focus:outline-hidden',
        open ? 'bg-gray-100' : 'bg-gray-50',
      )}
    >
      Add link
    </Popover.Button>
  )
}

export function EditLinkButton({ open }: { open: boolean }) {
  return (
    <Popover.Button
      className={classNames(
        'cursor-pointer inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-100 focus:outline-hidden',
        open ? 'bg-green-100' : 'bg-green-50',
      )}
    >
      Linked
    </Popover.Button>
  )
}

export function Linked() {
  return (
    <div className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 focus:outline-hidden">
      Linked
    </div>
  )
}
