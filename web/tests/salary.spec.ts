import { test, expect } from '@playwright/test'

test.describe('salary', () => {
  test('adding entries', async ({ page }) => {
    await page.goto('/salary')

    await page.getByLabel('Amount').fill('50000')

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('50 000').nth(0)).toBeVisible()

    await page.getByLabel('Amount').fill('100000')

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('150 000').nth(0)).toBeVisible()
  })

  test('notification if limit is reached', async ({ page }) => {
    await page.goto('/salary')

    const placeholder =
      (await page.getByLabel('Amount').getAttribute('placeholder')) || ''

    await page.getByLabel('Amount').fill(placeholder.replace('max ', ''))

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(
      page.getByText('You have reached the annual salary limit'),
    ).toBeVisible()
  })
})
