'use client'

import { usePathname } from 'next/navigation'
import Link, { LinkProps } from 'next/link'
import { PropsWithChildren } from 'react'

/*
 Simplified version of https://github.com/vercel/next.js/blob/canary/examples/active-class-name/components/ActiveLink.tsx
 Supports SSR as well
 */

type ActiveLinkProps = LinkProps & {
  conditionalClassNames: [string, string]
  className?: string
  startsWith?: string
}

export default function ActiveLink({
  children,
  conditionalClassNames,
  className,
  startsWith,
  ...props
}: PropsWithChildren<ActiveLinkProps>) {
  const pathname = usePathname() || ''

  const isActive = !startsWith
    ? pathname === props.href
    : pathname.startsWith(startsWith)

  const newClassName = `${className} ${
    isActive ? conditionalClassNames[0] : conditionalClassNames[1]
  }`.trim()

  return (
    <Link className={newClassName} {...props}>
      {children}
    </Link>
  )
}
