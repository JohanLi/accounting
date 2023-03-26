import { expect, test } from 'vitest'
import { parse } from './receipt'

test('parse', async () => {
  expect(await parse(`${__dirname}/receipts/invoice.pdf`)).toEqual({
    total: '206850.00',
    vat: '41370.00',
    date: new Date('2023-01-14'),
  })

  expect(await parse(`${__dirname}/receipts/bank.pdf`)).toEqual({
    total: '120.00',
    vat: '0.00',
    date: new Date('2022-08-17'),
  })

  expect(await parse(`${__dirname}/receipts/mobile.pdf`)).toEqual({
    total: '311.00',
    vat: '62.20',
    date: new Date('2023-01-03'),
  })

  expect(await parse(`${__dirname}/receipts/skiing.pdf`)).toEqual({
    total: '240.00',
    vat: '13.58',
    date: new Date('2023-01-19'),
  })
})
