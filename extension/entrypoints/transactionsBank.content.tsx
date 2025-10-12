import ReactDOM from 'react-dom/client'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import { defineContentScript } from 'wxt/utils/define-content-script'

import DownloadTransactions from '../components/downloadTransactions.tsx'
import '../components/tailwind.css'
import { COMPANY_START_DATE, getTomorrow } from '../components/utils.ts'

export default defineContentScript({
  matches: ['https://apps.seb.se/ccs/accounts/accounts-and-balances/*'],
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
  'https://apps.seb.se/ssc/accounts-web-service-corporate/search-transactions'

/*
 Having these in public should not matter, but I wouldn't be surprised if
 there's some "Broken Access Control" going on for an endpoint like this.
 */
const regularAccountId = import.meta.env.VITE_SEB_REGULAR_ACCOUNT_ID
const savingsAccountId = import.meta.env.VITE_SEB_SAVINGS_ACCOUNT_ID

if (!regularAccountId) {
  throw new Error('Missing VITE_SEB_REGULAR_ACCOUNT_ID')
}

if (!savingsAccountId) {
  throw new Error('Missing VITE_SEB_SAVINGS_ACCOUNT_ID')
}

/*
 SEB appears to add four digits to the end of your organization id.
 Since I don't know what they're for, I've not included it in version control.
 */
const organizationId = import.meta.env.VITE_SEB_ORGANIZATION_ID

if (!organizationId) {
  throw new Error('Missing VITE_SEB_ORGANIZATION_ID')
}

async function getDownloads() {
  const response = await fetch(API_BASE_URL, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'organization-id': organizationId,
    },
    body: JSON.stringify({
      accountIds: [regularAccountId, savingsAccountId],
      dateFrom: COMPANY_START_DATE,
      dateTo: getTomorrow(),
      paginatingSize: 500,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to download bank transactions')
  }

  return (await response.json()).transactions.map((transaction: any) => {
    if (transaction.accountId === regularAccountId) {
      transaction.type = 'bankRegular'
    } else if (transaction.accountId === savingsAccountId) {
      transaction.type = 'bankSavings'
    } else {
      throw new Error(
        `One of the transactions has an unknown account id: ${JSON.stringify(
          transaction,
          null,
          2,
        )}`,
      )
    }

    return transaction
  })
}
