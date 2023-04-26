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
import pLimit from 'p-limit'
import type { PlasmoCSConfig } from 'plasmo'
import { useEffect, useState } from 'react'

import { sendToBackground } from '@plasmohq/messaging'

import type { RequestBody, ResponseBody } from '../background/messages/download'

export const config: PlasmoCSConfig = {
  matches: ['https://apps.seb.se/ccs/ibf/*'],
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

// downloading too many in parallel seems to cause the server to error out
const limit = pLimit(5)

/*
  This API is called from the Kundservice > Dokument & avtal page.
  You need to first visit "Internetbanken företag" before it works — logging in alone won't do it
 */
const API_BASE_URL =
  'https://ibf.apps.seb.se/dsc/digitaldocuments-corporate/digitaldocuments'

type Document = {
  document_key: string
  title: string
  effective_date: string
}

export type Download = {
  url: string
  filename: string
}

// used as a check in case the results get paginated
const FIRST_INVOICE_DATE = '2021-12-07'

export default function Seb() {
  const [downloads, setDownloads] = useState<Download[]>()
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let ignore = false

    const fetchDownloads = async () => {
      const response = await fetch(API_BASE_URL, { credentials: 'include' })

      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }

      const documents = (await response.json()) as Document[]

      if (!documents.length) {
        throw new Error('No invoices found')
      }

      if (
        documents[documents.length - 1].effective_date !== FIRST_INVOICE_DATE
      ) {
        throw new Error(
          'The earliest invoice found does not match the known earliest invoice',
        )
      }

      if (!ignore) {
        setDownloads(
          documents
            .filter(({ title }) => title === 'Faktura')
            .map((document) => ({
              url: `${API_BASE_URL}/pdf/${document.document_key}`,
              filename: `bookkeeping/seb/seb-${document.effective_date}.pdf`,
            })),
        )
      }
    }

    fetchDownloads().catch((error) => {
      setError(error.message)
    })
  }, [])

  const onClick = async () => {
    setIsDownloading(true)

    const uploadFiles = await Promise.all(
      downloads.map((download) =>
        limit(async () => {
          const response = await fetch(download.url, { credentials: 'include' })
          const buffer = await response.arrayBuffer()
          const data = Buffer.from(buffer).toString('base64')
          return {
            data,
            extension: 'pdf',
          }
        }),
      ),
    )

    const response = await sendToBackground<RequestBody, ResponseBody>({
      name: 'download',
      body: {
        uploadFiles,
      },
    })

    setIsDownloading(false)

    console.log(response)
  }

  return (
    <div className="fixed bottom-4 right-4 w-64 h-32 font-sans rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-4">
      {!downloads && 'Attempting to fetch invoices...'}
      {error && 'Failed to fetch invoices'}
      {downloads && (
        <button
          type="button"
          className="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onClick}
          disabled={isDownloading}
        >
          Download {downloads.length} invoices
        </button>
      )}
    </div>
  )
}
