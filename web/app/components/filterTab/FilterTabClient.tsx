'use client'

import { classNames } from '../../utils'
import Link from 'next/link'
import { useGetHref } from '../common/useGetHref'

type Props = {
  name: string
  defaultValue: string
  selectedValue: string
  items: { label: string; value: string }[]
}

export default function FilterTabClient(props: Props) {
  const getHref = useGetHref(props.name, props.defaultValue)

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {props.items.map((item) => (
          <Link
            key={item.value}
            href={getHref(item.value)}
            className={classNames(
              props.selectedValue === item.value
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
