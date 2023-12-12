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

export default function FilterPillClient(props: Props) {
  const getHref = useGetHref(props.name, props.defaultValue)

  let activeClass = 'bg-gray-200 text-gray-700'
  let inactiveClass = 'text-gray-500 hover:text-gray-700'
  let commonClass = 'rounded-md px-3 py-2 text-xs font-medium'

  /*
   This is an acceptable hack because this component only has two use cases
   Ideally, it'd accept color and size props
   */
  if (props.name === 'type') {
    activeClass = 'bg-indigo-200 text-indigo-700'
    inactiveClass = 'text-indigo-500 hover:text-indigo-700'
    commonClass = 'rounded-md px-4 py-3 text-sm font-medium'
  }

  return (
    <>
      {props.items.map((item) => (
        <Link
          key={item.value}
          href={getHref(item.value)}
          className={classNames(
            props.selectedValue === item.value ? activeClass : inactiveClass,
            commonClass,
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  )
}
