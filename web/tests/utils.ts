import { APIRequestContext, Page, expect } from '@playwright/test'
import { readFile } from 'fs/promises'

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

export async function expectSuggestion(
  page: Page,
  {
    date,
    description,
    transactions,
  }: { date: string; description: string; transactions: [string, string][] },
  number: number,
) {
  const journalEntryForm = page.getByTestId('journalEntryForm').nth(number)

  await expect(journalEntryForm.getByLabel('Date')).toHaveValue(date)
  await expect(journalEntryForm.getByLabel('Description')).toHaveValue(
    description,
  )

  await Promise.all(
    transactions.map((transaction, i) => {
      const t = journalEntryForm.getByTestId('transaction').nth(i)

      return Promise.all([
        expect(t.locator('div').nth(0)).toHaveText(transaction[0]),
        expect(t.locator('div').nth(1)).toHaveText(transaction[1]),
      ])
    }),
  )
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
