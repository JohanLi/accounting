import { Metadata } from 'next'
import { H1, H2 } from '../components/common/heading'
import { getAnnualRelated } from './getAnnualRelated'
import { JournalEntries } from '../journalEntries/JournalEntries'
import { getAllFiscalYearsInReverse, getCurrentFiscalYear } from '../utils'
import { useSelect } from '../components/select/useSelect'
import { NextPageProps } from '../types'
import { Amount } from '../components/Amount'
import AppropriateProfitForm from './AppropriateProfitForm'

export const metadata: Metadata = {
  title: 'Annual-related',
}

export default async function AnnualRelated({ searchParams }: NextPageProps) {
  const lastFiscalYear = getCurrentFiscalYear() - 1

  const [selectedFiscalYear, Select] = useSelect({
    searchParams,
    name: 'fiscalYear',
    defaultValue: lastFiscalYear,
    values: getAllFiscalYearsInReverse(true),
  })

  const { journalEntries, profitLoss, corporateTax, dividendAmount } =
    await getAnnualRelated(selectedFiscalYear)

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
        <div>
          <div>
            Profit/loss:{' '}
            {profitLoss !== undefined ? <Amount amount={profitLoss} /> : ''}
          </div>
          <div>
            Corporate tax:{' '}
            {corporateTax !== undefined ? <Amount amount={corporateTax} /> : ''}
          </div>
          {dividendAmount !== undefined && (
            <div>
              Dividend amount: <Amount amount={dividendAmount} />
            </div>
          )}
        </div>
        {dividendAmount === undefined && profitLoss !== undefined && (
          <div>
            <H2>Appropriate profit</H2>
            <AppropriateProfitForm profitThisYear={profitLoss} />
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
