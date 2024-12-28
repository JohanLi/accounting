import { Metadata } from 'next'

import { Amount } from '../components/Amount'
import { H1, H2 } from '../components/common/heading'
import { getSelect } from '../components/select/getSelect'
import { getSalaries } from '../salary/getSalaries'
import { K10_INTEREST_RATE_PERCENT } from '../tax'
import { NextPageProps } from '../types'
import { getAllIncomeYearsInReverse } from '../utils'
import { getDividend } from './getDividend'

export const metadata: Metadata = {
  title: 'K10 form',
}

// in ören
const STOCK_ACQUISITION_COST = 2500000
const somethingThatBoostsDividendPool =
  (STOCK_ACQUISITION_COST * K10_INTEREST_RATE_PERCENT) / 100

export default async function K10Form(props: NextPageProps) {
  const searchParams = await props.searchParams
  const currentYear = new Date().getFullYear()

  const [selectedYear, Select] = getSelect({
    searchParams,
    name: 'year',
    defaultValue: currentYear,
    values: getAllIncomeYearsInReverse(),
  })

  const lastYear = selectedYear - 1
  const dividend = await getDividend(lastYear)

  const twoYearsAgo = selectedYear - 2
  const { total: salary } = await getSalaries(twoYearsAgo)

  return (
    <>
      <H1>K10 form</H1>
      <div className="flex items-center justify-end space-x-4">
        <div className="flex justify-end">
          <label className="flex items-center space-x-4">
            <div className="text-gray-500">Year</div>
            <Select />
          </label>
        </div>
      </div>
      <div className="space-y-8">
        <H2>Steps and values</H2>
        <ul className="list-inside list-disc space-y-4">
          <li>
            <i>Allmänna uppgifter</i> {'>'} <i>Huvudregel</i>
          </li>
          <li>
            All <i>antal andelar</i> inputs: <Amount amount={50000} />
          </li>
          <li>
            <i>Förvärvade</i>: <Amount amount={0} />
          </li>
          <li>
            <i>Erhållen utdelning</i>: <Amount amount={dividend} />{' '}
            <span className="text-xs text-gray-500">({lastYear})</span>
          </li>
          <li>
            Save and continue to <i>Huvudregeln - Utdelning</i>
          </li>
        </ul>
        <ul className="list-inside list-disc space-y-4">
          <li>
            <i>
              Omkostnadsbelopp * {K10_INTEREST_RATE_PERCENT}% (enligt verklig
              anskaffningsutgift)
            </i>
            : <Amount amount={somethingThatBoostsDividendPool} />
          </li>
          <li>
            Click <i>Lönebaserat utrymme</i>
          </li>
          <li>
            <i>Din kontanta ersättning</i> and{' '}
            <i>Sammanlagd kontant ersättning</i>: <Amount amount={salary} />{' '}
            <span className="text-xs text-gray-500">({twoYearsAgo})</span>
          </li>
          <li>
            Click <i>Kontrollera</i>
          </li>
          <li>
            <i>Kontant ersättning</i>: <Amount amount={salary} />{' '}
            <span className="text-xs text-gray-500">({twoYearsAgo})</span>
          </li>
          <li>Save and go back.</li>
          <li>Submit the rest of the tax return. Done!</li>
        </ul>
      </div>
    </>
  )
}
