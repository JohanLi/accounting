import { expect, describe, test } from 'vitest'
import { displayCentsAsDollars, displayToCents } from './AmountInput'

describe('displayCentsAsDollars', () => {
  test('cents are converted to dollars', () => {
    expect(displayCentsAsDollars(100)).toEqual('1')
  })

  test('cents are rounded to the nearest dollar', () => {
    expect(displayCentsAsDollars(1)).toEqual('0')
    expect(displayCentsAsDollars(50)).toEqual('1')
    expect(displayCentsAsDollars(99)).toEqual('1')
  })

  test('space is used as the thousand separator', () => {
    expect(displayCentsAsDollars(100 * 10 ** 3)).toEqual('1 000')
    expect(displayCentsAsDollars(5000 * 10 ** 6)).toEqual('50 000 000')
  })

  test('negative values use hyphen-minus rather than the actual minus symbol', () => {
    expect(displayCentsAsDollars(-100)).toEqual('-1')
  })

  test('zero is displayed as an empty string', () => {
    expect(displayCentsAsDollars(0)).toEqual('')
  })

  test('leading hyphen-minus is preserved', () => {
    expect(displayCentsAsDollars('-')).toEqual('-')
  })
})

describe('displayToCents', () => {
  test('display values are converted to cents', () => {
    expect(displayToCents('1')).toEqual(100)
    expect(displayToCents('100')).toEqual(10 * 10 ** 3)
    expect(displayToCents('50 000 000')).toEqual(5000 * 10 ** 6)
  })

  test('returns 0 if no numbers are provided', () => {
    expect(displayToCents('')).toEqual(0)
    expect(displayToCents('abc')).toEqual(0)
  })

  test('treats value as negative if the first character is a hyphen-minus', () => {
    expect(displayToCents('-1')).toEqual(-100)
    expect(displayToCents('-2 000')).toEqual(-200 * 10 ** 3)
    expect(displayToCents('--1')).toEqual(-100)
    expect(displayToCents('9-9-')).toEqual(9900)
  })
})
