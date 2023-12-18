import { expect, test, describe } from 'vitest'
import {
  getRecognizedDocument,
  getForeignCurrencyMonetaryValues,
  getPDFStrings,
  getMonetaryValues,
} from './document'
import { readTestDocument } from '../tests/utils'

async function getRecognizedDocumentFromFile(filename: string) {
  const data = await readTestDocument(filename)
  const strings = await getPDFStrings(data)
  return getRecognizedDocument(strings)
}

test('parse', async () => {
  expect(await getRecognizedDocumentFromFile('invoice.pdf')).toEqual({
    date: new Date('2023-01-14'),
    description: 'Recognized document – Inkomst',
    transactions: [
      {
        accountId: 1930,
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

  expect(await getRecognizedDocumentFromFile('mobile.pdf')).toEqual({
    date: new Date('2023-01-03'),

    description: 'Recognized document – Tre företagsabonnemang',
    transactions: [
      {
        accountId: 6212,
        amount: 24880,
      },
      {
        accountId: 1930,
        amount: -31100,
      },
      {
        accountId: 2640,
        amount: 6220,
      },
    ],
  })

  expect(await getRecognizedDocumentFromFile('skiing.pdf')).toEqual({
    date: new Date('2023-01-19'),

    description: 'Recognized document – Friskvård skidåkning',
    transactions: [
      {
        accountId: 7699,
        amount: 22642,
      },
      {
        accountId: 2890,
        amount: -24000,
      },
      {
        accountId: 2640,
        amount: 1358,
      },
    ],
  })
})

describe('getMonetaryValues', () => {
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
  })

  test('removes duplicates', () => {
    expect(getMonetaryValues(['4,34 SEK', '4,34 SEK'])).toEqual([434])
  })

  test('sorts in descending order', () => {
    expect(getMonetaryValues(['12,34', '55,20', '32,10'])).toEqual([
      5520, 3210, 1234,
    ])
  })
})

describe('getForeignCurrencyMonetaryValues', () => {
  test('works for known formats, returning the amount in cents', () => {
    expect(getForeignCurrencyMonetaryValues(['€5.20'])).toEqual({
      foreignCurrency: 'EUR',
      values: [520],
    })

    expect(getForeignCurrencyMonetaryValues(['159.00 EUR'])).toEqual({
      foreignCurrency: 'EUR',
      values: [15900],
    })

    expect(getForeignCurrencyMonetaryValues(['$12.34 USD'])).toEqual({
      foreignCurrency: 'USD',
      values: [1234],
    })
  })

  test('does not pick up on SEK', () => {
    expect(
      getForeignCurrencyMonetaryValues([
        '1,23 SEK',
        '12.34 SEK',
        '2.555,20',
        '380,00',
      ]),
    ).toEqual(null)
  })

  test('uses only the first found format', () => {
    expect(getForeignCurrencyMonetaryValues(['€5.20', '159.00 EUR'])).toEqual({
      foreignCurrency: 'EUR',
      values: [520],
    })
  })

  test('removes duplicates', () => {
    expect(
      getForeignCurrencyMonetaryValues(['159.00 EUR', '159.00 EUR']),
    ).toEqual({
      foreignCurrency: 'EUR',
      values: [15900],
    })
  })

  test('sorts in descending order', () => {
    expect(
      getForeignCurrencyMonetaryValues(['59.00 EUR', '159.00 EUR']),
    ).toEqual({
      foreignCurrency: 'EUR',
      values: [15900, 5900],
    })
  })
})
