import { ReactNode } from 'react'

export function H1(props: { children: ReactNode }) {
  return (
    <h1 className="pb-8 text-3xl leading-tight font-bold tracking-tight text-gray-900">
      {props.children}
    </h1>
  )
}

export function H2(props: { children: ReactNode }) {
  return (
    <h2 className="text-base leading-6 font-semibold text-gray-900">
      {props.children}
    </h2>
  )
}
