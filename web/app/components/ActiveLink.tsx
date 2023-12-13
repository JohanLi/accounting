'use client'

import { usePathname } from 'next/navigation'
import Link, { LinkProps } from 'next/link'
import { PropsWithChildren } from 'react'
import { classNames } from '../utils'

// https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#checking-active-links
export default function ActiveLink({
  children,
  ...props
}: PropsWithChildren<LinkProps>) {
  const pathname = usePathname()
  const isActive = pathname === props.href

  return (
    <Link
      className={classNames(
        'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
        isActive
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
