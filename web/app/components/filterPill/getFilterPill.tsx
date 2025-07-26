import { ReactNode } from 'react'

import { NextPageProps } from '../../types'
import { getSearchParam } from '../../utils'
import FilterPillClient from './FilterPillClient'

type Props<T> = {
  searchParams: Awaited<NextPageProps['searchParams']>
  name: string
  defaultValue: T
  items: { label: string; value: T }[]
}

export function getFilterPill<T extends string | number>(
  props: Props<T>,
): [T, () => ReactNode] {
  const value = getSearchParam(props.searchParams, props.name)

  const selectedValue =
    ((typeof props.defaultValue === 'number' ? parseInt(value) : value) as T) ||
    props.defaultValue

  return [
    selectedValue,
    () => (
      <FilterPillClient
        name={props.name}
        defaultValue={props.defaultValue.toString()}
        selectedValue={selectedValue.toString()}
        items={props.items.map((i) => ({
          label: i.label,
          value: i.value.toString(),
        }))}
      />
    ),
  ]
}
