import { describe, expect, test, vi } from 'vitest'
import { getTaxSuggestions } from './taxSuggestions'

// this approach to get per-test mocks is taken from https://github.com/vitest-dev/vitest/discussions/3589#discussioncomment-6195214
const mocks = vi.hoisted(() => {
  return {
    getTaxTransactions: vi.fn(),
  }
})

vi.mock('./getTaxTransactions', () => {
  return {
    getTaxTransactions: mocks.getTaxTransactions,
  }
})

// this is the preliminary tax you pay on behalf of employees
describe('Personalskatt', () => {
  const id = 1
  const amountFromTaxAccount = -7000000
  const date = '2024-03-12T00:00:00.000Z'
  const taxTransactions = (description: string) => [
    {
      id,
      date,
      description,
      amount: amountFromTaxAccount,
    },
  ]
  const expectedSuggestions = [
    {
      date,
      description: 'Skatt – Personalskatt',
      linkedToTransactionIds: [id],
      transactions: [
        {
          accountId: 2710,
          amount: -amountFromTaxAccount,
        },
        {
          accountId: 1630,
          amount: amountFromTaxAccount,
        },
      ],
    },
  ]

  test('handles descriptions like "Avdragen skatt jan 2024"', async () => {
    mocks.getTaxTransactions.mockResolvedValue(
      taxTransactions('Avdragen skatt jan 2024'),
    )

    expect(await getTaxSuggestions()).toEqual(expectedSuggestions)
  })

  /*
    This "Beslut \d{6}" prefix seems to be added if you resubmit an arbetsgivardeklaration, which
    I did around November 2023.

    In my experience, a correction doesn't "amend" the first submission even if you made the correction
    a few minutes later.
   */
  test('handles descriptions like "Beslut 240131 avdragen skatt jan 2024"', async () => {
    mocks.getTaxTransactions.mockResolvedValue(
      taxTransactions('Beslut 240131 avdragen skatt jan 2024'),
    )

    expect(await getTaxSuggestions()).toEqual(expectedSuggestions)
  })
})
