import { expect, test } from 'vitest'
import { parse, Receipt, receiptToTransaction } from './receipt'
import { readFile } from 'fs/promises'

test('parse', async () => {
  let data = await readFile(`${__dirname}/receipts/invoice.pdf`)
  expect(await parse(data)).toEqual({
    total: 20685000,
    vat: 4137000,
    date: new Date('2023-01-14'),
    type: 'INCOME',
    description: 'Inkomst',
  })

  data = await readFile(`${__dirname}/receipts/bank.pdf`)
  expect(await parse(data)).toEqual({
    total: 13000,
    vat: 0,
    date: new Date('2023-04-03'),
    type: 'BANKING_COSTS',
    description: 'SEB månadsavgift',
  })

  data = await readFile(`${__dirname}/receipts/mobile.pdf`)
  expect(await parse(data)).toEqual({
    total: 31100,
    vat: 6220,
    date: new Date('2023-01-03'),
    type: 'MOBILE_PROVIDER',
    description: 'Tre företagsabonnemang',
  })

  data = await readFile(`${__dirname}/receipts/skiing.pdf`)
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
    receiptToTransaction({
      total: 100,
      vat: 25,
      type: 'INCOME',
    } as Receipt),
  ).toEqual([
    {
      accountCode: 1930,
      amount: 100,
    },
    {
      accountCode: 3011,
      amount: -75,
    },
    {
      accountCode: 2610,
      amount: -25,
    },
  ])

  expect(
    receiptToTransaction({
      total: 100,
      vat: 0,
      type: 'BANKING_COSTS',
    } as Receipt),
  ).toEqual([
    {
      accountCode: 6570,
      amount: 100,
    },
    {
      accountCode: 1930,
      amount: -100,
    },
  ])

  expect(
    receiptToTransaction({
      total: 100,
      vat: 25,
      type: 'MOBILE_PROVIDER',
    } as Receipt),
  ).toEqual([
    {
      accountCode: 6212,
      amount: 75,
    },
    {
      accountCode: 1930,
      amount: -100,
    },
    {
      accountCode: 2640,
      amount: 25,
    },
  ])

  expect(
    receiptToTransaction({
      total: 100,
      vat: 6,
      type: 'WELLNESS',
    } as Receipt),
  ).toEqual([
    {
      accountCode: 7699,
      amount: 94,
    },
    {
      accountCode: 2890,
      amount: -100,
    },
    {
      accountCode: 2640,
      amount: 6,
    },
  ])
})
