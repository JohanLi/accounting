import { Page, expect, test } from '@playwright/test'

function expectIncomeThisYear(page: Page, value: string) {
  return expect(
    page.locator('h2').filter({ hasText: 'Income this year' }),
  ).toHaveText(`Income this year${value}`)
}

test.describe('salary', () => {
  test('adding entries', async ({ page }) => {
    await page.goto('/salary')

    await page.getByLabel('Amount').fill('50000')

    await page.getByRole('button', { name: 'Submit' }).click()

    await expectIncomeThisYear(page, '50 000')

    await page.getByLabel('Amount').fill('100000')

    await page.getByRole('button', { name: 'Submit' }).click()

    await expectIncomeThisYear(page, '150 000')
  })

  test('show a message if the limit is reached', async ({ page }) => {
    await page.goto('/salary')

    const placeholder =
      (await page.getByLabel('Amount').getAttribute('placeholder')) || ''

    await page.getByLabel('Amount').fill(placeholder.replace('max ', ''))

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(
      page.getByText('You have reached the annual salary limit'),
    ).toBeVisible()
  })

  test('able to see other fiscal years', async ({ page }) => {
    await page.goto('/salary')

    await page.getByLabel('Year').click()

    const lastYear = new Date().getFullYear() - 1

    await page.getByRole('menuitem', { name: lastYear.toString() }).click()

    await expectIncomeThisYear(page, '0')
  })
})
