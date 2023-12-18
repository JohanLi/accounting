import { expect, Page } from '@playwright/test'
import { readFile } from 'fs/promises'

export function readTestDocument(filename: string) {
  return readFile(`${__dirname}/documents/${filename}`)
}

/*
  adapted from https://github.com/microsoft/playwright/issues/13364#issuecomment-1156288428

  Half of this code runs in Node, while the other half runs in the browser.
  There's no readFile nor Buffer in the browser – it receives the file contents
  as base64
 */
export async function dragAndDropDocuments(page: Page, filenames: string[]) {
  const base64List = await Promise.all(
    filenames.map(async (filename) =>
      (await readTestDocument(filename)).toString('base64'),
    ),
  )

  const dataTransfer = await page.evaluateHandle(
    async ({ base64List }) => {
      const dt = new DataTransfer()

      for (const base64 of base64List) {
        const blob = await (
          await fetch(`data:application/octet-stream;base64,${base64}`)
        ).blob()

        dt.items.add(new File([blob], '', { type: 'application/pdf' }))
      }

      return dt
    },
    { base64List },
  )

  await page
    .getByText('Drag and drop PDF file(s)')
    .dispatchEvent('drop', { dataTransfer })
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
        expect(t.locator('input').nth(0)).toHaveValue(transaction[0]),
        expect(t.locator('input').nth(1)).toHaveValue(transaction[1]),
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
