import SelectClient from './SelectClient'
import { NextPageProps } from '../../types'

type Props = {
  searchParams: NextPageProps['searchParams']
  name: string
  defaultValue: string
  values: string[]
}

export function useSelect(props: Props): [string, () => JSX.Element] {
  const selectedValue = props.searchParams[props.name] || props.defaultValue

  return [
    selectedValue,
    () => (
      <SelectClient
        name={props.name}
        defaultValue={props.defaultValue}
        selectedValue={selectedValue}
        values={props.values}
      />
    ),
  ]
}
