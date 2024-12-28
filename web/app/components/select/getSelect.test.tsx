import { describe, expect, test } from 'vitest'

import { getSelect } from './getSelect'

describe('getSelect', () => {
  test('returns default value if no search params exist', () => {
    expect(
      getSelect({
        searchParams: {},
        name: 'type',
        defaultValue: '1',
        values: ['1', '2'],
      })[0],
    ).toEqual('1')

    expect(
      getSelect({
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
      getSelect({
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
