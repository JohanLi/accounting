import { expect, test } from 'vitest'
import {
  extractVerifications,
  getUniqueAccountCodes,
  markDeletedAndRemoveNegations,
} from './sie'
import { VerificationInsert } from './pages/api/import'

test('extractVerifications', () => {
  expect(
    extractVerifications(`
a
b
#VER "V" "1" 20230102 "Friskvård" 20230110
{
	#TRANS 2640 {} 13.58
	#TRANS 2890 {} -240.00
	#TRANS 7699 {} 226.42
}
#VER "V" "2" 20230105 "Insättning till skattekonto" 20230110
{
	#TRANS 1630 {} 100000.00
	#TRANS 1930 {} -100000.00
}

`),
  ).toEqual([
    {
      id: 1,
      date: new Date('2023-01-02'),
      description: 'Friskvård',
      createdAt: new Date('2023-01-10'),
      deletedAt: null,
      transactions: [
        {
          accountCode: 2640,
          amount: 1358,
        },
        {
          accountCode: 2890,
          amount: -24000,
        },
        {
          accountCode: 7699,
          amount: 22642,
        },
      ],
    },
    {
      id: 2,
      date: new Date('2023-01-05'),
      description: 'Insättning till skattekonto',
      createdAt: new Date('2023-01-10'),
      deletedAt: null,
      transactions: [
        {
          accountCode: 1630,
          amount: 10000000,
        },
        {
          accountCode: 1930,
          amount: -10000000,
        },
      ],
    },
  ])
})

test('getUniqueAccountCodes', () => {
  expect(
    getUniqueAccountCodes([
      {
        transactions: [
          {
            accountCode: 2640,
            amount: 0,
          },
        ],
      },
      {
        transactions: [
          {
            accountCode: 1630,
            amount: 0,
          },
          {
            accountCode: 1930,
            amount: 0,
          },
          {
            accountCode: 2640,
            amount: 0,
          },
        ],
      },
    ] as VerificationInsert[]),
  ).toEqual([2640, 1630, 1930])
})

/*
  Deletions in my previous bookkeeping software is handled this way.
  While it might be convention, it's not documented in the SIE specification.

  I don't intend to handle it the same way — instead, verifications will simply
  have a deletedAt field.
 */
test('markDeletedAndRemoveNegations', () => {
  expect(
    markDeletedAndRemoveNegations([
      {
        id: 1,
        description: 'Friskvård',
      },
      {
        id: 2,
        description: 'Insättning till skattekonto',
      },
      {
        id: 3,
        description: 'Annullering av V1',
        createdAt: new Date('2023-02-01'),
      },
    ] as VerificationInsert[]),
  ).toEqual([
    {
      id: 1,
      description: 'Friskvård',
      deletedAt: new Date('2023-02-01'),
    },
    {
      id: 2,
      description: 'Insättning till skattekonto',
    },
  ])
})
