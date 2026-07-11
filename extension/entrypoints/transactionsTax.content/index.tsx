import DownloadTransactions from '@/components/downloadTransactions.tsx'
import '@/components/tailwind.css'
import { COMPANY_START_DATE } from '@/components/utils.ts'
import ReactDOM from 'react-dom/client'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import { defineContentScript } from 'wxt/utils/define-content-script'

export default defineContentScript({
  matches: ['https://www7.skatteverket.se/portal/skattekonto'],
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

const API_BASE_URL =
  'https://wapi.skatteverket.se/secure/skattekonto/etjanst/v1/bokfordaTransaktioner/hamta'

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return atMidnight(`${year}-${month}-${day}`)
}

function atMidnight(date: string) {
  return `${date}T00:00:00`
}

const organizationId = import.meta.env.VITE_SKATTEVERKET_ORGANIZATION_ID

if (!organizationId) {
  throw new Error('Missing VITE_SKATTEVERKET_ORGANIZATION_ID')
}

async function getDownloads() {
  const response = await fetch(API_BASE_URL, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'content-type': 'application/json; v=2',
      'x-agw-omfragad': organizationId,
    },
    body: JSON.stringify({
      idPers: organizationId,
      kodGruppTrans: '1',
      datFrom: atMidnight(COMPANY_START_DATE),
      datTom: formatDate(new Date()),
      typFgKontoutdrag: '',
      visaRadioknappar: 'J',
      sprak: 'sv',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to download tax transactions')
  }

  const json = await response.json()

  const transactions = json.transrader
    .filter((transaction: any) => transaction.datTrans)
    .map((transaction: any) => ({
      date: transaction.datTrans.slice(0, 10),
      description: transaction.transradText,
      amount: String(transaction.belSkm),
      balance: String(transaction.radsaldoSkm),
    }))

  const expectedFirstTransaction = {
    date: '2021-07-12',
    description: 'Debiterad preliminärskatt',
    amount: '-17120',
    balance: '-17120',
  }

  const firstTransaction = transactions[0]

  if (
    !firstTransaction ||
    Object.entries(expectedFirstTransaction).some(
      ([key, value]) => firstTransaction[key] !== value,
    )
  ) {
    // in the event that pagination happens, I'll move the "start date" and update the expected transaction
    throw new Error(
      `Either you've forgotten to switch to the company account, or the transactions have been paginated`,
    )
  }

  return transactions
}
