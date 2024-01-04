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
import { getCurrentFiscalYear, getFiscalYear } from '../app/utils'
import db from '../app/db'
import {
  Accounts,
  JournalEntries,
  JournalEntryTransactions,
} from '../app/schema'
import { and, eq, gte, lt, ne, sql } from 'drizzle-orm'
import {
  JournalEntryUpdate,
  updateJournalEntry,
} from '../app/actions/updateJournalEntry'

/*
  This isn't an exhaustive list – for outgoing VAT, I've only included
  the 25% rate.
 */
const VAT_ACCOUNT_IDS = [2610, 2614, 2640, 2645]

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
  An impracticality (for myself) is that the "aggregated"/total VAT account is conventionally split into two accounts:
  1650 (asset) and 2650 (liability).

  Because it doesn't affect the calculation of how much VAT I need to pay, I won't be performing explicit checks to
  see if 1650 has a negative balance. I'll exclusively use 2650, and only do a manual check at the end of Q4 to
  make sure 1650 is non-negative.

  Another annoyance is the way decimals are supposed to be truncated, as Skatteverket does not deal with decimals.
  My understanding is that the truncation isn't done on an account-basis, but per input/"square".
 */
async function main() {
  const quarter = 1

  const journalEntryDescription = `Momsredovisning ${getCurrentFiscalYear()} Q${quarter}`

  console.log(`Generating a journal entry for "${journalEntryDescription}"`)

  const { startInclusive } = getFiscalYear(getCurrentFiscalYear())

  const startInclusiveQuarter = new Date(startInclusive)
  startInclusiveQuarter.setMonth(startInclusive.getMonth() + (quarter - 1) * 3)

  const endExclusiveQuarter = new Date(startInclusiveQuarter)
  endExclusiveQuarter.setMonth(startInclusiveQuarter.getMonth() + 3)

  // TODO merge with getTotals()
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
        ne(JournalEntries.description, journalEntryDescription),
      ),
    )
    .groupBy(Accounts.id)

  const vatAccounts = accounts.filter((a) => VAT_ACCOUNT_IDS.includes(a.id))

  const transactions = vatAccounts.map((a) => ({
    accountId: a.id,
    amount: -a.amount,
  }))

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

  const vatTruncatedTotal = -totalKr * 100

  transactions.push({
    accountId: 2650,
    amount: vatTruncatedTotal,
  })

  const cents =
    vatTruncatedTotal - vatAccounts.reduce((acc, a) => acc + a.amount, 0)

  if (Math.abs(cents) > 0) {
    transactions.push({
      accountId: 3740,
      amount: -cents,
    })
  }

  const endInclusiveQuarter = new Date(endExclusiveQuarter)
  endInclusiveQuarter.setDate(endInclusiveQuarter.getDate() - 1)

  const vatReportJournalEntry: JournalEntryUpdate = {
    date: endInclusiveQuarter,
    description: `Momsredovisning ${getCurrentFiscalYear()} Q${quarter}`,
    transactions,
    linkedToTransactionIds: [],
  }

  console.log(vatReportJournalEntry)

  const currentJournalEntry = await db
    .select({
      id: JournalEntries.id,
    })
    .from(JournalEntries)
    .where(eq(JournalEntries.description, journalEntryDescription))

  if (currentJournalEntry.length) {
    console.log('Found an existing journal entry that will be overwritten')
    vatReportJournalEntry.id = currentJournalEntry[0].id
  }

  await updateJournalEntry(vatReportJournalEntry)

  // there's close to no documentation about this; it was mostly figured out through feeding different values
  const period = `${endInclusiveQuarter.getFullYear()}${(
    endInclusiveQuarter.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}`

  const string = `
  <?xml version="1.0" encoding="ISO-8859-1"?>
  <!DOCTYPE eSKDUpload PUBLIC "-//Skatteverket, Sweden//DTD Skatteverket eSKDUpload-DTD Version 6.0//SV" "https://www1.skatteverket.se/demoeskd/eSKDUpload_6p0.dtd">
  <eSKDUpload Version="6.0">
    <OrgNr>559278-4465</OrgNr>
    <Moms>
      <Period>${period}</Period>
      ${elements.join('\n    ')}
    </Moms>
  </eSKDUpload>
    `.trim()

  const path = './moms.xml'

  console.log(`Writing the VAT report to "${path}"`)
  await fs.writeFile(path, string)

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
