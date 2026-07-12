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
  browser.runtime.onMessage.addListener(
    async (message: RequestDownloadDocuments | RequestUploadTransactions) => {
      try {
        if (message.type === 'downloadDocuments') {
          return await downloadDocuments(message)
        }

        if (message.type === 'uploadTransactions') {
          return await uploadTransactions(message)
        }

        return { error: 'Message not recognized' }
      } catch (error) {
        console.error(error)
        return { error: 'Request failed' }
      }
    },
  )
})
