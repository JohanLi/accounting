'use client'

import Link from 'next/link'

import { classNames } from '../../utils'
import { useGetHref } from '../common/useGetHref'

type Props = {
  name: string
  defaultValue: string
  selectedValue: string
  items: { label: string; value: string }[]
}

export default function FilterPillClient(props: Props) {
  const getHref = useGetHref(props.name, props.defaultValue)

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
