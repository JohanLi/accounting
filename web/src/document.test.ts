import { expect, test } from 'vitest'
import {
  getRecognizedDocument,
  getForeignCurrencyMonetaryValues,
  getPDFStrings,
} from './document'
import { readFile } from 'fs/promises'

async function getRecognizedDocumentFromFile(filename: string) {
  const data = await readFile(`${__dirname}/documents/${filename}`)
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

test('getForeignCurrencyMonetaryValues', () => {
  expect(getForeignCurrencyMonetaryValues(['€5.20', '€0.00', '€5.20'])).toEqual(
    {
      foreignCurrency: 'EUR',
      values: [520, 0],
    },
  )

  expect(getForeignCurrencyMonetaryValues(['159.00 EUR', '0.00 EUR'])).toEqual({
    foreignCurrency: 'EUR',
    values: [15900, 0],
  })

  expect(
    getForeignCurrencyMonetaryValues(['$12.34 ($100/year)', '$12.34 USD']),
  ).toEqual({
    foreignCurrency: 'USD',
    values: [1234],
  })

  expect(
    getForeignCurrencyMonetaryValues([
      '12,34',
      '12,34 SEK',
      '12.34',
      '12.34 SEK',
    ]),
  ).toEqual(null)
})
