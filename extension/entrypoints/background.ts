import {
  getContentDispositionFilename,
  responseToBase64,
} from '@/components/utils.ts'
import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'

export type UploadFile = {
  filename: string
  data: string
}

export type Transactions = Record<string, string>[]

export type DownloadFile = {
  url: string
  filename?: string
}

export type RequestFiles = {
  type: 'files'
  uploadFiles: UploadFile[]
}

export type RequestFileUrls = {
  type: 'fileUrls'
  downloads: DownloadFile[]
}

export type RequestTransactions = {
  type: 'transactions'
  transactions: Transactions
}

export type BackgroundResponse = { created: number } | { error: string }

async function handleFiles(body: RequestFiles): Promise<BackgroundResponse> {
  const { uploadFiles } = body

  const response = await fetch('http://localhost:3000/api/documents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(uploadFiles),
  })

  if (!response.ok) {
    return { error: `${response.status} ${response.statusText}` }
  }

  const json = await response.json()
  return { created: Array.isArray(json) ? json.length : 0 }
}

async function handleFileUrls(
  body: RequestFileUrls,
): Promise<BackgroundResponse> {
  const uploadFiles = await Promise.all(
    body.downloads.map(async (download) => {
      const response = await fetch(download.url)

      if (!response.ok) {
        throw new Error(
          `Failed to download ${download.url}: ${response.status} ${response.statusText}`,
        )
      }

      const filename =
        getContentDispositionFilename(response) ?? download.filename

      if (!filename) {
        throw new Error('Missing filename')
      }

      return {
        filename,
        data: await responseToBase64(response),
      }
    }),
  )

  return handleFiles({ type: 'files', uploadFiles })
}

async function handleTransactions(
  body: RequestTransactions,
): Promise<BackgroundResponse> {
  const { transactions } = body

  const response = await fetch('http://localhost:3000/api/transactions', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactions),
  })

  if (!response.ok) {
    return { error: `${response.status} ${response.statusText}` }
  }

  const json = await response.json()
  return { created: Array.isArray(json) ? json.length : 0 }
}

export default defineBackground(() => {
  /*
    returning a Promise doesn't work in Chrome due to a bug:
    https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#sending_an_asynchronous_response_using_a_promise
   */
  browser.runtime.onMessage.addListener(
    (
      message: RequestFiles | RequestFileUrls | RequestTransactions,
      _,
      sendResponse,
    ) => {
      if (message.type === 'files') {
        handleFiles(message).then(sendResponse)
      } else if (message.type === 'fileUrls') {
        handleFileUrls(message)
          .then(sendResponse)
          .catch((error) => {
            console.error(error)
            sendResponse({ error: 'Failed to download files' })
          })
      } else if (message.type === 'transactions') {
        handleTransactions(message).then(sendResponse)
      } else {
        sendResponse({ error: `Message not recognized` })
      }

      return true
    },
  )
})
