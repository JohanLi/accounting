'use client'

import { useCallback } from 'react'
import { classNames } from '../../utils'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Props = {
  name: string
  defaultValue: string
  selectedValue: string
  items: { label: string; value: string }[]
}

export default function FilterPillClient(props: Props) {
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
    <>
      {props.items.map((item) => (
        <Link
          key={item.value}
          href={getHref(item.value)}
          className={classNames(
            props.selectedValue === item.value
              ? 'bg-gray-200 text-gray-700'
              : 'text-gray-500 hover:text-gray-700',
            'rounded-md px-3 py-2 text-xs font-medium',
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  )
}
