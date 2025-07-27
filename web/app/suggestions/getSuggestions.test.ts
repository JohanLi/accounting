import { describe, expect, test, vi } from 'vitest'

import { getBankSavingsSuggestions } from './bankSavingsSuggestions'
import { getDocumentSuggestions } from './documentSuggestions'
import { getSuggestions } from './getSuggestions'
import { getInsuranceSuggestions } from './insuranceSuggestions'
import { getPaidInvoiceSuggestions } from './paidInvoiceSuggestions'
import { getTaxSuggestions } from './taxSuggestions'

vi.mock('./taxSuggestions', () => ({
  getTaxSuggestions: vi.fn(),
}))
vi.mock('./bankSavingsSuggestions', () => ({
  getBankSavingsSuggestions: vi.fn(),
}))
vi.mock('./insuranceSuggestions', () => ({
  getInsuranceSuggestions: vi.fn(),
}))
vi.mock('./paidInvoiceSuggestions', () => ({
  getPaidInvoiceSuggestions: vi.fn(),
}))
vi.mock('./documentSuggestions', () => ({
  getDocumentSuggestions: vi.fn(),
}))

describe('getSuggestions', () => {
  test('filters nulls and sorts by date ascending within each group', async () => {
    vi.mocked(getTaxSuggestions).mockResolvedValue([])
    vi.mocked(getBankSavingsSuggestions).mockResolvedValue([
      null,
      {
        date: new Date('2025-03-01'),
        description: 'Bank – överföring sparkonto',
        transactions: [],
        linkedToTransactionIds: [],
      },
      null,
      {
        date: new Date('2025-02-01'),
        description: 'Bank – överföring sparkonto',
        transactions: [],
        linkedToTransactionIds: [],
      },
    ])
    vi.mocked(getInsuranceSuggestions).mockResolvedValue([])
    vi.mocked(getPaidInvoiceSuggestions).mockResolvedValue([])
    vi.mocked(getDocumentSuggestions).mockResolvedValue([
      {
        date: new Date('2025-01-01'),
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [],
        linkedToTransactionIds: [],
        documentId: 2,
      },
      {
        date: new Date('2025-04-01'),
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [],
        linkedToTransactionIds: [],
        documentId: 1,
      },
    ])

    const suggestions = await getSuggestions()

    expect(
      suggestions.map((suggestion) => ({
        date: suggestion.date,
        description: suggestion.description,
      })),
    ).toEqual([
      {
        date: new Date('2025-02-01'),
        description: 'Bank – överföring sparkonto',
      },
      {
        date: new Date('2025-03-01'),
        description: 'Bank – överföring sparkonto',
      },
      {
        date: new Date('2025-01-01'),
        description: 'Recognized document – Inkomst kundfordran',
      },
      {
        date: new Date('2025-04-01'),
        description: 'Recognized document – Inkomst kundfordran',
      },
    ])
  })
})
