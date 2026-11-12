import { expect, test } from 'vitest'

import { getXML } from './getXML'

test('vat total is based on 2610, 2640, 2614 and 2645', () => {
  expect(
    getXML({
      endInclusive: new Date('2024-01-01'),
      salesAccounts: [],
      accounts: [
        {
          id: 2610,
          amount: -10000,
        },
        {
          id: 2640,
          amount: 2000,
        },
        {
          id: 2614,
          amount: -1000,
        },
        {
          id: 2645,
          amount: 1000,
        },
      ],
    }),
  ).toMatchObject({
    vatTotalTruncated: 8000,
  })
})

test('2610, 2614, 2640 + 2645 each have their decimals truncated', () => {
  expect(
    getXML({
      endInclusive: new Date('2024-01-01'),
      salesAccounts: [],
      accounts: [
        {
          id: 2610,
          amount: -10090,
        },
        {
          id: 2614,
          amount: -1060,
        },
        {
          id: 2640,
          amount: 1080,
        },
        {
          id: 2645,
          amount: 1060,
        },
      ],
    }),
  ).toMatchObject({
    vatTotalTruncated: -(-10000 - 1000 + 2100),
  })
})

test('sales are based on salesAccounts, leaving out accrued income', () => {
  const { xml } = getXML({
    endInclusive: new Date('2026-09-30'),
    // includes the reversal of 16800000 in accrued income from the previous quarter
    accounts: [
      { id: 3011, amount: -32400000 },
      { id: 2610, amount: -12300000 },
    ],
    salesAccounts: [
      { id: 3011, amount: -49200000 },
      { id: 2610, amount: -12300000 },
    ],
  })

  expect(xml).toContain('<ForsMomsEjAnnan>492000</ForsMomsEjAnnan>')
  expect(xml).toContain('<MomsUtgHog>123000</MomsUtgHog>')
})
