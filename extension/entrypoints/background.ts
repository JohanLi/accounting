import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'

export type UploadFile = {
  data: string
}

export type Transactions = Record<string, string>[]

export type RequestFiles = {
  type: 'files'
  uploadFiles: UploadFile[]
}

export type RequestTransactions = {
  type: 'transactions'
  transactions: Transactions
}

export type Response = { created: number } | { error: string }

async function handleFiles(body: RequestFiles): Promise<Response> {
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

async function handleTransactions(
  body: RequestTransactions,
): Promise<Response> {
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
    (message: RequestFiles | RequestTransactions, _, sendResponse) => {
      if (message.type === 'files') {
        handleFiles(message).then(sendResponse)
      } else if (message.type === 'transactions') {
        handleTransactions(message).then(sendResponse)
      } else {
        sendResponse({ error: `Message not recognized` })
      }

      return true
    },
  )
})
