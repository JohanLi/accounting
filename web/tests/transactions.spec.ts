import { test, expect, Page } from '@playwright/test'

export async function expectLatestTransaction(
  page: Page,
  {
    date,
    description,
    amount,
    balance,
  }: { date: string; description: string; amount: string; balance: string },
) {
  const row = page.locator('table tbody').locator('tr').nth(0)

  const columns = (i: number) => row.locator('td').nth(i)

  await expect(columns(0)).toHaveText(date)
  await expect(columns(1)).toHaveText(description)
  await expect(columns(2)).toHaveText(amount)
  await expect(columns(3)).toHaveText(balance)
}

test.describe('transactions', () => {
  test('can POST bank and tax transactions', async ({ request }) => {
    const bankRegular = [
      {
        ingoingAmount: '200000.000',
        ingoingCurrency: 'SEK',
        id: 'revenue',
        bookedDate: '2023-12-01',
        valueDate: '2023-12-01',
        text: 'Revenue',
        availableBalance: '200000.000',
        accountId: '1',
        type: 'bankRegular',
      },
      {
        outgoingAmount: '-10000.000',
        outgoingCurrency: 'SEK',
        id: 'somePurchase',
        bookedDate: '2023-12-02',
        valueDate: '2023-12-02',
        text: 'Some purchase',
        availableBalance: '190000.000',
        accountId: '1',
        type: 'bankRegular',
      },
    ]

    const transferToSavings = [
      {
        outgoingAmount: '-100000.000',
        outgoingCurrency: 'SEK',
        id: 'toSavings',
        bookedDate: '2023-12-03',
        valueDate: '2023-12-03',
        text: 'To savings',
        availableBalance: '90000.000',
        accountId: '1',
        type: 'bankRegular',
      },
      {
        ingoingAmount: '100000.000',
        ingoingCurrency: 'SEK',
        id: 'fromRegular',
        bookedDate: '2023-12-03',
        valueDate: '2023-12-03',
        text: 'From regular',
        availableBalance: '100000.000',
        accountId: '1',
        type: 'bankSavings',
      },
    ]

    let response = await request.put(`/api/transactions`, {
      data: [...bankRegular, ...transferToSavings].reverse(),
    })
    expect(response.status()).toEqual(200)

    const tax = [
      {
        amount: '20000',
        balance: '20000',
        date: '2023-11-11',
        description: 'Inbetalning bokförd 231111',
      },
      {
        amount: '-20000',
        balance: '0',
        date: '2023-11-12',
        description: 'Debiterad preliminärskatt',
      },
    ]

    response = await request.put(`/api/transactions`, {
      data: tax,
    })
    expect(response.status()).toEqual(200)
  })

  test('can view bank and tax transactions', async ({ page }) => {
    await page.goto('/transactions')

    await expectLatestTransaction(page, {
      date: '2023-12-03',
      description: 'To savings',
      amount: '-100 000',
      balance: '90 000',
    })

    await page.getByRole('link', { name: 'Sparkonto' }).click()

    await expectLatestTransaction(page, {
      date: '2023-12-03',
      description: 'From regular',
      amount: '100 000',
      balance: '100 000',
    })

    await page.getByRole('link', { name: 'Skattekonto' }).click()

    await expectLatestTransaction(page, {
      date: '2023-11-12',
      description: 'Debiterad preliminärskatt',
      amount: '-20 000',
      balance: '0',
    })
  })
})
