import crypto from 'crypto'
import Decimal from 'decimal.js'

import { NextPageProps } from './types'

export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function getCurrentFiscalYear() {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  if (currentMonth < 6) {
    return currentYear
  }

  return currentYear + 1
}

const FIRST_FISCAL_YEAR = 2021

export function getAllFiscalYearsInReverse() {
  const years: number[] = []

  for (let year = getCurrentFiscalYear(); year >= FIRST_FISCAL_YEAR; year--) {
    years.push(year)
  }

  return years
}

export function getFiscalYear(year: number) {
  const startInclusive = new Date(Date.UTC(year - 1, 6, 1))
  const endInclusive = new Date(Date.UTC(year, 5, 30))
  const endExclusive = new Date(Date.UTC(year, 6, 1))

  return {
    startInclusive,
    endInclusive,
    endExclusive,
  }
}

export function getFiscalYearQuarter(year: number, quarter: number) {
  const fiscalYear = getFiscalYear(year)

  const startInclusive = new Date(fiscalYear.startInclusive)
  startInclusive.setMonth(startInclusive.getMonth() + (quarter - 1) * 3)

  const endExclusive = new Date(startInclusive)
  endExclusive.setMonth(startInclusive.getMonth() + 3)

  const endInclusive = new Date(endExclusive)
  endInclusive.setDate(endInclusive.getDate() - 1)

  return {
    startInclusive,
    endInclusive,
    endExclusive,
  }
}

export function getIncomeYear(year: number) {
  const startInclusive = new Date(Date.UTC(year, 0, 1))
  const endInclusive = new Date(Date.UTC(year, 11, 31))
  const endExclusive = new Date(Date.UTC(year + 1, 0, 1))

  return {
    startInclusive,
    endInclusive,
    endExclusive,
  }
}

export function getAllIncomeYearsInReverse() {
  const years: number[] = []

  for (let year = new Date().getFullYear(); year >= FIRST_FISCAL_YEAR; year--) {
    years.push(year)
  }

  return years
}

export function krToOre(kr: string | number | Decimal) {
  if (kr instanceof Decimal) {
    return kr.mul(100).round().toNumber()
  }

  return Decimal.mul(kr, 100).round().toNumber()
}

export function oreToKrona(ore: number) {
  return Decimal.div(ore, 100).toFixed(2)
}

export function getHash(input: Buffer | string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function filterNull<T>(input: T[]) {
  return input.filter((x: T): x is Exclude<typeof x, null> => x !== null)
}

// taken from https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export function getSearchParam(
  searchParams: Awaited<NextPageProps['searchParams']>,
  key: string,
) {
  const value = searchParams[key]

  if (Array.isArray(value)) {
    throw new Error(`${key} is an array`)
  }

  if (!value) {
    return ''
  }

  return value
}
