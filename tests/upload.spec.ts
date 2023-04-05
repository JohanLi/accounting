import { test, expect } from '@playwright/test'
import { dragAndDropFile } from './dragAndDropFile'

test('uploading documents should result in the correct totals', async ({
  page,
}) => {
  await page.goto('/')

  const dropLocator = await page.getByText('Drop documents here')

  await dragAndDropFile(
    page,
    dropLocator,
    './src/receipts/bank.pdf',
    'bank.pdf',
  )

  await dragAndDropFile(
    page,
    dropLocator,
    './src/receipts/invoice.pdf',
    'invoice.pdf',
  )

  const bankRow = page.locator('tr:has-text("Bank 1") td:last-child')

  await expect(bankRow).toHaveText('206,720')

  const invoicedRow = page.locator('tr:has-text("Invoiced") td:last-child')

  await expect(invoicedRow).toHaveText('-165,480')
})
