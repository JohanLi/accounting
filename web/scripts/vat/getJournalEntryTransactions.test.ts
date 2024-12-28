import { expect, test } from 'vitest'

import { getJournalEntryTransactions } from './getJournalEntryTransactions'

test('moves 2610, 2640, 2614 and 2645 into 2650', () => {
  expect(
    getJournalEntryTransactions({
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
      vatTotalTruncated: 8000,
    }),
  ).toMatchObject([
    {
      accountId: 2610,
      amount: 10000,
    },
    {
      accountId: 2640,
      amount: -2000,
    },
    {
      accountId: 2614,
      amount: 1000,
    },
    {
      accountId: 2645,
      amount: -1000,
    },
    {
      accountId: 2650,
      amount: -8000,
    },
  ])
})

test('remainder cents are moved to 3740', () => {
  expect(
    getJournalEntryTransactions({
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
      vatTotalTruncated: 8900,
    }),
  ).toMatchObject([
    {
      accountId: 2610,
      amount: 10090,
    },
    {
      accountId: 2614,
      amount: 1060,
    },
    {
      accountId: 2640,
      amount: -1080,
    },
    {
      accountId: 2645,
      amount: -1060,
    },
    {
      accountId: 2650,
      amount: -8900,
    },
    {
      accountId: 3740,
      amount: -110,
    },
  ])
})

test(`throws if remainder cents are too many, indicating something's wrong`, () => {
  expect(() =>
    getJournalEntryTransactions({
      accounts: [
        {
          id: 2610,
          amount: -10090,
        },
      ],
      vatTotalTruncated: -10090,
    }),
  ).toThrow()
})

test('2650 can end up being debited as well', () => {
  expect(
    getJournalEntryTransactions({
      accounts: [
        {
          id: 2610,
          amount: -10000,
        },
        {
          id: 2640,
          amount: 20000,
        },
      ],
      vatTotalTruncated: -10000,
    }),
  ).toMatchObject([
    {
      accountId: 2610,
      amount: 10000,
    },
    {
      accountId: 2640,
      amount: -20000,
    },
    {
      accountId: 2650,
      amount: 10000,
    },
  ])
})
