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
        isActive
          ? 'bg-gray-800 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white',
        'group flex gap-x-3 rounded-md px-4 py-2 text-sm font-semibold leading-6',
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
