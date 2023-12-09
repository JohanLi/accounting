import { test } from '@playwright/test'
import { getCurrentFiscalYear } from '../src/utils'
import { expectEntry } from './utils'

test.describe('journal entries', () => {
  test('creating and editing', async ({ page }) => {
    // the current fiscal year is selected by default
    const date = `${getCurrentFiscalYear()}-06-01`
    const description = 'A purchased ticket'
    const amount = '1234'

    const creditAccountId = '1930'
    const debitAccountId = '5810'

    await page.goto('/')

    await page.getByRole('button', { name: 'Create blank' }).click()

    const journalEntryForm = page.getByTestId('journalEntryForm').nth(0)

    await journalEntryForm.getByLabel('Date').fill(date)
    await journalEntryForm.getByLabel('Description').fill(description)
    await journalEntryForm.getByLabel('Amount').fill(amount)

    await journalEntryForm.getByLabel('0.06').click()

    const transactions = (i: number) =>
      journalEntryForm.getByTestId('transaction').nth(i)
    await transactions(0).fill(creditAccountId)
    await transactions(1).fill(debitAccountId)

    await journalEntryForm.getByRole('button', { name: 'Submit' }).click()

    await expectEntry(page, {
      date,
      description,
      transactions: [
        [creditAccountId, '-1 234'],
        [debitAccountId, '1 164'],
        ['2640', '70'],
      ],
    })

    const row = page.locator('table tbody').locator('tr').nth(0)

    await row.getByRole('button', { name: 'Edit' }).click()

    const editedDate = `${getCurrentFiscalYear()}-06-30`
    const editedDescription = 'An invoice, updated'

    await row.getByLabel('Date').fill(editedDate)
    await row.getByLabel('Description').fill(editedDescription)

    const transactionInputs = (i: number) =>
      row.getByTestId('transaction').locator('input').nth(i)

    await transactionInputs(0).fill('3011')
    await transactionInputs(1).fill('-8000')

    await transactionInputs(2).fill('2610')
    await transactionInputs(3).fill('-2000')

    await transactionInputs(4).fill('1930')
    await transactionInputs(5).fill('10000')

    await row.getByRole('button', { name: 'Submit' }).click()

    await expectEntry(page, {
      date: editedDate,
      description: editedDescription,
      transactions: [
        ['3011', '-8 000'],
        ['2610', '-2 000'],
        ['1930', '10 000'],
      ],
    })
  })
})
