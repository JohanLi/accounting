import { expect, test, vi } from 'vitest'

import { getAllFiscalYearsInReverse, getCurrentFiscalYear } from './utils'

test('getCurrentFiscalYear', () => {
  vi.useFakeTimers()

  vi.setSystemTime(new Date('2022-12-31'))
  expect(getCurrentFiscalYear()).toEqual(2023)

  vi.setSystemTime(new Date('2023-06-30'))
  expect(getCurrentFiscalYear()).toEqual(2023)

  vi.setSystemTime(new Date('2023-07-01'))
  expect(getCurrentFiscalYear()).toEqual(2024)

  vi.useRealTimers()
})

test('getAllFiscalYearsInReverse', () => {
  vi.useFakeTimers()

  vi.setSystemTime(new Date('2023-03-11'))
  expect(getAllFiscalYearsInReverse()).toEqual([2023, 2022, 2021])

  vi.setSystemTime(new Date('2023-07-01'))
  expect(getAllFiscalYearsInReverse()).toEqual([2024, 2023, 2022, 2021])

  vi.setSystemTime(new Date('2025-06-30'))
  expect(getAllFiscalYearsInReverse()).toEqual([2025, 2024, 2023, 2022, 2021])

  vi.useRealTimers()
})
