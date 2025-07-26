import { ReactNode } from 'react'

import { NextPageProps } from '../../types'
import SelectClient from './SelectClient'
import { getSearchParam } from '../../utils'

type Props<T> = {
  searchParams: Awaited<NextPageProps['searchParams']>
  name: string
  defaultValue: T
  values: T[]
}

export function getSelect<T extends string | number>(
  props: Props<T>,
): [T, () => ReactNode] {
  const value = getSearchParam(props.searchParams, props.name)

  const selectedValue =
    ((typeof props.defaultValue === 'number'
      ? parseInt(value)
      : value) as T) || props.defaultValue

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
