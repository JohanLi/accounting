import Decimal from 'decimal.js'

import { krToOre } from './utils'

/*
  Brytpunkter 2025
  - Statlig inkomstskatt: 643 100
      https://www.skatteverket.se/privat/skatter/beloppochprocent/2025.4.262c54c219391f2e96342eb.html#h-Brytpunkt
 */

/*
  How it's set:
  - Fill in https://app.skatteverket.se/rakna-skatt-client-skut-skatteutrakning/lon-efter-skattetabell/fyll-i-din-lon
  - From the results, calculate a "personal tax rate". This is of interest because I don't pay myself a monthly salary – instead I do it in large clump.
 */

// TODO should just enter two numbers: brytpunkt and tax to pay from the calculator. Infer rate from that
export const PERSONAL_TAX = {
  annualSalary: krToOre(643100),
  rate: new Decimal('0.2286223'),
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

const currentYear = new Date().getFullYear()

if (currentYear !== 2025) {
  throw new Error('New year – tax rates need to be updated')
}

export const SALARY_ACCOUNT_ID = 7210
export const DIVIDEND_ACCOUNT_ID = 2898

// used for Omkostnadsbelopp vid årets ingång
export const K10_INTEREST_RATE_PERCENT = 10.94
