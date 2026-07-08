import ReactDOM from 'react-dom/client'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import { defineContentScript } from 'wxt/utils/define-content-script'

import Download, { type DownloadType } from '../../components/download.tsx'
import '../../components/tailwind.css'

export { CHATGPT_HOST_PERMISSIONS } from './permissions.ts'

export default defineContentScript({
  matches: ['https://chatgpt.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    if (
      window.location.pathname !== '/' ||
      window.location.hash !== '#settings/Billing'
    ) {
      return
    }

    const ui = await createShadowRootUi(ctx, {
      name: 'download-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const app = document.createElement('div')
        container.append(app)

        const root = ReactDOM.createRoot(app)
        root.render(
          <Download downloadInBackground getDownloads={getDownloads} />,
        )
        return root
      },
      onRemove: (root) => {
        root?.unmount()
      },
    })

    ui.mount()
  },
})

type ChatGptInvoice = {
  invoice_pdf?: string
}

type ChatGptInvoicesResponse = {
  data?: ChatGptInvoice[]
}

type ChatGptSessionResponse = {
  accessToken?: string
}

const API_BASE_URL = 'https://chatgpt.com/backend-api/invoices'
const SESSION_URL = 'https://chatgpt.com/api/auth/session'
const LIMIT = '12'

const accountId = import.meta.env.VITE_CHATGPT_ACCOUNT_ID

if (!accountId) {
  throw new Error('Missing VITE_CHATGPT_ACCOUNT_ID')
}

async function getDownloads(): Promise<DownloadType[]> {
  const accessToken = await getAccessToken()
  const params = new URLSearchParams({
    limit: LIMIT,
    account_id: accountId,
  })

  const response = await fetch(`${API_BASE_URL}?${params}`, {
    credentials: 'include',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch ChatGPT invoices')
  }

  const json = (await response.json()) as ChatGptInvoicesResponse

  if (!Array.isArray(json.data)) {
    throw new Error('ChatGPT invoices response did not contain a data array')
  }

  const downloads = json.data
    .filter(
      (invoice): invoice is { invoice_pdf: string } =>
        typeof invoice.invoice_pdf === 'string',
    )
    .map((invoice) => ({
      url: invoice.invoice_pdf,
    }))

  if (!downloads.length) {
    throw new Error('No ChatGPT invoice PDFs found')
  }

  return downloads
}

async function getAccessToken() {
  const response = await fetch(SESSION_URL, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch ChatGPT session')
  }

  const json = (await response.json()) as ChatGptSessionResponse

  if (!json.accessToken) {
    throw new Error('ChatGPT session response did not contain an access token')
  }

  return json.accessToken
}
