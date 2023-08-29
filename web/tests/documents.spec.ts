import { test, expect } from '@playwright/test'
import { dragAndDropFile, getBase64 } from './utils'
import { DocumentUpload } from '../src/pages/api/documents'

// TODO figure out how to make these tests isolated
test.describe.serial('upload', () => {
  test.skip('uploading documents should result in the correct totals', async ({
    page,
  }) => {
    await page.goto('/')

    const dropLocator = await page.getByText('Drop documents here')

    await dragAndDropFile(
      page,
      dropLocator,
      './src/documents/bank.pdf',
      'bank.pdf',
    )

    await dragAndDropFile(
      page,
      dropLocator,
      './src/documents/invoice.pdf',
      'invoice.pdf',
    )

    const bankRow = page.locator('tr:has-text("Bank 1") td:last-child')

    await expect(bankRow).toHaveText('206 720')

    const invoicedRow = page.locator('tr:has-text("Invoiced") td:last-child')

    await expect(invoicedRow).toHaveText('−165 480')
  })

  test.skip('nothing should happen when uploading a document that already exists', async ({
    request,
  }) => {
    const uploadFile: DocumentUpload = {
      filename: '',
      data: await getBase64('./src/documents/skiing.pdf'),
    }

    let response = await request.post(`/api/documents`, {
      data: [uploadFile],
    })

    expect((await response.json()).length).toEqual(1)

    response = await request.post(`/api/documents`, {
      data: [uploadFile],
    })

    expect((await response.json()).length).toEqual(0)
  })

  // TODO should also verify that nothing should be created if this happens
  test.skip('uploading two or more identical documents at the same time should fail', async ({
    request,
  }) => {
    const uploadFile: DocumentUpload = {
      filename: '',
      data: await getBase64('./src/documents/mobile.pdf'),
    }

    let response = await request.post(`/api/documents`, {
      data: [uploadFile, uploadFile],
    })

    expect(response.status()).toEqual(500)
  })
})
