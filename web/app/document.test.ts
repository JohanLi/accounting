import { expect, test, vi } from 'vitest'

import { readTestDocument } from '../tests/utils'
import { getPDFLines, getRecognizedDocument } from './document'
import { getNonLinkedBankTransactions } from './getNonLinkedBankTransactions'

vi.mock('./getNonLinkedBankTransactions', () => ({
  getNonLinkedBankTransactions: vi.fn(),
}))

async function getRecognizedDocumentFromFile(filename: string) {
  const data = await readTestDocument(filename)
  const strings = await getPDFLines(data)
  return getRecognizedDocument(strings)
}

test('getRecognizedDocument', async () => {
  expect(await getRecognizedDocumentFromFile('invoice.pdf')).toEqual({
    date: new Date('2026-04-30'),
    description: 'Recognized document – Inkomst kundfordran',
    transactions: [
      {
        accountId: 1510,
        amount: 20500000,
      },
      {
        accountId: 2610,
        amount: -4100000,
      },
      {
        accountId: 3011,
        amount: -16400000,
      },
    ],
    linkedToTransactionIds: [],
  })

  vi.mocked(getNonLinkedBankTransactions).mockResolvedValueOnce([
    {
      id: 5,
      amount: -13000,
      // intentionally a day ahead, based on what's occurring in practice
      date: new Date('2025-04-02'),
    },
  ])

  expect(await getRecognizedDocumentFromFile('bank.pdf')).toEqual({
    date: new Date('2023-04-03'),
    description: 'Recognized document – SEB månadsavgift',
    transactions: [
      {
        accountId: 6570,
        amount: 13000,
      },
      {
        accountId: 1930,
        amount: -13000,
      },
    ],
    linkedToTransactionIds: [5],
  })

  vi.mocked(getNonLinkedBankTransactions).mockResolvedValueOnce([
    {
      id: 22,
      amount: -37400,
      date: new Date('2025-01-31'),
    },
  ])

  expect(await getRecognizedDocumentFromFile('mobileProvider.pdf')).toEqual({
    date: new Date('2025-01-31'),
    description: 'Recognized document – Tre företagsabonnemang',
    transactions: [
      {
        accountId: 2640,
        amount: 7480,
      },
      {
        accountId: 6212,
        amount: 29920,
      },
      {
        accountId: 1930,
        amount: -37400,
      },
    ],
    linkedToTransactionIds: [22],
  })

  expect(await getRecognizedDocumentFromFile('annualReport.pdf')).toEqual({
    date: new Date('2025-08-02'),
    description: 'Recognized document – Årsredovisning Online',
    transactions: [
      {
        accountId: 2640,
        amount: 42250,
      },
      {
        accountId: 6550,
        amount: 169000,
      },
      {
        accountId: 1930,
        amount: -211250,
      },
    ],
    linkedToTransactionIds: [],
  })

  vi.mocked(getNonLinkedBankTransactions).mockResolvedValueOnce([
    {
      id: 44,
      amount: -20697,
      date: new Date('2026-06-15'),
    },
  ])

  expect(await getRecognizedDocumentFromFile('chatgpt.pdf')).toEqual({
    date: new Date('2026-06-13'),
    description: 'Recognized document – ChatGPT Plus',
    transactions: [
      {
        accountId: 4535,
        amount: 20697,
      },
      {
        accountId: 1930,
        amount: -20697,
      },
      {
        accountId: 2614,
        amount: -5174,
      },
      {
        accountId: 2645,
        amount: 5174,
      },
    ],
    linkedToTransactionIds: [44],
  })
})
