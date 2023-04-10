/*
  Tre offers a direct link to a dedicated invoice page.
  The default naming of invoices contains a random ID.

  Their UI contains invoice IDs that, through GraphQL, gets mapped to an API.
 */

import { insertClearDownloadsButton } from './common'
import './global.css'
import { Download } from './background';

type Document = {
  accountNumber: string;
  invoiceNumber: string;
  issueDate: string;
}

async function main() {
  const div = document.createElement('div')
  div.className = 'bookkeepingPopup'
  div.textContent = 'Attempting to fetch invoices...\n'
  document.body.prepend(div)

  const nextData = document.getElementById('__NEXT_DATA__')?.textContent?.trim()

  if (!nextData) {
    div.textContent += 'Was not able to get __NEXT_DATA__\n'
    return
  }

  const { apolloState } = JSON.parse(nextData).props

  if (!apolloState) {
    div.textContent += 'Was not able to get apolloState\n'
    return
  }

  const downloads: Download[] = (Object.values(apolloState) as Document[])
    .filter((value: any) => value['__typename'] === 'My3Invoice')
    .map((value) => ({
      url: `https://www.tre.se/t/api/invoices/my3/api/v1/accounts/${value.accountNumber}/invoices/${value.invoiceNumber}/document?errorCallback=/mitt3/fakturor`,
      filename: `bookkeeping/tre/tre-${new Date(Number(value.issueDate)).toLocaleDateString('sv-SE')}.pdf`,
    }))

  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = `Download ${downloads.length} invoices`

  div.appendChild(button)

  button.addEventListener('click', async () => {
    button.remove()
    div.textContent += 'Downloading...\n'

    const response = await chrome.runtime.sendMessage({ downloads })

    if (response.success) {
      div.textContent += 'Downloaded\n'

      insertClearDownloadsButton(div)
    } else {
      div.textContent += 'Failed: one or more files could not be downloaded\n'
    }
  })
}

await main()
