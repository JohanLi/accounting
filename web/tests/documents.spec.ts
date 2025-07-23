import { expect, test } from '@playwright/test'

import { sendDocuments, expectSuggestion } from './utils'

test('when known documents are received, a suggestion is created', async ({
  page,
  request,
}) => {
  await sendDocuments(['bank.pdf', 'invoice.pdf', 'mobileProvider.pdf'], request)

  await page.goto('/')

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
      date: '2022-11-30',
      description: 'Recognized document – Inkomst kundfordran',
      transactions: [
        ['1510', '206 850'],
        ['3011', '-165 480'],
        ['2610', '-41 370'],
      ],
    },
    1,
  )

  await expectSuggestion(
    page,
    {
      date: '2025-01-31',
      description: 'Recognized document – Tre företagsabonnemang',
      transactions: [
        ['6212', '299'],
        ['1930', '-374'],
        ['2640', '75'],
      ],
    },
    2,
  )
})

test("when receiving a document that already exists, a new one isn't created", async ({
  request,
}) => {
  const response = await sendDocuments(['invoice.pdf'], request)
  expect(response.ok()).toBe(true);
  const data = await response.json();

  expect(data).toEqual([]);
})

test('loading documents both as a PDF and as extracted strings', async ({
  request,
}) => {
  let response = await request.get('/api/documents?id=1')
  expect(response.headers()['content-type']).toEqual('application/pdf')

  response = await request.get('/api/documents?id=1&viewStrings=true')
  expect(response.headers()['content-type']).toEqual('text/plain;charset=UTF-8')
})
