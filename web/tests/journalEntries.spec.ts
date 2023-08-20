import { test, expect, Page } from '@playwright/test'

async function expectEntry(
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

test.describe('journal entries', () => {
  test('creating and editing', async ({ page }) => {
    const date = '2023-06-01'
    const description = 'An invoice'
    const amount = '12345'

    const debitAccountId = '1930'
    const creditAccountId = '3011'

    await page.goto('/')

    await page.locator('button:text("Create blank")').click()

    await page.getByLabel('Date').fill(date)
    await page.getByLabel('Description').fill(description)
    await page.getByLabel('Amount').fill(amount)

    await page.getByLabel('0.25').click()

    const transactionLabels = (i: number) =>
      page.getByTestId('transactions').locator('label').nth(i)
    await transactionLabels(0).fill(debitAccountId)
    await transactionLabels(1).fill(creditAccountId)

    await page.locator('button:text("Submit")').click()

    await expectEntry(page, {
      date,
      description,
      transactions: [
        [debitAccountId, '12 345'],
        ['2640', '−2 469'],
        [creditAccountId, '−9 876'],
      ],
    })

    const row = page.locator('table tbody').locator('tr').nth(0)

    await row.locator('button:text("Edit")').click()

    const editedDate = '2023-06-30'
    const editedDescription = 'An invoice, updated'

    await row.getByLabel('Date').fill(editedDate)
    await row.getByLabel('Description').fill(editedDescription)

    const transactionInputs = (i: number) =>
      row.getByTestId('transactions').locator('input').nth(i)

    await transactionInputs(0).fill('3011')
    await transactionInputs(1).fill('-8000')

    await transactionInputs(2).fill('2610')
    await transactionInputs(3).fill('-2000')

    await transactionInputs(4).fill('1930')
    await transactionInputs(5).fill('10000')

    await row.locator('button:text("Submit")').click()

    await expectEntry(page, {
      date: editedDate,
      description: editedDescription,
      transactions: [
        ['3011', '−8 000'],
        ['2610', '−2 000'],
        ['1930', '10 000'],
      ],
    })
  })
})
