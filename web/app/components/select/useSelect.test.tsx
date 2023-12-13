import { expect, describe, test } from 'vitest'
import { useSelect } from './useSelect'

describe('useSelect', () => {
  test('returns default value if no search params exist', () => {
    expect(
      useSelect({
        searchParams: {},
        name: 'type',
        defaultValue: '1',
        values: ['1', '2'],
      })[0],
    ).toEqual('1')

    expect(
      useSelect({
        searchParams: {
          typo: '3',
        },
        name: 'type',
        defaultValue: '2',
        values: ['1', '2'],
      })[0],
    ).toEqual('2')
  })

  test('selected value is parsed as number if default value is number', () => {
    expect(
      useSelect({
        searchParams: {
          fiscalYear: '2022',
        },
        name: 'fiscalYear',
        defaultValue: 2023,
        values: [2023, 2022, 2021],
      })[0],
    ).toEqual(2022)
  })
})
