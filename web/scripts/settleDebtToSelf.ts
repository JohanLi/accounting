import { updateJournalEntry } from '../app/actions/updateJournalEntry'
import { krToOre } from '../app/utils'

// this will rarely be used, so doesn't warrant a UI

// "2890 Övriga kortfristiga skulder" for the latest fiscal year
const debtToSelf = krToOre(0)

if (debtToSelf <= 0) {
  throw new Error('debtToSelf must be provided')
}

const date = new Date()
date.setUTCHours(0, 0, 0, 0)

updateJournalEntry({
  date,
  description: 'Utlägg utbetalning',
  transactions: [
    {
      accountId: 1930,
      amount: -debtToSelf,
    },
    {
      accountId: 2890,
      amount: debtToSelf,
    },
  ],
  linkedToTransactionIds: [],
})
  .then((journalEntry) => {
    console.log(journalEntry)
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
  })
