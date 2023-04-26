/*
  Tre offers a direct link to a dedicated invoice page.
  The default naming of invoices contains a random ID.

  Their UI contains invoice IDs that, through GraphQL, gets mapped to an API.
 */

import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'
import { useEffect, useState } from 'react'

import { sendToBackground } from '@plasmohq/messaging'

import type { RequestBody, ResponseBody } from '../background/messages/download'

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

export default function Tre() {
  const [downloads, setDownloads] = useState<Download[]>()
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
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

    const downloads: Download[] = (Object.values(apolloState) as Document[])
      .filter((value: any) => value['__typename'] === 'My3Invoice')
      .map((value) => ({
        url: `https://www.tre.se/t/api/invoices/my3/api/v1/accounts/${value.accountNumber}/invoices/${value.invoiceNumber}/document?errorCallback=/mitt3/fakturor`,
        filename: `bookkeeping/tre/tre-${new Date(
          Number(value.issueDate),
        ).toLocaleDateString('sv-SE')}.pdf`,
      }))

    setDownloads(downloads)
  }, [])

  const onClick = async () => {
    setIsDownloading(true)

    const uploadFiles = await Promise.all(
      downloads.map(async (download) => {
        const response = await fetch(download.url, { credentials: 'include' })
        const buffer = await response.arrayBuffer()
        const data = Buffer.from(buffer).toString('base64')
        return {
          data,
          extension: 'pdf',
        }
      }),
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
