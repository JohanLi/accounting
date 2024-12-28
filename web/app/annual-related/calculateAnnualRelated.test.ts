import { describe, expect, test } from 'vitest'

import { calculateCorporateTax } from './calculateAnnualRelated'

describe('corporate tax', () => {
  test('is 0 if no taxable profit', () => {
    expect(calculateCorporateTax(0)).toEqual(0)
    expect(calculateCorporateTax(-100000)).toEqual(0)
  })

  test('is 20.6% of the taxable profit', () => {
    expect(calculateCorporateTax(0)).toEqual(0)
    expect(calculateCorporateTax(100000)).toEqual(20600)
  })

  test('the taxable profit is first rounded down to the nearest 10, before applying 20.6%', () => {
    expect(calculateCorporateTax(100999)).toEqual(20600)
  })

  test('after applying 20.6%, round down to the nearest krona', () => {
    expect(calculateCorporateTax(115000)).toEqual(23600)
  })
})
