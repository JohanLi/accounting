import { APIRequestContext, Page, expect } from '@playwright/test'
import { execSync } from 'child_process'
import { readFile } from 'fs/promises'

import { TransactionsType } from '../app/api/transactions/transactions'

export function readTestDocument(filename: string) {
  return readFile(`${__dirname}/documents/${filename}`)
}

export async function sendDocuments(
  filenames: string[],
  request: APIRequestContext,
) {
  const base64List = await Promise.all(
    filenames.map(async (filename) =>
      (await readTestDocument(filename)).toString('base64'),
    ),
  )

  return request.put('/api/documents', {
    headers: {
      'Content-Type': 'application/json',
    },
    data: base64List.map((base64, i) => ({
      filename: filenames[i],
      data: base64,
    })),
  })
}

type Transaction = {
  date: string
  description: string
  amount: string
}

export async function expectSuggestion(
  page: Page,
  {
    date,
    description,
    transactions,
  }: {
    date: string
    description: string
    transactions: [string, string][]
  },
  number: number,
) {
  const journalEntryForm = page
    .locator(
      'div:has(h2:has-text("Suggestions")) [role="row"]:has(input[type="date"])',
    )
    .nth(number)

  await expect(journalEntryForm.locator('input[type="date"]')).toHaveValue(date)
  await expect(journalEntryForm.locator('input[type="text"]')).toHaveValue(
    description,
  )

  await Promise.all(
    transactions.map((transaction, i) => {
      const t = journalEntryForm.getByTestId('transaction').nth(i)

      return Promise.all([
        expect(t.locator('[role="cell"]').nth(0)).toHaveText(transaction[0]),
        expect(t.locator('[role="cell"]').nth(1)).toHaveText(transaction[1]),
      ])
    }),
  )

  await expect(
    journalEntryForm.locator('a:has(svg[data-slot="icon"])'),
  ).toHaveAttribute('href', /\/api\/documents\?id=\d+/)
}

export async function submitSuggestion(page: Page, index = 0) {
  const journalEntryForms = page.locator(
    'div:has(h2:has-text("Suggestions")) [role="row"]:has(input[type="date"])',
  )
  const initialCount = await journalEntryForms.count()

  await journalEntryForms.nth(index).locator('button[type="submit"]').click()

  await expect(journalEntryForms).toHaveCount(initialCount - 1)
}

export async function expectJournalEntry(
  page: Page,
  {
    date,
    description,
    transactions,
    linkedTransactions = [],
  }: {
    date: string
    description: string
    transactions: [string, string][]
    linkedTransactions?: Transaction[]
  },
  number: number,
) {
  const entry = page.getByTestId('journal-entry').nth(number)

  const columns = (i: number) => entry.locator('[role="cell"]').nth(i)

  await expect(columns(0)).toHaveText(date)
  await expect(columns(1)).toHaveText(description)

  await Promise.all(
    transactions.map((transaction, i) => {
      const t = entry.getByTestId('transaction').nth(i)

      return Promise.all([
        expect(t.locator('[role="cell"]').nth(0)).toHaveText(transaction[0]),
        expect(t.locator('[role="cell"]').nth(1)).toHaveText(transaction[1]),
      ])
    }),
  )

  if (linkedTransactions.length) {
    await entry.getByRole('button', { name: 'Linked' }).click()

    await Promise.all(
      linkedTransactions.map((transaction, i) => {
        const selectedRow = page
          .locator('[data-headlessui-state="open"] .bg-yellow-100[role="row"]')
          .nth(i)

        return Promise.all([
          expect(selectedRow.locator('[role="cell"]').nth(0)).toHaveText(
            transaction.date,
          ),
          expect(selectedRow.locator('[role="cell"]').nth(1)).toHaveText(
            transaction.description,
          ),
          expect(selectedRow.locator('[role="cell"]').nth(2)).toHaveText(
            transaction.amount,
          ),
        ])
      }),
    )
  }
}

export async function expectEntry(
  page: Page,
  {
    date,
    description,
    transactions,
  }: { date: string; description: string; transactions: [string, string][] },
) {
  const row = page.locator('table tbody').locator('tr').nth(0)

  const columns = (i: number) => row.locator('td').nth(i)

  await expect(columns(0)).toHaveText(date)
  await expect(columns(1)).toHaveText(description)

  const transactionRows = (i: number) =>
    columns(2).locator('table tbody').locator('tr').nth(i).locator('td')

  for (let i = 0; i < transactions.length; i++) {
    await expect(transactionRows(i)).toHaveText(transactions[i])
  }
}

export async function sendTransactions(
  transactions: TransactionsType,
  request: APIRequestContext,
) {
  return request.put('/api/transactions', {
    data: transactions.reverse(),
  })
}

export function truncateDb() {
  execSync('tsx ./scripts/db/truncate.ts', { stdio: 'inherit' })
}
