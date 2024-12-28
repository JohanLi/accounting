'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { DocumentArrowUpIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { DragEvent, useState } from 'react'

import type { DocumentUpload } from '../api/documents/route'
import { getErrorMessage } from '../utils'

function getFilenameAndData(file: File) {
  return new Promise<DocumentUpload>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => {
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
      let data = reader.result as string
      data = data.substring(data.indexOf(',') + 1)

      resolve({ filename: file.name, data })
    }

    reader.onerror = (error) => reject(error)
  })
}

export default function DocumentUpload() {
  const router = useRouter()

  const [isDragOver, setIsDragOver] = useState(false)

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const onDragOver = (e: DragEvent) => {
    // without this, dropping a document will open it in a new tab
    e.preventDefault()
  }

  const onDrop = async (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDragOver(false)

    /*
     Interesting gotcha: https://stackoverflow.com/questions/55658851/javascript-datatransfer-items-not-persisting-through-async-calls

     Another note: working with DataTransferItem, I've often had to check
     its properties and methods. However, any time I command + click to go to
     declaration, the giant 30k LOC lib.dom.d.ts lags my editor.
     */
    const files = await Promise.all(
      [...e.dataTransfer.items].map((item) => {
        /*
          I used to support dragging in nested folders with PDFs in them,
          but it requires a lot of code to support due to a lack of high-level
          APIs. Additionally, I had issues getting webkitGetAsEntry() to work
          in Playwright tests.

          Initially, I envisioned downloading many documents to the file system.
          This is no longer the case – documents go straight to the database.
          Therefore, there's little value in supporting folders at all.
         */
        if (item.type !== 'application/pdf') {
          throw Error('Folders and non-PDF files are not supported')
        }

        const file = item.getAsFile()

        if (!file) {
          throw Error('Error getting file')
        }

        return getFilenameAndData(file)
      }),
    )

    try {
      /*
        Converting this to a Server Action has proven to be challenging, due to this endpoint using pdfjs-dist.
        Since this endpoint needs to exist for the Chrome extension anyway, it's not worth the hassle of figuring
        out the Server Action issues.
       */
      const response = await fetch('/api/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(files),
      })

      const data = await response.json()

      setSuccess(`Uploaded ${data.length} new document(s)`)
      router.refresh()
    } catch (e) {
      setError(getErrorMessage(e))
    }
  }

  const reset = () => {
    setError('')
    setSuccess('')
  }

  /*
   pointer-events: none is used to prevent drag enter and leave events from
   firing on child elements.

   https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
   */
  return (
    <div className="max-w-2xl">
      <div
        className="relative mt-4 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
        onDrop={(e) => onDrop(e).catch((e) => setError(getErrorMessage(e)))}
        onDragOver={onDragOver}
        onDragEnter={() => {
          setIsDragOver(true)
          reset()
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="pointer-events-none">
          {isDragOver && (
            <div className="absolute inset-0 bg-gray-100 opacity-50" />
          )}
          <div className="flex justify-center">
            <div className="text-center">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-300" />
              <div className="mt-2 text-xs leading-5 text-gray-400">
                Drag and drop PDF file(s)
              </div>
            </div>
          </div>
        </div>
      </div>
      {success && (
        <div className="mt-4 flex items-center bg-green-50 p-4">
          <div className="text-sm font-medium text-green-800">{success}</div>
          <div className="ml-auto">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100"
              >
                <XMarkIcon className="h-5 w-5" onClick={() => reset()} />
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center bg-red-50 p-4">
          <div className="text-sm font-medium text-red-800">{error}</div>
          <div className="ml-auto">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <XMarkIcon className="h-5 w-5" onClick={() => reset()} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
