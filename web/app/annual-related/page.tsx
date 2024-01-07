import { Metadata } from 'next'
import { H1, H2 } from '../components/common/heading'
import { getAnnualRelated } from './getAnnualRelated'
import { JournalEntries } from '../journalEntries/JournalEntries'
import { getAllFiscalYearsInReverse, getCurrentFiscalYear } from '../utils'
import { useSelect } from '../components/select/useSelect'
import { NextPageProps } from '../types'
import { Amount } from '../components/Amount'
import AppropriateProfitForm from './AppropriateProfitForm'
import { calculateAnnualRelated } from './calculateAnnualRelated'
import ProfitAndTaxForm from './ProfitAndTaxForm'

/*
  TODO
    the recorded vs. calculated values should be less prominent in the UI. What's important is whether or not
    there's a discrepancy. It might also be nice to explicitly highlight which "sets" of journal entries are missing.
 */

export const metadata: Metadata = {
  title: 'Annual-related',
}

export default async function AnnualRelated({ searchParams }: NextPageProps) {
  const currentFiscalYear = getCurrentFiscalYear()

  const [selectedFiscalYear, Select] = useSelect({
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
      </div>
    </>
  )
}
