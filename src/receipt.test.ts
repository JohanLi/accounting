import { expect, test } from 'vitest'
import { parse } from './receipt'
import { readFile } from 'fs/promises'

test('parse', async () => {
  let data = await readFile(`${__dirname}/receipts/invoice.pdf`)
  expect(await parse(data)).toEqual({
    total: 20685000,
    vat: 4137000,
    date: new Date('2023-01-14'),
    type: 'SALE_WITHIN_SWEDEN_25',
    description: 'Income',
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
    type: '',
    description: '',
  })

  data = await readFile(`${__dirname}/receipts/skiing.pdf`)
  expect(await parse(data)).toEqual({
    total: 24000,
    vat: 1358,
    date: new Date('2023-01-19'),
    type: '',
    description: '',
  })
})
