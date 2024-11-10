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
import { dirname } from 'path'
import { getFiscalYearQuarter } from '../../app/utils'
import db from '../../app/db'
import { JournalEntries } from '../../app/schema'
import { eq, ne } from 'drizzle-orm'
import {
  JournalEntryUpdate,
  updateJournalEntry,
} from '../../app/actions/updateJournalEntry'
import { getTotals } from '../../app/accountTotals/getAccountTotals'
import { getXML } from './getXML'
import { getJournalEntryTransactions } from './getJournalEntryTransactions'

/*
  An impracticality (for myself) is that the "aggregated"/total VAT account is conventionally split into two accounts:
  1650 (asset) and 2650 (liability).

  Because it doesn't affect the calculation of how much VAT I need to pay, I won't be performing explicit checks to
  see if 1650 has a negative balance. I'll exclusively use 2650, and only do a manual check at the end of Q4 to
  make sure 1650 is non-negative.
 */

const FISCAL_YEAR = 2025
const QUARTER = 1

async function main() {
  const { startInclusive, endInclusive, endExclusive } = getFiscalYearQuarter(
    FISCAL_YEAR,
    QUARTER,
  )

  const journalEntryDescription = `Momsredovisning ${FISCAL_YEAR} Q${QUARTER}`

  console.log(journalEntryDescription)

  const accounts = await getTotals({
    startInclusive,
    endExclusive,
    where: ne(JournalEntries.description, journalEntryDescription),
  })

  /*
    When dealing with Skatteverket, all decimals are supposed to be truncated. For VAT, my understanding
    is that the truncation isn't done on an account-basis, but per input/"square". Because of this,
    we first need to calculate the "truncated" total VAT in order to determine how much we need to move to 3740.
   */
  const { xml, vatTotalTruncated } = getXML({
    endInclusive,
    accounts,
  })

  const vatReportJournalEntry: JournalEntryUpdate = {
    date: endInclusive,
    description: journalEntryDescription,
    transactions: getJournalEntryTransactions({
      accounts,
      vatTotalTruncated,
    }),
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
    vatReportJournalEntry.id = currentJournalEntry[0].id

    console.log('Overwriting the existing journal entry')
  }

  await updateJournalEntry(vatReportJournalEntry)

  const path = `${__dirname}/output/${FISCAL_YEAR}-q${QUARTER}.xml`
  await fs.mkdir(dirname(path), { recursive: true })
  await fs.writeFile(path, xml)

  console.log(`Saved to "${path}"`)

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
