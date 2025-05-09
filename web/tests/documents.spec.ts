import { expect, test } from '@playwright/test'

import { dragAndDropDocuments, expectSuggestion } from './utils'

test('for each uploaded document, a suggestion is created', async ({
  page,
}) => {
  await page.goto('/')

  await dragAndDropDocuments(page, ['bank.pdf', 'invoice.pdf'])

  await expect(page.getByText('Uploaded 2 new document(s)')).toBeVisible()

  await expectSuggestion(
    page,
    {
      date: '2023-04-03',
      description: 'Recognized document – SEB månadsavgift',
      transactions: [
        ['6570', '130'],
        ['1930', '-130'],
      ],
    },
    0,
  )

  await expectSuggestion(
    page,
    {
      date: '2023-01-14',
      description: 'Recognized document – Inkomst',
      transactions: [
        ['1930', '206 850'],
        ['3011', '-165 480'],
        ['2610', '-41 370'],
      ],
    },
    1,
  )
})

test('after uploading a document that already exists, no suggestion should be created', async ({
  page,
}) => {
  await page.goto('/')

  await dragAndDropDocuments(page, ['mobile.pdf'])

  await expect(page.getByText('Uploaded 1 new document(s)')).toBeVisible()

  await dragAndDropDocuments(page, ['mobile.pdf'])

  await expect(page.getByText('Uploaded 0 new document(s)')).toBeVisible()
})

test('loading documents both as a PDF and as extracted strings', async ({
  request,
}) => {
  let response = await request.get('/api/documents?id=1')
  expect(response.headers()['content-type']).toEqual('application/pdf')

  response = await request.get('/api/documents?id=1&viewStrings=true')
  expect(response.headers()['content-type']).toEqual('text/plain;charset=UTF-8')
})
