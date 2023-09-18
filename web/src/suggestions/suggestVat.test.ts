import { expect, describe, test, vi } from 'vitest'
import { suggestVat } from './suggestVat'
import { getAccountTotals } from '../pages/api/accountTotals'

vi.mock('../pages/api/accountTotals', () => ({
  getAccountTotals: vi.fn(),
}))

function createTransaction(id: number, closingBalance: number) {
  return {
    id,
    closingBalance,
    description: '',
    result: 0,
    openingBalance: 0,
  }
}

describe('VAT return journal entry', () => {
  test('zeros VAT-related accounts, moving the total to 2650', async () => {
    vi.mocked(getAccountTotals).mockResolvedValue([
      createTransaction(2610, -8000),
      createTransaction(2620, 1000),
      createTransaction(2630, 1000),
      createTransaction(2640, 1000),
      createTransaction(2614, -100),
      createTransaction(2645, 100),
      createTransaction(1650, 0),
      createTransaction(2650, 0),
    ])

    expect(await suggestVat()).toMatchObject({
      transactions: [
        {
          accountId: 2610,
          amount: 8000,
        },
        {
          accountId: 2620,
          amount: -1000,
        },
        {
          accountId: 2630,
          amount: -1000,
        },
        {
          accountId: 2640,
          amount: -1000,
        },
        {
          accountId: 2614,
          amount: 100,
        },
        {
          accountId: 2645,
          amount: -100,
        },
        {
          accountId: 2650,
          amount: -5000,
        },
      ],
    })

    vi.mocked(getAccountTotals).mockResolvedValue([
      createTransaction(2610, -50000),
      createTransaction(1650, 0),
      createTransaction(2650, 0),
    ])

    expect(await suggestVat()).toMatchObject({
      transactions: [
        {
          accountId: 2610,
          amount: 50000,
        },
        {
          accountId: 2650,
          amount: -50000,
        },
      ],
    })
  })

  test('the total is moved to 1650 instead of 2650 if positive', async () => {
    vi.mocked(getAccountTotals).mockResolvedValue([
      createTransaction(2640, 2000),
      createTransaction(1650, 0),
      createTransaction(2650, 0),
    ])

    expect(await suggestVat()).toMatchObject({
      transactions: [
        {
          accountId: 2640,
          amount: -2000,
        },
        {
          accountId: 1650,
          amount: 2000,
        },
      ],
    })
  })

  /*
   A mistake I made earlier was using Math.floor() instead of Math.trunc() –
   it's not about rounding or flooring, but strictly about truncating decimals.
   */
  test('decimals (ören) must be truncated from the total and into 3740', async () => {
    vi.mocked(getAccountTotals).mockResolvedValue([
      createTransaction(2640, 2060),
      createTransaction(1650, 0),
      createTransaction(2650, 0),
    ])

    expect(await suggestVat()).toMatchObject({
      transactions: [
        {
          accountId: 2640,
          amount: -2060,
        },
        {
          accountId: 1650,
          amount: 2000,
        },
        {
          accountId: 3740,
          amount: 60,
        },
      ],
    })

    vi.mocked(getAccountTotals).mockResolvedValue([
      createTransaction(2610, -9099),
      createTransaction(1650, 0),
      createTransaction(2650, 0),
    ])

    expect(await suggestVat()).toMatchObject({
      transactions: [
        {
          accountId: 2610,
          amount: 9099,
        },
        {
          accountId: 2650,
          amount: -9000,
        },
        {
          accountId: 3740,
          amount: -99,
        },
      ],
    })

    vi.mocked(getAccountTotals).mockResolvedValue([
      createTransaction(2610, -5001),
      createTransaction(1650, 0),
      createTransaction(2650, 0),
    ])

    expect(await suggestVat()).toMatchObject({
      transactions: [
        {
          accountId: 2610,
          amount: 5001,
        },
        {
          accountId: 2650,
          amount: -5000,
        },
        {
          accountId: 3740,
          amount: -1,
        },
      ],
    })
  })
})
