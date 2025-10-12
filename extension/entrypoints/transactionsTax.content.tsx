/*
  This will likely get replaced by Skatteverket's official API – application pending
 */
import ReactDOM from 'react-dom/client'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import { defineContentScript } from 'wxt/utils/define-content-script'

import DownloadTransactions from '../components/downloadTransactions.tsx'
import '../components/tailwind.css'

export default defineContentScript({
  matches: ['https://sso.skatteverket.se/sk/ska/*'],
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

const API_BASE_URL = 'https://sso.skatteverket.se/sk/ska/hamtaBokfTrans.do'

const COMPANY_START_DATE = '201001'

function getYesterday() {
  const currentDate = new Date()

  currentDate.setDate(currentDate.getDate() - 1)

  const year = currentDate.getFullYear() % 100
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

async function getDownloads() {
  const response = await fetch(API_BASE_URL, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      valdGruppTrans: '1',
      valdDatFromInString: COMPANY_START_DATE,
      /*
        Setting this to the future will cause the page to show an error message (albeit still 200) instead of the transactions
        It also appears like you need to wait until after 3 AM before you can send in the current date.
       */
      valdDatTomInString: getYesterday(),
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to download tax transactions')
  }

  const contentType = response.headers.get('content-type')

  if (!contentType || !contentType.includes('charset=ISO-8859-1')) {
    throw new Error('Unexpected content-type')
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  const utf8 = new TextDecoder('iso-8859-1').decode(bytes)

  const parser = new DOMParser()
  const document = parser.parseFromString(utf8, 'text/html')
  const table = document.getElementById('bokf_trans_sort')

  if (!table) {
    throw new Error('Table containing transactions not found')
  }

  const rows = table.getElementsByTagName('tr')

  const transactions = []

  /*
    the following rows are skipped because they don't follow the same format as the rest and their values are redundant:
    1st: header
    2nd: ingående saldo
    last: utgående saldo
   */
  for (let i = 2; i < rows.length - 1; i++) {
    const row = rows[i]

    const dateCell = row.cells[0].querySelector('.hidden-xs')

    if (!dateCell) {
      throw new Error('Table cell containing date not found')
    }

    transactions.push({
      date: dateCell.textContent.trim(),
      description: row.cells[1].textContent.trim(),
      amount: row.cells[2].textContent.trim().replace(/\s/g, ''),
      balance: row.cells[4].textContent.trim().replace(/\s/g, ''),
    })
  }

  const { date, description } = transactions[0]
  const firstTransaction =
    date === '2021-07-12' && description === 'Debiterad preliminärskatt'

  if (!firstTransaction) {
    throw new Error(
      `Either you've forgotten to switch to the company account, or the transactions have been paginated`,
    )
  }

  return transactions
}
