import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'
import { useEffect, useState } from 'react'

import { sendToBackground } from '@plasmohq/messaging'

import type { RequestBody, ResponseBody } from '../background/messages/download'

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

export type Download = {
  url: string
  filename: string
}

const API_LIST_INVOICES_URL =
  'https://api.box.developersbay.se/api/invoices/user/5267'

const getInvoiceUrl = (id: string) => `https://api.box.developersbay.se/api/invoices/${id}/pdf`

// used as a check in case the results get paginated
const FIRST_INVOICE_DATE = '2022-05-31'

export default function DevelopersBay() {
  const [downloads, setDownloads] = useState<Download[]>()
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let ignore = false

    const fetchDownloads = async () => {
      const response = await fetch(API_LIST_INVOICES_URL, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }

      const documents = (await response.json()) as Document[]

      if (!documents.length) {
        throw new Error('No invoices found')
      }

      if (
        documents[documents.length - 1].invoice_date !== FIRST_INVOICE_DATE
      ) {
        throw new Error(
          'The earliest invoice found does not match the known earliest invoice',
        )
      }

      if (!ignore) {
        setDownloads(
          documents
            .map((document) => ({
              url: getInvoiceUrl(document.id),
              filename: `bookkeeping/developersbay/developersbay-${document.invoice_date}.pdf`,
            })),
        )
      }
    }

    fetchDownloads().catch((error) => {
      setError(error.message)
    })

    return () => {
      ignore = true
    }
  }, [])

  const onClick = async () => {
    setIsDownloading(true)

    const uploadFiles = await Promise.all(
      downloads.map(async (document) => {
        const urlResponse = await fetch(document.url, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('id_token')}`
          }
        })

        if (!urlResponse.ok) {
          throw new Error('Failed to fetch invoice')
        }

        const { path: url } = (await urlResponse.json()) as { path: string }

        const fileResponse = await fetch(url)
        const buffer = await fileResponse.arrayBuffer()
        const data = Buffer.from(buffer).toString('base64')
        return {
          data,
          extension: 'pdf',
        }
      })
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
