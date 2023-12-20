import { ReactNode } from 'react'

export function H1(props: { children: ReactNode }) {
  return (
    <h1 className="pb-8 text-3xl font-bold leading-tight tracking-tight text-gray-900">
      {props.children}
    </h1>
  )
}
