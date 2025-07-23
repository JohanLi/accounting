import { describe, expect, test } from 'vitest'

import { readTestDocument } from '../tests/utils'
import {
  getDates,
  getMonetaryValues,
  getPDFStrings,
  getRecognizedDocument,
} from './document'

async function getRecognizedDocumentFromFile(filename: string) {
  const data = await readTestDocument(filename)
  const strings = await getPDFStrings(data)
  return getRecognizedDocument(strings)
}

test('parse', async () => {
  expect(await getRecognizedDocumentFromFile('invoice.pdf')).toEqual({
    date: new Date('2022-11-30'),
    description: 'Recognized document – Inkomst kundfordran',
    transactions: [
      {
        accountId: 1510,
        amount: 20685000,
      },
      {
        accountId: 3011,
        amount: -16548000,
      },
      {
        accountId: 2610,
        amount: -4137000,
      },
    ],
  })

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
  })

  expect(await getRecognizedDocumentFromFile('mobileProvider.pdf')).toEqual({
    date: new Date('2025-01-31'),

    description: 'Recognized document – Tre företagsabonnemang',
    transactions: [
      {
        accountId: 6212,
        amount: 29920,
      },
      {
        accountId: 1930,
        amount: -37400,
      },
      {
        accountId: 2640,
        amount: 7480,
      },
    ],
  })
})

describe('getDates', () => {
  test('JetBrains invoices', () => {
    expect(
      getDates(['Payment Date: 26.4.2023', '26.4.2023', 'Due date: 26.4.2023']),
    ).toEqual([new Date('2023-04-26')])
  })

  test('Namecheap invoices', () => {
    expect(getDates([': 5/25/2024 1:23:11 PM'], true)).toEqual([
      new Date('2024-05-25'),
    ])
  })
})

describe('getMonetaryValues', () => {
  test('recognizes my invoices', () => {
    expect(getMonetaryValues(['123 456,78'])).toEqual([12345678])
  })

  test('works for known formats, returning the amount in ören', () => {
    expect(getMonetaryValues(['1,23 SEK'])).toEqual([123])
    expect(getMonetaryValues(['12.34 SEK'])).toEqual([1234])
    expect(getMonetaryValues(['2.555,20'])).toEqual([255520])
    expect(getMonetaryValues(['380,00'])).toEqual([38000])
  })

  test('uses only the first found format', () => {
    expect(
      getMonetaryValues(['1,23 SEK', '12.34 SEK', '2.555,20', '380,00']),
    ).toEqual([123])

    // unhandled: Skånetrafiken tickets contain "31 SEK" without decimals but "1,75 SEK" for VAT
  })

  test('removes duplicates', () => {
    expect(getMonetaryValues(['4,34 SEK', '4,34 SEK'])).toEqual([434])
  })

  test('sorts in descending order', () => {
    expect(getMonetaryValues(['1 600,00', '400,00', '2 000,00'])).toEqual([
      200000, 160000, 40000,
    ])
  })

  test('prefers comma over period as the decimal separator when dealing with SEK', () => {
    expect(getMonetaryValues(['9 876.54 SEK', '1 234,56 SEK'])).toEqual([
      123456,
    ])
  })
})
