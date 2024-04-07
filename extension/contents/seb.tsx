/*
  My business bank (SEB) charges a monthly fee. The invoices:
    - are located in an obscure section of the website
    - not straightforward to get the invoice for month X
    - have long, meaningless filenames
    - each take 3 seconds to generate, every time, even though they produce the same PDF files

  Ideally: a button press downloads all invoices and gives each PDF file a
  good name.

  Invoices are found in Kundservice > Dokument & avtal
 */

import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'

import Download from '../download'
import { COMPANY_START_DATE, getTomorrow } from '../utils'

export const config: PlasmoCSConfig = {
  matches: ['https://apps.seb.se/ccs/ibf/*'],
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

type Document = {
  document_key: string
  title: string
  effective_date: string
}

/*
  This API is called from the Kundservice > Dokument & avtal page.
  You need to first visit "Internetbanken företag" before it works — logging in alone won't do it
 */
const API_BASE_URL =
  'https://ibf.apps.seb.se/dsc/digitaldocuments-corporate/digitaldocuments'

// used as a check in case the results get paginated
const FIRST_INVOICE_DATE = '2021-12-07'

async function getDownloads() {
  const response = await fetch(
    `${API_BASE_URL}?from_date=${COMPANY_START_DATE}&to_date=${getTomorrow()}`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch invoices')
  }

  const documents = (await response.json()) as Document[]

  if (!documents.length) {
    throw new Error('No invoices found')
  }

  if (documents[documents.length - 1].effective_date !== FIRST_INVOICE_DATE) {
    throw new Error(
      'The earliest invoice found does not match the known earliest invoice',
    )
  }

  return documents
    .filter(({ title }) => title === 'Faktura')
    .map((document) => ({
      url: `${API_BASE_URL}/pdf/${document.document_key}`,
      filename: `bookkeeping/seb/seb-${document.effective_date}.pdf`,
    }))
}

export default function Seb() {
  return (
    <Download
      getDownloads={getDownloads}
      requestInit={{ credentials: 'include' }}
    />
  )
}
