import { JournalEntry } from './pages/api/journalEntries'
import Decimal from 'decimal.js'

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
  const endExclusive = new Date(Date.UTC(year, 6, 1))

  return {
    startInclusive,
    endExclusive,
  }
}

export function withinFiscalYear(journalEntry: JournalEntry, year: number) {
  const { startInclusive, endExclusive } = getFiscalYear(year)
  return (
    new Date(journalEntry.date) >= startInclusive &&
    new Date(journalEntry.date) < endExclusive
  )
}

export function formatNumber(number: number) {
  return number.toLocaleString('en-US')
}

export function krToOre(kr: string | number) {
  return Decimal.mul(kr, 100).round().toNumber()
}
