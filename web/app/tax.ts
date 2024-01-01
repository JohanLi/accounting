import Decimal from 'decimal.js'
import { krToOre } from './utils'

/*
  Brytpunkter 2024
  - Statlig inkomstskatt: 615 300
      https://www.skatteverket.se/privat/skatter/beloppochprocent/2024.4.7da1d2e118be03f8e4f4a88.html#h-Brytpunkt
  - Högsta inkomsten som utgör underlag för allmän pension: 614 500
      https://www.pensionsmyndigheten.se/forsta-din-pension/om-pensionssystemet/sa-beraknas-din-pension-basbelopp-och-varderegler
 */

/*
  How it's set:
  - Fill in https://app.skatteverket.se/rakna-skatt-client-skut-skatteutrakning/lon-efter-skattetabell/fyll-i-din-lon
  - From the results, calculate a "personal tax rate". This is of interest because I don't pay myself a monthly salary – instead I do it in large clump.
 */
export const PERSONAL_TAX = {
  annualSalary: krToOre(615300),
  rate: new Decimal('0.2412092'),
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

if (currentYear !== 2024) {
  throw new Error('New year – tax rates need to be updated')
}

export const SALARY_ACCOUNT_ID = 7210
