import iconv from 'iconv-lite'

import { getAccountTotals } from '../../accountTotals/getAccountTotals'
import { getErrorMessage, getFiscalYear } from '../../utils'
import { calculateAnnualRelated } from '../calculateAnnualRelated'
import { getSru } from './getSru'

/*
  Details not found in the bookkeeping. POSTNR and POSTORT are mandatory in
  INFO.SRU, and are used on Skatteverket's receipt.
 */
const COMPANY = {
  name: 'Ternary AB',
  orgNr: '5592784465',
  postNr: '12677',
  postOrt: 'Hägersten',
}

const FILES = {
  info: 'INFO.SRU',
  blanketter: 'BLANKETTER.SRU',
} as const

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fiscalYear = parseInt(searchParams.get('fiscalYear') || '')
  const file = searchParams.get('file') as keyof typeof FILES | null

  if (!fiscalYear) {
    return new Response('fiscalYear is required', { status: 400 })
  }

  if (!file || !Object.hasOwn(FILES, file)) {
    return new Response('file must be "info" or "blanketter"', { status: 400 })
  }

  if (!COMPANY.postNr || !COMPANY.postOrt) {
    return new Response('Fill in postNr and postOrt in sru-export/route.ts', {
      status: 500,
    })
  }

  const accounts = await getAccountTotals(fiscalYear)
  const calculated = await calculateAnnualRelated(fiscalYear)

  // guards against filing numbers that don't include the latest journal entries
  const bookedTax = accounts.find((a) => a.id === 8910)?.result ?? 0
  const bookedProfit = accounts.find((a) => a.id === 8999)?.result ?? 0

  if (
    bookedTax !== calculated.tax ||
    bookedProfit !== calculated.profitAfterTax
  ) {
    return new Response(
      'The booked tax or profit is outdated. Submit "Profit and tax" first.',
      { status: 422 },
    )
  }

  try {
    const sru = getSru({
      fiscalYear: getFiscalYear(fiscalYear),
      accounts,
      taxAdjustments: {
        nonDeductibleExpenses: calculated.nonDeductibleExpenses,
        nonTaxableRevenue: calculated.nonDeductibleRevenue,
        lossFromPrevious: calculated.lossFromPrevious,
      },
      company: COMPANY,
      createdAt: new Date(),
    })

    return new Response(iconv.encode(sru[file], 'latin1'), {
      headers: {
        // the actual encoding is ISO-8859-1, as required by Skatteverket
        'Content-Type': 'text/plain; charset=iso-8859-1',
        'Content-Disposition': `attachment; filename=${FILES[file]}`,
      },
    })
  } catch (error) {
    return new Response(getErrorMessage(error), { status: 422 })
  }
}
