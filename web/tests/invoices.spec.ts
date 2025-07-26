import { test } from '@playwright/test'

import {
  expectJournalEntry,
  expectSuggestion,
  sendDocuments,
  sendTransactions,
  submitSuggestion,
  truncateDb,
} from './utils'

test.afterAll(() => {
  truncateDb()
})

test.describe('handling invoices using Fakturametoden', () => {
  test('after importing invoices, Journal entries can be created through Suggestions', async ({
    page,
    request,
  }) => {
    await sendDocuments(['invoice2.pdf', 'invoice.pdf'], request)

    await page.goto('/')

    await expectSuggestion(
      page,
      {
        date: '2025-02-28',
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [
          ['1510', '200 000'],
          ['3011', '-160 000'],
          ['2610', '-40 000'],
        ],
      },
      0,
    )

    await expectSuggestion(
      page,
      {
        date: '2025-01-31',
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [
          ['1510', '160 000'],
          ['3011', '-128 000'],
          ['2610', '-32 000'],
        ],
      },
      1,
    )

    await submitSuggestion(page, 0)
    await submitSuggestion(page, 1)

    await page.goto('/journalEntries')

    await page.locator('button[aria-haspopup="menu"]').click()

    await page.getByRole('menuitem', { name: '2025' }).click()

    /*
      TODO:
       the order of transactions needs to be looked over. It should definitely be
       consistent between Suggestions and Journal Entries.
     */
    await expectJournalEntry(
      page,
      {
        date: '2025-02-28',
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [
          ['3011', '-160 000'],
          ['2610', '-40 000'],
          ['1510', '200 000'],
        ],
      },
      0,
    )

    await expectJournalEntry(
      page,
      {
        date: '2025-01-31',
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [
          ['3011', '-128 000'],
          ['2610', '-32 000'],
          ['1510', '160 000'],
        ],
      },
      1,
    )
  })

  test('after importing bank transactions, Journal entries can be created through Suggestions', async ({
    page,
    request,
  }) => {
    await sendTransactions(
      [
        {
          ingoingAmount: '160000.000',
          ingoingCurrency: 'SEK',
          id: 'something1',
          bookedDate: '2025-03-17',
          valueDate: '2025-03-17',
          text: 'BG 1234-5678',
          availableBalance: '160000.000',
          type: 'bankRegular',
        },
        {
          ingoingAmount: '200000.000',
          ingoingCurrency: 'SEK',
          id: 'something2',
          bookedDate: '2025-04-14',
          valueDate: '2025-04-14',
          text: 'BG 1234-5678',
          availableBalance: '360000.000',
          type: 'bankRegular',
        },
      ],
      request,
    )

    await page.goto('/')

    await expectSuggestion(
      page,
      {
        date: '2025-03-17',
        description: 'Inkomst – betalning av kundfordran',
        transactions: [
          ['1930', '160 000'],
          ['1510', '-160 000'],
        ],
        hasDocument: false,
      },
      0,
    )

    await expectSuggestion(
      page,
      {
        date: '2025-04-14',
        description: 'Inkomst – betalning av kundfordran',
        transactions: [
          ['1930', '200 000'],
          ['1510', '-200 000'],
        ],
        hasDocument: false,
      },
      1,
    )
  })
})
