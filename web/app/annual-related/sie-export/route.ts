/*
  The format is SIE 4E, described here:
  https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_080930.pdf

  This export is necessary, because I plan to submit FY 2023 through
  a third-party service. That service functions a bit like an additional
  sanity check.
 */

import {
  getAccounts,
  getAccountTotals,
} from '../../accountTotals/getAccountTotals'
import { getFiscalYear, oreToKrona } from '../../utils'
import iconv from 'iconv-lite'

export const ACCOUNT_ID_BALANCE_END_EXCLUSIVE = 3000

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}${month.toString().padStart(2, '0')}${day
    .toString()
    .padStart(2, '0')}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let fiscalYear = parseInt(searchParams.get('fiscalYear') || '')

  if (!fiscalYear) {
    return new Response('fiscalYear is required', { status: 400 })
  }

  const KONTO = (await getAccounts())
    .map((a) => `#KONTO ${a.id} "${a.description}"`)
    .join('\n')

  const RAR = []
  const IB = []
  const UB = []
  const RES = []

  for (const fiscalYearOffset of [0, -1]) {
    const year = fiscalYear + fiscalYearOffset

    let { startInclusive, endInclusive } = getFiscalYear(year)

    RAR.push(
      `#RAR ${fiscalYearOffset} ${formatDate(startInclusive)} ${formatDate(
        endInclusive,
      )}`,
    )

    const accounts = await getAccountTotals(year)

    IB.push(
      accounts
        .filter((a) => a.id < ACCOUNT_ID_BALANCE_END_EXCLUSIVE)
        .map(
          (a) =>
            `#IB ${fiscalYearOffset} ${a.id} ${oreToKrona(a.openingBalance)}`,
        )
        .join('\n'),
    )

    UB.push(
      accounts
        .filter((a) => a.id < ACCOUNT_ID_BALANCE_END_EXCLUSIVE)
        .map(
          (a) =>
            `#UB ${fiscalYearOffset} ${a.id} ${oreToKrona(a.closingBalance)}`,
        )
        .join('\n'),
    )

    RES.push(
      accounts
        .filter((a) => a.id >= ACCOUNT_ID_BALANCE_END_EXCLUSIVE)
        .map((a) => `#RES ${fiscalYearOffset} ${a.id} ${oreToKrona(a.result)}`)
        .join('\n'),
    )
  }

  /*
    #VER is not mandatory for SIE 4E, but I wonder if adding it enables
    third-parties to do more checks.

    #ORGNR is not mandatory, but third-party services prompt for it if omitted.

    #KPTYP is also not mandatory, but I'm unsure what difference it makes.
   */

  const string = `
#FLAGGA 0
#PROGRAM "https://johan.li" 1.0
#FORMAT PC8
#GEN ${formatDate(new Date())}
#SIETYP 4
#FNAMN "Ternary AB"
#ORGNR 5592784465
${RAR.join('\n')}
${KONTO}
#KPTYP BAS2014
${IB.join('\n')}
${UB.join('\n')}
${RES.join('\n')}
  `.trim()

  return new Response(iconv.encode(string, 'CP437'), {
    headers: {
      /*
        actual charset is probably IBM437 or CP437 (https://en.wikipedia.org/wiki/Code_page_437),
        but it's likely no browsers are wild enough to support it.

        A bug was reported to Mozilla back in 2017: https://bugzilla.mozilla.org/show_bug.cgi?id=1387382
        Quote: "this is the only bug report in the nearly 20 year history of this project to ask for cp437 support"
       */
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
