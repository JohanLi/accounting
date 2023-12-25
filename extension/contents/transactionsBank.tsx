import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'

import DownloadTransactions from '../downloadTransactions'

import { COMPANY_START_DATE, getTomorrow } from '../utils'

export const config: PlasmoCSConfig = {
  matches: ['https://apps.seb.se/ccs/accounts/accounts-and-balances/*'],
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const API_BASE_URL =
  'https://apps.seb.se/ssc/accounts-web-service-corporate/search-transactions'

/*
 Having these in public should not matter, but I wouldn't be surprised if
 there's some "Broken Access Control" going on for an endpoint like this.
 */
const regularAccountId = process.env.PLASMO_PUBLIC_SEB_REGULAR_ACCOUNT_ID
const savingsAccountId = process.env.PLASMO_PUBLIC_SEB_SAVINGS_ACCOUNT_ID

if (!regularAccountId) {
  throw new Error('Missing PLASMO_PUBLIC_SEB_REGULAR_ACCOUNT_ID')
}

if (!savingsAccountId) {
  throw new Error('Missing PLASMO_PUBLIC_SEB_SAVINGS_ACCOUNT_ID')
}

/*
 SEB appears to add four digits to the end of your organization id.
 Since I don't know what they're for, I've not included it in version control.
 */
const organizationId = process.env.PLASMO_PUBLIC_SEB_ORGANIZATION_ID

if (!organizationId) {
  throw new Error('Missing PLASMO_PUBLIC_SEB_ORGANIZATION_ID')
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

  return (await response.json()).transactions.map((transaction) => {
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

export default function TransactionsBank() {
  return <DownloadTransactions getDownloads={getDownloads} />
}
