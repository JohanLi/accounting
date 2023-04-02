import { expect, test } from 'vitest'
import { parse } from './receipt'

test('parse', async () => {
  expect(await parse(`${__dirname}/receipts/invoice.pdf`)).toEqual({
    total: 20685000,
    vat: 4137000,
    date: new Date('2023-01-14'),
    type: 'SALE_WITHIN_SWEDEN_25',
    description: 'Income',
  })

  expect(await parse(`${__dirname}/receipts/bank.pdf`)).toEqual({
    total: 12000,
    vat: 0,
    date: new Date('2022-08-17'),
    type: '',
    description: '',
  })

  expect(await parse(`${__dirname}/receipts/mobile.pdf`)).toEqual({
    total: 31100,
    vat: 6220,
    date: new Date('2023-01-03'),
    type: '',
    description: '',
  })

  expect(await parse(`${__dirname}/receipts/skiing.pdf`)).toEqual({
    total: 24000,
    vat: 1358,
    date: new Date('2023-01-19'),
    type: '',
    description: '',
  })
})
