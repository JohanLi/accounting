import { expect, describe, test } from 'vitest'
import { displayAmountInput, toNumberOrMinus } from './AmountInput'

describe('toNumberOrMinus', () => {
  test('numeric strings are converted to integers, in cents', () => {
    expect(toNumberOrMinus('0')).toEqual(0)
    expect(toNumberOrMinus('5123')).toEqual(512300)
  })

  test('non-numeric characters are stripped', () => {
    expect(toNumberOrMinus('ab2c')).toEqual(200)
  })

  test('defaults to zero if no numeric characters are present', () => {
    expect(toNumberOrMinus('a!,c ')).toEqual(0)
  })

  test('integer is negative if a minus sign exists anywhere', () => {
    expect(toNumberOrMinus('-1')).toEqual(-100)
    expect(toNumberOrMinus('20-')).toEqual(-2000)
  })

  test('integer flips back to positive if two or more minus signs exist', () => {
    expect(toNumberOrMinus('-1-')).toEqual(100)
    expect(toNumberOrMinus('-200--')).toEqual(20000)
  })

  test('- is preserved as-is', () => {
    expect(toNumberOrMinus('-')).toEqual('-')
  })

  test('multiple - with nothing else is treated as 0', () => {
    expect(toNumberOrMinus('--')).toEqual(0)
    expect(toNumberOrMinus('---')).toEqual(0)
    expect(toNumberOrMinus('abc--')).toEqual(0)
  })
})

describe('displayAmountInput', () => {
  test('0 is displayed as an empty string', () => {
    expect(displayAmountInput(0)).toEqual('')
  })

  test('- is displayed as-is', () => {
    expect(displayAmountInput('-')).toEqual('-')
  })

  test('space is used as the thousand separator', () => {
    expect(displayAmountInput(100000)).toEqual('1 000')
    expect(displayAmountInput(5000 * 10 ** 6)).toEqual('50 000 000')
  })

  test('negative values use hyphen-minus rather than the actual minus symbol', () => {
    expect(displayAmountInput(-123400)).toEqual('-1 234')
  })
})
