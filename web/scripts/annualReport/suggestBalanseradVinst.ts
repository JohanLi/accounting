import { YEAR } from './constants'
import { Suggestion } from '../../app/suggestions/suggestions'

async function main() {
  if (YEAR !== 2023) {
    throw new Error('This script is hardcoded for 2023')
  }

  const amount = 13216889

  const suggestion: Suggestion = {
    /*
     the exact date isn't important, but it should be around the time
     I submitted the annual report for FY 2022
     */
    date: new Date('2023-01-08'),
    description: 'Resultatdisposition',
    transactions: [
      { accountId: 2091, amount: -amount },
      { accountId: 2098, amount },
    ],
    linkedToTransactionIds: [],
  }

  console.log(JSON.stringify(suggestion, null, 2))

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
