import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getPreviousFiscalYearQuarter } from './exportVATReport'

describe('getPreviousFiscalYearQuarter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const cases = [
    {
      date: '2025-08-02',
      expected: { fiscalYear: 2025, quarter: 4 },
    },
    {
      date: '2024-04-01',
      expected: { fiscalYear: 2024, quarter: 3 },
    },
    {
      date: '2025-06-30',
      expected: { fiscalYear: 2025, quarter: 3 },
    },
    {
      date: '2024-07-01',
      expected: { fiscalYear: 2024, quarter: 4 },
    },
    {
      date: '2024-10-01',
      expected: { fiscalYear: 2025, quarter: 1 },
    },
    {
      date: '2023-01-01',
      expected: { fiscalYear: 2023, quarter: 2 },
    },
  ]

  cases.forEach(({ date, expected }) => {
    test(`returns FY${expected.fiscalYear} Q${expected.quarter} for ${date}`, () => {
      vi.setSystemTime(date)
      expect(getPreviousFiscalYearQuarter()).toEqual(expected)
    })
  })
})
