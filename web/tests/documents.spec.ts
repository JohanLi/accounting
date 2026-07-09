import { expect, test } from '@playwright/test'

import {
  expectSuggestion,
  sendDocuments,
  sendTransactions,
  truncateDb,
} from './utils'

/*
  Gotcha: if a test fails, afterAll() is actually run before the next test starts.
  This means later tests shouldn't rely on data being there from previous tests.
  https://playwright.dev/docs/test-retries#failures
 */
test.afterAll(() => {
  truncateDb()
})

test('when known documents are received, a suggestion is created', async ({
  page,
  request,
}) => {
  await sendDocuments(
    ['bank.pdf', 'invoice.pdf', 'mobileProvider.pdf'],
    request,
  )

  await sendTransactions(
    [
      {
        outgoingAmount: '-130.000',
        outgoingCurrency: 'SEK',
        id: 'something1',
        bookedDate: '2023-04-03',
        valueDate: '2023-04-03',
        text: '12345',
        availableBalance: '-130.000',
        type: 'bankRegular',
      },
      {
        outgoingAmount: '-374.000',
        outgoingCurrency: 'SEK',
        id: 'something2',
        bookedDate: '2025-01-31',
        valueDate: '2025-01-31',
        text: 'TRE SVERIGE',
        availableBalance: '-504.000',
        type: 'bankRegular',
      },
    ],
    request,
  )

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
      date: '2025-01-31',
      description: 'Recognized document – Tre företagsabonnemang',
      transactions: [
        ['2640', '75'],
        ['6212', '299'],
        ['1930', '-374'],
      ],
    },
    1,
  )

  await expectSuggestion(
    page,
    {
      date: '2026-04-30',
      description: 'Recognized document – Inkomst kundfordran',
      transactions: [
        ['1510', '205 000'],
        ['2610', '-41 000'],
        ['3011', '-164 000'],
      ],
    },
    2,
  )
})

test("when receiving a document that already exists, a new one isn't created", async ({
  request,
}) => {
  await sendDocuments(['invoice.pdf'], request)

  const response = await sendDocuments(['invoice.pdf'], request)
  expect(response.ok()).toBe(true)
  const data = await response.json()

  expect(data).toEqual([])
})

test('loading documents both as a PDF and as extracted strings', async ({
  request,
}) => {
  let response = await sendDocuments(['chatgpt.pdf'], request)

  expect(response.ok()).toBe(true)
  const data = await response.json()

  const id = data[0].id

  response = await request.get(`/api/documents?id=${id}`)
  expect(response.headers()['content-type']).toEqual('application/pdf')

  response = await request.get(`/api/documents?id=${id}&viewLines=true`)
  expect(response.headers()['content-type']).toEqual('text/plain;charset=UTF-8')
})
