import DownloadTransactions from '@/components/downloadTransactions.tsx'
import '@/components/tailwind.css'
import ReactDOM from 'react-dom/client'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import { defineContentScript } from 'wxt/utils/define-content-script'

export default defineContentScript({
  matches: ['https://secure.collector.se/savings/details/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'download-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const app = document.createElement('div')
        container.append(app)

        const root = ReactDOM.createRoot(app)
        root.render(<DownloadTransactions getDownloads={getDownloads} />)
        return root
      },
      onRemove: (root) => {
        root?.unmount()
      },
    })

    ui.mount()
  },
})

const accountId = import.meta.env.VITE_COLLECTOR_ACCOUNT_ID
const customerId = import.meta.env.VITE_COLLECTOR_CUSTOMER_ID

if (!accountId) {
  throw new Error('Missing VITE_COLLECTOR_ACCOUNT_ID')
}

if (!customerId) {
  throw new Error('Missing VITE_COLLECTOR_CUSTOMER_ID')
}

const API_URL = `https://secure.collector.se/savingsapi/accounts/${accountId}?customerId=${customerId}`

async function getDownloads() {
  const response = await fetch(API_URL, { credentials: 'include' })

  if (!response.ok) {
    throw new Error('Failed to download Collector transactions')
  }

  return (await response.json()).transactions.map((transaction: any) => ({
    ...transaction,
    type: 'bankSavings2',
  }))
}
