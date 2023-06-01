/*
  Tre offers a direct link to a dedicated invoice page.
  The default naming of invoices contains a random ID.

  Their UI contains invoice IDs that, through GraphQL, gets mapped to an API.
 */

import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'

import Download from '../download'

export const config: PlasmoCSConfig = {
  matches: ['https://www.tre.se/mitt3/fakturor'],
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

type Document = {
  accountNumber: string
  invoiceNumber: string
  issueDate: string
}

export type Download = {
  url: string
  filename: string
}

async function getDownloads() {
  const nextData = document
    .getElementById('__NEXT_DATA__')
    ?.textContent?.trim()

  if (!nextData) {
    throw new Error('Was not able to get __NEXT_DATA__')
  }

  const { apolloState } = JSON.parse(nextData).props

  if (!apolloState) {
    throw new Error('Was not able to get apolloState')
  }

  return (Object.values(apolloState) as Document[])
    .filter((value: any) => value['__typename'] === 'My3Invoice')
    .map((value) => ({
      url: `https://www.tre.se/t/api/invoices/my3/api/v1/accounts/${value.accountNumber}/invoices/${value.invoiceNumber}/document?errorCallback=/mitt3/fakturor`,
      filename: `bookkeeping/tre/tre-${new Date(
        Number(value.issueDate),
      ).toLocaleDateString('sv-SE')}.pdf`,
    }))
}

export default function Tre() {
  return <Download getDownloads={getDownloads} requestInit={{ credentials: 'include' }} />
}
