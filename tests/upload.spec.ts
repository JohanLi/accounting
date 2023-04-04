import { test, expect } from '@playwright/test'

test('uploading documents should result in the correct totals', async ({
  page,
}) => {
  await page.goto('/')

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByText('Drag and drop').click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles([
    './src/receipts/bank.pdf',
    './src/receipts/invoice.pdf',
  ])

  const bankRow = page.locator('tr:has-text("Bank 1") td:last-child')

  await expect(bankRow).toHaveText('206,720')

  const invoicedRow = page.locator('tr:has-text("Invoiced") td:last-child')

  await expect(invoicedRow).toHaveText('-165,480')
})
