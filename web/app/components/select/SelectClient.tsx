'use client'

import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Fragment, useCallback } from 'react'
import { classNames } from '../../utils'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Props = {
  name: string
  defaultValue: string
  selectedValue: string
  values: string[]
}

export default function SelectClient(props: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getHref = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams)

      if (value !== props.defaultValue) {
        params.set(props.name, value.toString())
      } else {
        params.delete(props.name)
      }

      if (params.toString() === '') {
        return pathname
      }

      return `${pathname}?${params.toString()}`
    },
    [searchParams],
  )

  return (
    <Menu as="div" className="relative inline-block">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {props.selectedValue}
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white text-right shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {props.values.map((value) => (
              <Menu.Item key={value}>
                {({ active }) => (
                  <Link
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      value === props.selectedValue
                        ? active
                          ? 'bg-gray-300'
                          : 'bg-gray-200'
                        : '',
                      'block cursor-pointer px-4 py-2 text-sm',
                    )}
                    href={getHref(value)}
                  >
                    {value}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
