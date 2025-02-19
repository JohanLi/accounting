import { Metadata } from 'next'

import { Amount } from '../components/Amount'
import { H1, H2 } from '../components/common/heading'
import { getSelect } from '../components/select/getSelect'
import { JournalEntries } from '../journalEntries/JournalEntries'
import { NextPageProps } from '../types'
import { getAllFiscalYearsInReverse, getCurrentFiscalYear } from '../utils'
import AppropriateProfitForm from './AppropriateProfitForm'
import ProfitAndTaxForm from './ProfitAndTaxForm'
import { calculateAnnualRelated } from './calculateAnnualRelated'
import { getAnnualRelated } from './getAnnualRelated'
import { getPaidPreliminaryTax } from './getPaidPreliminaryTax'
import SieExport from './sie-export/SieExport'

/*
  TODO
    The recorded vs. calculated values should be less prominent in the UI. What's important is whether or not
    there's a discrepancy. It might also be nice to explicitly highlight which "sets" of journal entries are missing.

    It might be worth adding "Tillgodoförd debiterad preliminärskatt" and "Slutlig skatt" as related journal entries.
 */

export const metadata: Metadata = {
  title: 'Annual-related',
}

export default async function AnnualRelated(props: NextPageProps) {
  const searchParams = await props.searchParams
  const currentFiscalYear = getCurrentFiscalYear()

  const [selectedFiscalYear, Select] = getSelect({
    searchParams,
    name: 'fiscalYear',
    defaultValue: currentFiscalYear,
    values: getAllFiscalYearsInReverse(),
  })

  const { journalEntries, profitAfterTax, corporateTax, dividendAmount } =
    await getAnnualRelated(selectedFiscalYear)

  const {
    profitBeforeTax,
    profitTaxable,
    tax,
    profitAfterTax: calculatedProfitAfterTax,
  } = await calculateAnnualRelated(selectedFiscalYear)

  const paidPreliminaryTax = await getPaidPreliminaryTax(selectedFiscalYear)

  return (
    <>
      <H1>Annual-related</H1>
      <div className="flex items-center justify-end space-x-4">
        <div className="flex justify-end">
          <label className="flex items-center space-x-4">
            <div className="text-gray-500">FY</div>
            <Select />
          </label>
        </div>
      </div>
      <div className="space-y-8">
        <div className="flex justify-between">
          <div>
            <H2>Recorded</H2>
            <div>
              Profit (after tax): <Amount amount={profitAfterTax || 0} />
            </div>
            <div>
              Corporate tax: <Amount amount={corporateTax || 0} />
            </div>
            {dividendAmount !== undefined && (
              <div>
                Dividend amount: <Amount amount={dividendAmount} />
              </div>
            )}
            <div>
              Paid preliminary tax: <Amount amount={paidPreliminaryTax} />
            </div>
          </div>
          <div>
            <H2>Calculated</H2>
            <div>
              Profit (after tax): <Amount amount={calculatedProfitAfterTax} />
            </div>
            <div>
              Corporate tax: <Amount amount={tax} />
            </div>
            <div>
              Profit (before tax): <Amount amount={profitBeforeTax} />
            </div>
            <div>
              Profit (taxable): <Amount amount={profitTaxable} />
            </div>
            <ProfitAndTaxForm
              corporateTax={tax}
              profitAfterTax={calculatedProfitAfterTax}
              fiscalYear={selectedFiscalYear}
            />
          </div>
        </div>
        {dividendAmount === undefined && profitAfterTax !== undefined && (
          <div>
            <H2>Appropriate profit</H2>
            <AppropriateProfitForm profitThisYear={profitAfterTax} />
          </div>
        )}
        <div>
          <H2>Related journal entries</H2>
          <JournalEntries journalEntries={journalEntries} />
        </div>
        <SieExport selectedFiscalYear={selectedFiscalYear} />
      </div>
    </>
  )
}
