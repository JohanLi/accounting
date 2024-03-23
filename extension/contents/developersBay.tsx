import cssText from 'data-text:./style.css'
import pLimit from 'p-limit'
import type { PlasmoCSConfig } from 'plasmo'
import Download from '../download'

/*
  In the beginning of 2024, they updated their platform and also made changes to invoices. They are now no longer
  directly behind an API and generated server-side. Instead, their data is returned from a GraphQL endpoint, and
  it is your client that generates the PDF using @react-pdf/renderer.

  A major issue is that a lot of text inside those PDFs appear OK, but when you copy and paste names, dates and values,
  they appear strange. This seems to be a bug in the library they use when custom fonts are used
  (https://github.com/diegomura/react-pdf/pull/2408).

  I've notified Developers Bay about this. If this isn't fixed, a solution is to have this
  extension redirect all the *.ttf requests so a different font is loaded. This can be done using
  declarative_net_request and "action" : { "type": "redirect", "redirect": { "" } }
 */

export const config: PlasmoCSConfig = {
  matches: ['https://box.developersbay.se/*'],
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

type Document = {
  id: string
  invoice_date: string
}

const API_LIST_INVOICES_URL =
  'https://api.box.developersbay.se/api/invoices/user/5267'

// used as a check in case the results get paginated
const FIRST_INVOICE_DATE = '2022-05-31'

const requestInit = {
  headers: {
    authorization: `Bearer ${localStorage.getItem('id_token')}`,
  },
}

const limit = pLimit(1)

async function getPdfUrl(id: string) {
  /*
    There seems to be a major flaw in this API. If you send multiple requests
    in parallel, there is a chance you'll get the same response (ID and S3 URL)
    for different invoice IDs.

    You'll miss an invoice in the event that a response is a duplicate.
    A workaround is to make the requests in series.
 */
  const urlResponse = await limit(() => fetch(`https://api.box.developersbay.se/api/invoices/${id}/pdf`, requestInit))

  if (!urlResponse.ok) {
    throw new Error('Failed to get PDF URL for invoice')
  }

  return (await urlResponse.json()).path as string
}

async function getDownloads() {
  const response = await fetch(API_LIST_INVOICES_URL, requestInit)

  if (!response.ok) {
    throw new Error('Failed to fetch invoices')
  }

  const documents = (await response.json()) as Document[]

  if (!documents.length) {
    throw new Error('No invoices found')
  }

  if (documents[documents.length - 1].invoice_date !== FIRST_INVOICE_DATE) {
    throw new Error(
      'The earliest invoice found does not match the known earliest invoice',
    )
  }

  return Promise.all(documents.map(async (document) => ({
    url: await getPdfUrl(document.id),
    filename: `bookkeeping/developersbay/developersbay-${document.invoice_date}.pdf`,
  })))
}

export default function DevelopersBay() {
  return <Download getDownloads={getDownloads} />
}
