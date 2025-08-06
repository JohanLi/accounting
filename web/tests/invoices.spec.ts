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
    /*
      Invoices (and most other documents and receipts) are sorted by newest first on other platforms.
      When my script downloads a batch of them, the newest then ends up with the lowest ID.

      While it doesn't matter all too much, I find it easier to mentally keep track of Suggestions if the
      earliest date comes first.
     */
    await sendDocuments(['invoice2.pdf', 'invoice.pdf'], request)

    await page.goto('/')

    await expectSuggestion(
      page,
      {
        date: '2025-01-31',
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [
          ['1510', '160 000'],
          ['2610', '-32 000'],
          ['3011', '-128 000'],
        ],
      },
      0,
    )

    await expectSuggestion(
      page,
      {
        date: '2025-02-28',
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [
          ['1510', '200 000'],
          ['2610', '-40 000'],
          ['3011', '-160 000'],
        ],
      },
      1,
    )

    await submitSuggestion(page)
    await submitSuggestion(page)

    await page.goto('/journalEntries')

    await page
      .locator('label:has-text("FY") button[aria-haspopup="menu"]')
      .click()

    await page.getByRole('menuitem', { name: '2025' }).click()

    await expectJournalEntry(
      page,
      {
        date: '2025-02-28',
        description: 'Recognized document – Inkomst kundfordran',
        transactions: [
          ['1510', '200 000'],
          ['2610', '-40 000'],
          ['3011', '-160 000'],
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
          ['1510', '160 000'],
          ['2610', '-32 000'],
          ['3011', '-128 000'],
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

    await submitSuggestion(page)
    await submitSuggestion(page)

    await page.goto('/journalEntries')

    await page
      .locator('label:has-text("FY") button[aria-haspopup="menu"]')
      .click()

    await page.getByRole('menuitem', { name: '2025' }).click()

    await expectJournalEntry(
      page,
      {
        date: '2025-04-14',
        description: 'Inkomst – betalning av kundfordran',
        transactions: [
          ['1930', '200 000'],
          ['1510', '-200 000'],
        ],
        linkedTransactions: [
          {
            date: '2025-04-14',
            description: 'BG 1234-5678',
            amount: '200 000',
          },
        ],
      },
      0,
    )

    await expectJournalEntry(
      page,
      {
        date: '2025-03-17',
        description: 'Inkomst – betalning av kundfordran',
        transactions: [
          ['1930', '160 000'],
          ['1510', '-160 000'],
        ],
        linkedTransactions: [
          {
            date: '2025-03-17',
            description: 'BG 1234-5678',
            amount: '160 000',
          },
        ],
      },
      1,
    )
  })
})
