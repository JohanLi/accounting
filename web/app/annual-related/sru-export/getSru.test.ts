import { describe, expect, test } from 'vitest'

import { getPeriod, getSru, roundParts } from './getSru'

describe('roundParts', () => {
  test('parts add up to the rounded total', () => {
    // 100.40 + 200.40 + 300.20 = 601.00, rounding each part gives 600
    expect(roundParts(60100, [10040, 20040, 30020])).toEqual([101, 200, 300])
  })

  test('handles negative parts', () => {
    // 1000.15 - 600.81 + 14.48 = 413.82
    expect(roundParts(41382, [100015, -60081, 1448])).toEqual([1000, -601, 15])
  })
})

describe('getPeriod', () => {
  test('is based on the month the fiscal year ends', () => {
    expect(getPeriod(new Date(Date.UTC(2026, 3, 30)))).toEqual('2026P1')
    expect(getPeriod(new Date(Date.UTC(2026, 5, 30)))).toEqual('2026P2')
    expect(getPeriod(new Date(Date.UTC(2026, 7, 31)))).toEqual('2026P3')
    expect(getPeriod(new Date(Date.UTC(2026, 11, 31)))).toEqual('2026P4')
  })
})

describe('getSru', () => {
  const input = {
    fiscalYear: {
      startInclusive: new Date(Date.UTC(2025, 6, 1)),
      endInclusive: new Date(Date.UTC(2026, 5, 30)),
    },
    accounts: [
      // revenue 100 000.40, costs 20 000.20, tax 16 000, profit 64 000.20
      { id: 3011, result: -10000040, closingBalance: 0 },
      { id: 6570, result: 2000020, closingBalance: 0 },
      { id: 8910, result: 1600000, closingBalance: 0 },
      { id: 8999, result: 6400020, closingBalance: 0 },
      // balance sheet accounts also have the change during the year as `result`
      { id: 1930, result: 10500030, closingBalance: 10500030 },
      // tax account with debit balance, i.e. a receivable
      { id: 2510, result: 0, closingBalance: 50000 },
      { id: 2081, result: 0, closingBalance: -2500000 },
      { id: 2099, result: 0, closingBalance: -6400020 },
      { id: 2650, result: 0, closingBalance: -1650010 },
    ],
    taxAdjustments: {
      nonDeductibleExpenses: 50000,
      nonTaxableRevenue: 10000,
      lossFromPrevious: 0,
    },
    company: {
      name: 'Test AB',
      orgNr: '5561234567',
      postNr: '11122',
      postOrt: 'Stockholm',
    },
    createdAt: new Date('2026-09-29T10:20:30Z'),
  }
  const { info, blanketter } = getSru(input)

  test('INFO.SRU', () => {
    expect(info).toEqual(
      [
        '#DATABESKRIVNING_START',
        '#PRODUKT SRU',
        '#SKAPAD 20260929 102030',
        '#PROGRAM https://johan.li 1.0',
        '#FILNAMN BLANKETTER.SRU',
        '#DATABESKRIVNING_SLUT',
        '#MEDIELEV_START',
        '#ORGNR 165561234567',
        '#NAMN Test AB',
        '#POSTNR 11122',
        '#POSTORT Stockholm',
        '#MEDIELEV_SLUT',
        '',
      ].join('\n'),
    )
  })

  test('BLANKETTER.SRU', () => {
    expect(blanketter).toEqual(
      [
        '#BLANKETT INK2-2026P2',
        '#IDENTITET 165561234567 20260929 102030',
        '#NAMN Test AB',
        '#UPPGIFT 7011 20250701',
        '#UPPGIFT 7012 20260630',
        '#UPPGIFT 7104 80400',
        '#BLANKETTSLUT',
        '#BLANKETT INK2R-2026P2',
        '#IDENTITET 165561234567 20260929 102030',
        '#NAMN Test AB',
        '#UPPGIFT 7011 20250701',
        '#UPPGIFT 7012 20260630',
        '#UPPGIFT 7261 500',
        '#UPPGIFT 7281 105000',
        '#UPPGIFT 7301 25000',
        '#UPPGIFT 7302 64000',
        '#UPPGIFT 7369 16500',
        '#UPPGIFT 7410 100000',
        '#UPPGIFT 7513 20000',
        '#UPPGIFT 7528 16000',
        '#UPPGIFT 7450 64000',
        '#BLANKETTSLUT',
        '#BLANKETT INK2S-2026P2',
        '#IDENTITET 165561234567 20260929 102030',
        '#NAMN Test AB',
        '#UPPGIFT 7011 20250701',
        '#UPPGIFT 7012 20260630',
        '#UPPGIFT 7650 64000',
        '#UPPGIFT 7651 16000',
        '#UPPGIFT 7653 500',
        '#UPPGIFT 7754 100',
        '#UPPGIFT 7670 80400',
        '#UPPGIFT 8041 X',
        '#UPPGIFT 8045 X',
        '#BLANKETTSLUT',
        '#FIL_SLUT',
        '',
      ].join('\n'),
    )
  })

  test('unmapped accounts cause an error', () => {
    expect(() =>
      getSru({
        fiscalYear: {
          startInclusive: new Date(Date.UTC(2025, 6, 1)),
          endInclusive: new Date(Date.UTC(2026, 5, 30)),
        },
        accounts: [
          { id: 1210, result: 0, closingBalance: 100 },
          { id: 2081, result: 0, closingBalance: -100 },
        ],
        taxAdjustments: {
          nonDeductibleExpenses: 0,
          nonTaxableRevenue: 0,
          lossFromPrevious: 0,
        },
        company: {
          name: 'Test AB',
          orgNr: '5561234567',
          postNr: '1',
          postOrt: 'X',
        },
        createdAt: new Date(),
      }),
    ).toThrow('Accounts 1210')
  })
})
