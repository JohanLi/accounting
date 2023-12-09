import { expect, test } from 'vitest'
import { validate } from './validateJournalEntry'

test('throws if transactions do not balance', () => {
  for (let amounts of [
    [10001, -10000],
    [5000, 5000],
    [1000, -200, -900],
  ]) {
    expect(() =>
      validate({
        date: new Date(),
        description: '',
        transactions: [
          { accountId: 1930, amount: amounts[0] },
          { accountId: 1630, amount: amounts[1] },
        ],
        linkedToTransactionIds: [],
      }),
    ).toThrow()
  }
})
