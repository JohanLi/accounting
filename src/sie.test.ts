import { expect, test } from 'vitest'
import { extractVerifications } from './sie'

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
	#TRANS 1932 {} -100000.00
}

`),
  ).toEqual([
    {
      id: 'V-1',
      date: '20230102',
      description: 'Friskvård',
      created: '20230110',
      transactions: [
        {
          accountCode: '2640',
          amount: '13.58',
        },
        {
          accountCode: '2890',
          amount: '-240.00',
        },
        {
          accountCode: '7699',
          amount: '226.42',
        },
      ],
    },
    {
      id: 'V-2',
      date: '20230105',
      description: 'Insättning till skattekonto',
      created: '20230110',
      transactions: [
        {
          accountCode: '1630',
          amount: '100000.00',
        },
        {
          accountCode: '1932',
          amount: '-100000.00',
        },
      ],
    },
  ])
})
