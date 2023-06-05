import Decimal from 'decimal.js'

/*
  Brytpunkter 2023
  - Statlig inkomstskatt: 598,500
  - Högsta inkomsten som utgör underlag för allmän pension: 599,250
 */

/*
  How it's set:
  - Fill in https://app.skatteverket.se/rakna-skatt-client-skut-skatteutrakning/lon-efter-skattetabell/fyll-i-din-lon
  - From the results, calculate a "personal tax rate". This is of interest because I don't pay myself a monthly salary – instead I do it in large clump.
 */
export const PERSONAL_TAX = {
  annualSalary: 600000,
  rate: new Decimal('0.23798'),
}

export const PAYROLL_TAX = new Decimal('0.3142')

export function getSalaryTaxes(amount?: number) {
  if (!amount) {
    return {
      personalIncomeTax: 0,
      payrollTax: 0,
    }
  }

  return {
    personalIncomeTax: Decimal.mul(amount, PERSONAL_TAX.rate)
      .round()
      .toNumber(),
    payrollTax: Decimal.mul(amount, PAYROLL_TAX).round().toNumber(),
  }
}

const currentYear = new Date().getFullYear()

if (currentYear !== 2023) {
  throw new Error('New year – tax rates need to be updated')
}
