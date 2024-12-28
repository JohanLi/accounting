import { ReactNode } from 'react'

import { NextPageProps } from '../../types'
import SelectClient from './SelectClient'

type Props<T> = {
  searchParams: NextPageProps['searchParams']
  name: string
  defaultValue: T
  values: T[]
}

export function getSelect<T extends string | number>(
  props: Props<T>,
): [T, () => ReactNode] {
  const selectedValue =
    ((typeof props.defaultValue === 'number'
      ? parseInt(props.searchParams[props.name])
      : props.searchParams[props.name]) as T) || props.defaultValue

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
