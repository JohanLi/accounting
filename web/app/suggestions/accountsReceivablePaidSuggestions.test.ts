import { describe, expect, test } from 'vitest'

import { getUnpaid } from './accountsReceivablePaidSuggestions'

describe('given an array of positive and negative numbers that cancel each other out', () => {
  test('leftover positive numbers are returned', () => {
    expect(getUnpaid([1000])).toEqual([1000])
    expect(getUnpaid([1000, 2000])).toEqual([1000, 2000])
    expect(getUnpaid([1000, 2000, -1000, 1000, -2000])).toEqual([1000])
  })

  test('an exception is thrown if there are leftover negative numbers', () => {
    expect(() => getUnpaid([-1000])).toThrow()
    expect(() => getUnpaid([3000, -4000, -3000])).toThrow()
  })
})
