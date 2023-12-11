import SelectClient from './SelectClient'
import { NextPageProps } from '../../types'
import { ReactNode } from 'react'

type Props<T> = {
  searchParams: NextPageProps['searchParams']
  name: string
  defaultValue: T
  values: T[]
}

export function useSelect<T extends string | number>(
  props: Props<T>,
): [T, () => ReactNode] {
  const selectedValue =
    (props.searchParams[props.name] as T) || props.defaultValue

  return [
    selectedValue,
    () => (
      <SelectClient
        name={props.name}
        defaultValue={props.defaultValue.toString()}
        selectedValue={selectedValue.toString()}
        values={props.values.map((v) => v.toString())}
      />
    ),
  ]
}
