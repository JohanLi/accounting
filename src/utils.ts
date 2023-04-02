import { VerificationWithTransactionsAndDocuments } from './pages/api/verifications'
import { Receipt } from './receipt'

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
  return {
    start: new Date(Date.UTC(year - 1, 6, 1)),
    end: new Date(Date.UTC(year, 5, 30)),
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

export const UPLOAD_FORM_KEY = 'files'

export function receiptToTransaction(receipt: Receipt) {
  if (receipt.type !== 'SALE_WITHIN_SWEDEN_25') {
    throw Error(`Unexpected receipt type: ${receipt.type}`)
  }

  return [
    {
      accountCode: 1930,
      amount: receipt.total,
    },
    {
      accountCode: 2610,
      amount: receipt.vat,
    },
    {
      accountCode: 3011,
      amount: receipt.total - receipt.vat,
    },
  ]
}
