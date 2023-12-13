import FilterPillClient from './FilterPillClient'
import { NextPageProps } from '../../types'
import { ReactNode } from 'react'

type Props<T> = {
  searchParams: NextPageProps['searchParams']
  name: string
  defaultValue: T
  items: { label: string; value: T }[]
}

export function useFilterPill<T extends string | number>(
  props: Props<T>,
): [T, () => ReactNode] {
  const selectedValue =
    ((typeof props.defaultValue === 'number'
      ? parseInt(props.searchParams[props.name])
      : props.searchParams[props.name]) as T) || props.defaultValue

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
