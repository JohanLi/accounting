import { DragEvent, useState } from 'react'
import { getFilenameAndData, getFileEntries } from '../filesFromDataTransfer'
import { UploadFile } from '../pages/api/documents'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DocumentArrowUpIcon } from '@heroicons/react/24/solid'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function DocumentUpload() {
  const [isDragOver, setIsDragOver] = useState(false)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: UploadFile[]) =>
      fetch('/api/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['totals'] })
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] })
    },
  })

  const onDragOver = (e: DragEvent) => {
    // without this, dropping a document will open it in a new tab
    e.preventDefault()
  }

  const onDrop = async (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDragOver(false)

    const { items } = e.dataTransfer

    /*
      When Playwright tests dropping files, webkitGetAsEntry()
      does not produce a FileSystemFileEntry.

      This is a hack to get the tests to work.
     */
    const isPlaywrightTest = items[0].webkitGetAsEntry() === null
    if (isPlaywrightTest) {
      const file = items[0].getAsFile()

      if (file) {
        mutation.mutate([await getFilenameAndData(file)])
      }

      return
    }

    const fileEntries = await getFileEntries(items)
    const files = await Promise.all(
      fileEntries.map(
        (file) =>
          new Promise<UploadFile>((resolve, reject) => {
            file.file((file) => {
              getFilenameAndData(file).then(resolve).catch(reject)
            }, reject)
          }),
      ),
    )

    mutation.mutate(files)
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
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={() => {
          setIsDragOver(true)
          mutation.reset()
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
      {mutation.data && (
        <div className="mt-4 flex items-center bg-green-50 p-4">
          <div className="text-sm font-medium text-green-800">
            Uploaded {mutation.data.length} new document(s)
          </div>
          <div className="ml-auto">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100"
              >
                <XMarkIcon
                  className="h-5 w-5"
                  onClick={() => mutation.reset()}
                />
              </button>
            </div>
          </div>
        </div>
      )}
      {mutation.error && (
        <div className="mt-4 flex items-center bg-red-50 p-4">
          <div className="text-sm font-medium text-red-800">
            There was an error when uploading
          </div>
          <div className="ml-auto">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <XMarkIcon
                  className="h-5 w-5"
                  onClick={() => mutation.reset()}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
