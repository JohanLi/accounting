/*
  When submitting VAT reports, you can either fill in a form or upload an
  XML file. In the form, Skatteverket assigns each input/"square" an ID like
  '05', '06', '20', '48'.

  When it comes to the XML file, one observation is that the information out
  there about its format is scarce. Skatteverket has this:
  https://www.skatteverket.se/omoss/digitalasamarbeten/utvecklingavflertekniskalosningar/ddtfilerforutvecklingavprogramvara/dtdfil.4.65fc817e1077c25b83280000.html

  But, it doesn't actually list how '05' gets mapped to <ForsMomsEjAnnan>.

  The only public source that does that is a Dynamics 365 page:
  https://learn.microsoft.com/sv-se/dynamics365/finance/localizations/emea-swe-vat-declaration-sweden

  The VAT report also seems to have a "checksum" feature in the sense that
  some values are repeated – the total can be calculated from other fields,
  but you still need to explicitly include it.
 */

import fs from 'fs/promises'
import { getCurrentFiscalYear, getFiscalYear } from '../../src/utils'
import db from '../../src/db'
import {
  Accounts,
  JournalEntries,
  JournalEntryTransactions,
} from '../../src/schema'
import { and, eq, gte, lt, sql } from 'drizzle-orm'

/*
  The inputs are actually mapped to more accounts than I've added, but many
  of them will likely never be applicable. A good place to check what should be
  mapped to what: https://www.bjornlunden.se/skatt/momsdeklaration__6798
 */
const VAT_MAP: {
  [id: string]: {
    accountIds: number[]
    xmlElement: string
    invert?: true
  }
} = {
  // Momspliktig försäljning som inte ingår i ruta 06, 07 eller 08
  '5': {
    accountIds: [3011],
    xmlElement: 'ForsMomsEjAnnan',
    invert: true,
  },
  // Utgående moms 25%
  '10': {
    accountIds: [2610],
    xmlElement: 'MomsUtgHog',
    invert: true,
  },
  // Inköp av tjänster från ett annat EU-land enligt huvudregeln
  '21': {
    accountIds: [4535, 4536, 4537],
    xmlElement: 'InkopTjanstAnnatEg',
  },
  // Inköp av tjänster från ett land utanför EU
  '22': {
    accountIds: [4531, 4532, 4533],
    xmlElement: 'InkopTjanstUtomEg',
  },
  // Utgående moms 25%
  '30': {
    accountIds: [2614],
    xmlElement: 'MomsInkopUtgHog',
    invert: true,
  },
  // Ingående moms att dra av
  '48': {
    accountIds: [2640, 2645],
    xmlElement: 'MomsIngAvdr',
  },
}

/*
  TODO
    One issue is that this script doesn't work properly if the end-of-period
    VAT journal entry has already been created.

    I'll take a closer look at it when adding support for quarterly
    VAT reports.
 */
async function main() {
  const quarter = 1
  const { startInclusive } = getFiscalYear(getCurrentFiscalYear())

  const startInclusiveQuarter = new Date(startInclusive)
  startInclusiveQuarter.setMonth(startInclusive.getMonth() + (quarter - 1) * 3)

  const endExclusiveQuarter = new Date(startInclusiveQuarter)
  endExclusiveQuarter.setMonth(startInclusiveQuarter.getMonth() + 3)

  const accounts = await db
    .select({
      id: Accounts.id,
      // `::int` explanation: https://github.com/drizzle-team/drizzle-orm/issues/999
      amount: sql<number>`sum(amount)::int`,
    })
    .from(Accounts)
    .innerJoin(
      JournalEntryTransactions,
      eq(Accounts.id, JournalEntryTransactions.accountId),
    )
    .innerJoin(
      JournalEntries,
      eq(JournalEntryTransactions.journalEntryId, JournalEntries.id),
    )
    .where(
      and(
        gte(JournalEntries.date, startInclusiveQuarter),
        lt(JournalEntries.date, endExclusiveQuarter),
      ),
    )
    .groupBy(Accounts.id)

  const elements: string[] = []

  let totalKr = 0

  Object.entries(VAT_MAP).forEach(
    ([id, { accountIds, xmlElement, invert }]) => {
      let elementTotal = accounts
        .filter((a) => accountIds.includes(a.id))
        .reduce((acc, a) => acc + a.amount, 0)

      if (invert) {
        elementTotal = -elementTotal
      }

      elementTotal = Math.trunc(elementTotal / 100)

      if (['10', '30'].includes(id)) {
        totalKr += elementTotal
      }

      if (id === '48') {
        totalKr -= elementTotal
      }

      elements.push(`<${xmlElement}>${elementTotal}</${xmlElement}>`)
    },
  )

  elements.push(`<MomsBetala>${totalKr}</MomsBetala>`)

  const string = `
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE eSKDUpload PUBLIC "-//Skatteverket, Sweden//DTD Skatteverket eSKDUpload-DTD Version 6.0//SV" "https://www1.skatteverket.se/demoeskd/eSKDUpload_6p0.dtd">
<eSKDUpload Version="6.0">
  <OrgNr>559278-4465</OrgNr>
  <Moms>
    <Period>202309</Period>
    ${elements.join('\n    ')}
  </Moms>
</eSKDUpload>
  `.trim()

  await fs.writeFile('./moms.xml', string)

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
