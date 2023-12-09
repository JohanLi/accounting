import Decimal from 'decimal.js'
import crypto from 'crypto'

export function classNames(...classes: string[]) {
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
