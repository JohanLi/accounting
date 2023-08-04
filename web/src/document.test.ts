import { expect, test } from 'vitest'
import { parse, Document, documentToTransactions } from './document'
import { readFile } from 'fs/promises'

test('parse', async () => {
  let data = await readFile(`${__dirname}/documents/invoice.pdf`)
  expect(await parse(data)).toEqual({
    total: 20685000,
    vat: 4137000,
    date: new Date('2023-01-14'),
    type: 'INCOME',
    description: 'Inkomst',
  })

  data = await readFile(`${__dirname}/documents/bank.pdf`)
  expect(await parse(data)).toEqual({
    total: 13000,
    vat: 0,
    date: new Date('2023-04-03'),
    type: 'BANKING_COSTS',
    description: 'SEB månadsavgift',
  })

  data = await readFile(`${__dirname}/documents/googleWorkspace.pdf`)
  expect(await parse(data)).toEqual({
    total: 520,
    vat: 0,
    date: new Date('2023-03-31'),
    type: 'GOOGLE_WORKSPACE',
    description: 'Google Workspace',
  })

  data = await readFile(`${__dirname}/documents/mobile.pdf`)
  expect(await parse(data)).toEqual({
    total: 31100,
    vat: 6220,
    date: new Date('2023-01-03'),
    type: 'MOBILE_PROVIDER',
    description: 'Tre företagsabonnemang',
  })

  data = await readFile(`${__dirname}/documents/skiing.pdf`)
  expect(await parse(data)).toEqual({
    total: 24000,
    vat: 1358,
    date: new Date('2023-01-19'),
    type: 'WELLNESS',
    description: 'Friskvård skidåkning',
  })
})

test('receiptToTransaction', () => {
  expect(
    documentToTransactions({
      total: 100,
      vat: 25,
      type: 'INCOME',
    } as Document),
  ).toEqual([
    {
      accountId: 1930,
      amount: 100,
    },
    {
      accountId: 3011,
      amount: -75,
    },
    {
      accountId: 2610,
      amount: -25,
    },
  ])

  expect(
    documentToTransactions({
      total: 100,
      vat: 0,
      type: 'BANKING_COSTS',
    } as Document),
  ).toEqual([
    {
      accountId: 6570,
      amount: 100,
    },
    {
      accountId: 1930,
      amount: -100,
    },
  ])

  expect(
    documentToTransactions({
      total: 100,
      vat: 25,
      type: 'MOBILE_PROVIDER',
    } as Document),
  ).toEqual([
    {
      accountId: 6212,
      amount: 75,
    },
    {
      accountId: 1930,
      amount: -100,
    },
    {
      accountId: 2640,
      amount: 25,
    },
  ])

  expect(
    documentToTransactions({
      total: 100,
      vat: 6,
      type: 'WELLNESS',
    } as Document),
  ).toEqual([
    {
      accountId: 7699,
      amount: 94,
    },
    {
      accountId: 2890,
      amount: -100,
    },
    {
      accountId: 2640,
      amount: 6,
    },
  ])
})
