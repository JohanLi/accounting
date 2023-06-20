import { useRouter } from 'next/router'
import Link, { LinkProps } from 'next/link'
import { PropsWithChildren } from 'react'

/*
 Simplified version of https://github.com/vercel/next.js/blob/canary/examples/active-class-name/components/ActiveLink.tsx
 Supports SSR as well
 */

type ActiveLinkProps = LinkProps & {
  className?: string
  conditionalClassNames: [string, string]
}

export default function ActiveLink({
  children,
  className,
  conditionalClassNames,
  ...props
}: PropsWithChildren<ActiveLinkProps>) {
  const { pathname } = useRouter()

  const isActive = pathname === props.href

  const newClassName = `${className} ${
    isActive ? conditionalClassNames[0] : conditionalClassNames[1]
  }`.trim()

  return (
    <Link className={newClassName} {...props}>
      {children}
    </Link>
  )
}
