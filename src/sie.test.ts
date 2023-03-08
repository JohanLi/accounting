import { expect, test } from 'vitest'
import { extractVerifications, getUniqueAccountCodes } from './sie'

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
    ]),
  ).toEqual([2640, 1630, 1930])
})
