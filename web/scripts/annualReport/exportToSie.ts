/*
  The format is SIE 4E, described here:
  https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_080930.pdf

  This export is necessary, because I plan to submit FY 2023 through
  a third-party service. That service functions a bit like an additional
  sanity check.
 */

import fs from 'fs/promises'
import { getFiscalYear, oreToKrona } from '../../src/utils'
import {
  getAccounts,
  getAccountTotals,
} from '../../src/pages/api/accountTotals'
import iconv from 'iconv-lite'
import { ACCOUNT_ID_BALANCE_END_EXCLUSIVE, YEAR } from './constants'

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}${month.toString().padStart(2, '0')}${day
    .toString()
    .padStart(2, '0')}`
}

async function main() {
  const KONTO = (await getAccounts())
    .map((a) => `#KONTO ${a.id} "${a.description}"`)
    .join('\n')

  const RAR = []
  const IB = []
  const UB = []
  const RES = []

  for (const fiscalYearOffset of [0, -1]) {
    const year = YEAR + fiscalYearOffset

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

  await fs.writeFile(`./${YEAR}.sie`, iconv.encode(string, 'CP437'))

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
