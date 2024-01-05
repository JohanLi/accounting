import { Metadata } from 'next'
import { H1, H2 } from '../components/common/heading'
import { getCorporateTax } from './getCorporateTax'
import { DateFormatted } from '../components/DateFormatted'
import { Amount } from '../components/Amount'
import {
  AmountTd,
  AmountTh,
  DateOrAccountCodeTd,
  DateOrAccountCodeTh,
  DescriptionTd,
  DescriptionTh,
  Table,
} from '../components/common/table'

/*
  This page might not be necessary long-term, but visually seeing these numbers lets me remind myself of
  how the corporate tax system works. The messy part about it is that related journal entries/tax account
  transactions aren't trivial to tie together.

  For one, monthly preliminary tax payments are shifted one month; they don't 100% coincide with the fiscal year.
  Also, the reconciliation of the preliminary tax with the final value can occur much later. For instance,
  the corporate tax for FY22 was actually reconciled in FY24 for me.
 */

export const metadata: Metadata = {
  title: 'Corporate tax',
}

export default async function CorporateTax() {
  const { recentFiscalYears, journalEntries } = await getCorporateTax()

  return (
    <>
      <H1>Corporate tax</H1>
      <div className="space-y-8">
        <div>
          <H2>Preliminary tax totals</H2>
          <Table>
            <thead>
              <tr>
                <DateOrAccountCodeTh>Fiscal year</DateOrAccountCodeTh>
                <AmountTh>Total</AmountTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentFiscalYears.map((fiscalYear) => (
                <tr key={fiscalYear.fiscalYear}>
                  <DateOrAccountCodeTd>
                    <span className="font-mono">{fiscalYear.fiscalYear}</span>
                  </DateOrAccountCodeTd>
                  <AmountTd>
                    <Amount amount={fiscalYear.total} />
                  </AmountTd>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div>
          <H2>Related journal entries</H2>
          <Table>
            <thead>
              <tr>
                <DateOrAccountCodeTh>Date</DateOrAccountCodeTh>
                <DescriptionTh>Description</DescriptionTh>
                <AmountTh>Amount</AmountTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {journalEntries.map((j) => (
                <tr key={j.journal_entries.id}>
                  <DateOrAccountCodeTd>
                    <DateFormatted date={j.journal_entries.date} />
                  </DateOrAccountCodeTd>
                  <DescriptionTd>{j.journal_entries.description}</DescriptionTd>
                  <AmountTd>
                    <Amount amount={j.journal_entry_transactions.amount} />
                  </AmountTd>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  )
}
