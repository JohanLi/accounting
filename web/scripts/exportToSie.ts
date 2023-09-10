/*
  TODO
    Terminology will need to be revised. For instance, it's called
    "opening balance" and "closing balance".

  The format is SIE 4E, described here:
  https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_080930.pdf

  This export is necessary, because I plan to submit FY 2023 through
  a third-party service. That service functions a bit like an additional
  sanity check.
 */

import fs from 'fs/promises'
import db from '../src/db'
import { Accounts } from '../src/schema'
import { getFiscalYear, oreToKrona } from '../src/utils'
import { getAccounts } from '../src/pages/api/accounts'
import iconv from 'iconv-lite'

const YEAR = 2023

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}${month.toString().padStart(2, '0')}${day
    .toString()
    .padStart(2, '0')}`
}

async function main() {
  const { startInclusive, endExclusive } = getFiscalYear(YEAR)

  const endInclusive = new Date(endExclusive)
  endInclusive.setDate(endInclusive.getDate() - 1)

  const lastStartInclusive = new Date(startInclusive)
  lastStartInclusive.setFullYear(lastStartInclusive.getFullYear() - 1)

  const lastEndInclusive = new Date(endInclusive)
  lastEndInclusive.setFullYear(lastEndInclusive.getFullYear() - 1)

  const allAccounts = (await db.select().from(Accounts).orderBy(Accounts.id))
    .map((a) => `#KONTO ${a.id} "${a.description}"`)
    .join('\n')

  const accounts = await getAccounts(YEAR)
  const lastAccounts = await getAccounts(YEAR - 1)

  /*
    Incoming and outgoing are only applicable to account IDs 1000–2999
    https://vismaspcs.se/ekonomiska-termer/vad-ar-utgaende-balans
   */
  const incoming = accounts
    .filter((a) => a.id < 3000)
    .map((a) => `#IB 0 ${a.id} ${oreToKrona(a.totals.incoming)}`)
    .join('\n')
  const lastIncoming = lastAccounts
    .filter((a) => a.id < 3000)
    .map((a) => `#IB -1 ${a.id} ${oreToKrona(a.totals.incoming)}`)
    .join('\n')

  const outgoing = accounts
    .filter((a) => a.id < 3000)
    .map((a) => `#UB 0 ${a.id} ${oreToKrona(a.totals.outgoing)}`)
    .join('\n')
  const lastOutgoing = lastAccounts
    .filter((a) => a.id < 3000)
    .map((a) => `#UB -1 ${a.id} ${oreToKrona(a.totals.outgoing)}`)
    .join('\n')

  const results = accounts
    .filter((a) => a.id >= 3000)
    .map((a) => `#RES 0 ${a.id} ${oreToKrona(a.totals.thisYear)}`)
    .join('\n')

  const lastResults = lastAccounts
    .filter((a) => a.id >= 3000)
    .map((a) => `#RES -1 ${a.id} ${oreToKrona(a.totals.thisYear)}`)
    .join('\n')

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
#RAR 0 ${formatDate(startInclusive)} ${formatDate(endInclusive)}
#RAR -1 ${formatDate(lastStartInclusive)} ${formatDate(lastEndInclusive)}
${allAccounts}
#KPTYP BAS2014
${incoming}
${lastIncoming}
${outgoing}
${lastOutgoing}
${results}
${lastResults}
  `.trim()

  await fs.writeFile(
    `./src/documents/${YEAR}.sie`,
    iconv.encode(string, 'CP437'),
  )

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
