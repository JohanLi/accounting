import Decimal from 'decimal.js'

import { AccountCode } from './types'
import { krToOre } from './utils'

const currentYear = new Date().getFullYear()

if (currentYear !== 2026) {
  throw new Error('New year – tax rates need to be updated')
}

// taken from https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html#h-Brytpunkt
const STATE_TAX_BREAKPOINT = 660400

// comes from plugging in STATE_TAX_BREAKPOINT into the calculator at https://www7.skatteverket.se/portal/rakna-ut-skatt
const YEAR_TAX = 147141

export const PERSONAL_TAX = {
  annualSalary: krToOre(STATE_TAX_BREAKPOINT),
  rate: new Decimal(YEAR_TAX / STATE_TAX_BREAKPOINT),
}

export const PAYROLL_TAX = new Decimal('0.3142')

export function getSalaryTaxes(amount?: number) {
  if (!amount) {
    return {
      preliminaryIncomeTax: 0,
      payrollTax: 0,
    }
  }

  return {
    preliminaryIncomeTax: Decimal.mul(amount, PERSONAL_TAX.rate)
      .round()
      .toNumber(),
    payrollTax: Decimal.mul(amount, PAYROLL_TAX).round().toNumber(),
  }
}

export const SALARY_ACCOUNT_ID = 7210 satisfies AccountCode
export const DIVIDEND_ACCOUNT_ID = 2898 satisfies AccountCode

// used for Omkostnadsbelopp vid årets ingång
export const K10_INTEREST_RATE_PERCENT = 11.62
