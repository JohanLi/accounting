import { expect, test, vi } from 'vitest'

import {
  getAllFiscalYearsInReverse,
  getCurrentFiscalYear,
  getFiscalYear,
  getFiscalYearQuarter,
  getIncomeYear,
} from './utils'

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

test('getFiscalYear', () => {
  expect(getFiscalYear(2023)).toEqual({
    startInclusive: new Date('2022-07-01'),
    endInclusive: new Date('2023-06-30'),
    endExclusive: new Date('2023-07-01'),
  })
})

test('getFiscalYearQuarter', () => {
  expect(getFiscalYearQuarter(2023, 1)).toEqual({
    startInclusive: new Date('2022-07-01'),
    endInclusive: new Date('2022-09-30'),
    endExclusive: new Date('2022-10-01'),
  })

  expect(getFiscalYearQuarter(2024, 4)).toEqual({
    startInclusive: new Date('2024-04-01'),
    endInclusive: new Date('2024-06-30'),
    endExclusive: new Date('2024-07-01'),
  })

  // the Q2/Q3 boundary crosses from summer to winter time in Sweden
  expect(getFiscalYearQuarter(2026, 2)).toEqual({
    startInclusive: new Date('2025-10-01'),
    endInclusive: new Date('2025-12-31'),
    endExclusive: new Date('2026-01-01'),
  })

  expect(getFiscalYearQuarter(2026, 3)).toEqual({
    startInclusive: new Date('2026-01-01'),
    endInclusive: new Date('2026-03-31'),
    endExclusive: new Date('2026-04-01'),
  })
})

test('getIncomeYear', () => {
  expect(getIncomeYear(2023)).toEqual({
    startInclusive: new Date('2023-01-01'),
    endInclusive: new Date('2023-12-31'),
    endExclusive: new Date('2024-01-01'),
  })
})
