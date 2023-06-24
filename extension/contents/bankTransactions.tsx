import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'

import DownloadTransactions from '../downloadTransactions'
import { transactionSchema } from 'web/src/pages/api/transactions'

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
const accountIds = process.env.PLASMO_PUBLIC_SEB_ACCOUNT_IDS.split(',')

if (!accountIds.length) {
  throw new Error('Missing PLASMO_PUBLIC_SEB_ACCOUNT_IDS')
}

/*
 SEB appears to add four digits to the end of your organization id.
 Since I don't know what they're for, I've not included it in version control.
 */
const organizationId = process.env.PLASMO_PUBLIC_SEB_ORGANIZATION_ID

if (!organizationId) {
  throw new Error('Missing PLASMO_PUBLIC_SEB_ORGANIZATION_ID')
}

const COMPANY_START_DATE = '2020-10-01'

// by ChatGPT
function getTomorrow() {
  const currentDate = new Date();

  currentDate.setDate(currentDate.getDate() + 1);

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
      accountIds,
      dateFrom: COMPANY_START_DATE,
      dateTo: getTomorrow(),
      paginatingSize: 500,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to download bank transactions')
  }

  return transactionSchema.parse(await response.json()).transactions
}

export default function BankTransactions() {
  return <DownloadTransactions getDownloads={getDownloads} />
}
