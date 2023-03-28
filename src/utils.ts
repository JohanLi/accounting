import { Document } from '@prisma/client'
import { VerificationWithTransactionsAndDocuments } from './pages/api/import'

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function getCurrentFiscalYear() {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  if (currentMonth < 6) {
    return currentYear - 1
  }

  return currentYear
}

const FIRST_FISCAL_YEAR = 2020

export function getAllFiscalYearsInReverse() {
  const years: number[] = []

  for (let year = getCurrentFiscalYear(); year >= FIRST_FISCAL_YEAR; year--) {
    years.push(year)
  }

  return years
}

export function getFiscalYear(year: number) {
  return {
    start: new Date(Date.UTC(year, 6, 1)),
    end: new Date(Date.UTC(year + 1, 5, 30)),
  }
}

export function withinFiscalYear(
  verification: VerificationWithTransactionsAndDocuments,
  year: number,
) {
  const { start, end } = getFiscalYear(year)
  return (
    new Date(verification.date) >= start && new Date(verification.date) <= end
  )
}
