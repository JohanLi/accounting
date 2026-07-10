import pLimit from 'p-limit'
import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'

export type Transactions = Record<string, string>[]

export type DocumentDownload = {
  url: string
}

export type RequestDownloadDocuments = {
  type: 'downloadDocuments'
  downloads: DocumentDownload[]
}

export type RequestUploadTransactions = {
  type: 'uploadTransactions'
  transactions: Transactions
}

export type BackgroundResponse = { created: number } | { error: string }

// Some providers fail when too many documents are requested concurrently.
const limit = pLimit(5)

async function downloadDocuments(
  body: RequestDownloadDocuments,
): Promise<BackgroundResponse> {
  const documents = await Promise.all(
    body.downloads.map((download) =>
      limit(async () => {
        const response = await fetch(download.url, { credentials: 'include' })

        if (!response.ok) {
          throw new Error(
            `Failed to download ${download.url}: ${response.status} ${response.statusText}`,
          )
        }

        return response.blob()
      }),
    ),
  )

  const formData = new FormData()

  for (const document of documents) {
    formData.append('documents', document)
  }

  const response = await fetch('http://localhost:3000/api/documents', {
    method: 'PUT',
    body: formData,
  })

  if (!response.ok) {
    return { error: `${response.status} ${response.statusText}` }
  }

  const json = await response.json()
  return { created: Array.isArray(json) ? json.length : 0 }
}

async function uploadTransactions(
  body: RequestUploadTransactions,
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
      message: RequestDownloadDocuments | RequestUploadTransactions,
      _,
      sendResponse,
    ) => {
      if (message.type === 'downloadDocuments') {
        downloadDocuments(message)
          .then(sendResponse)
          .catch((error) => {
            console.error(error)
            sendResponse({ error: 'Failed to download files' })
          })
      } else if (message.type === 'uploadTransactions') {
        uploadTransactions(message).then(sendResponse)
      } else {
        sendResponse({ error: `Message not recognized` })
      }

      return true
    },
  )
})
