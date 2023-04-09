import React, { DragEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getExtensionAndData, getFileEntries } from '../filesFromDataTransfer'
import { UploadFile } from '../pages/api/upload'

export default function Upload() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: UploadFile[]) =>
      fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['totals'] })
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const onDrop = async (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
        mutation.mutate([await getExtensionAndData(file)])
      }

      return
    }

    const fileEntries = await getFileEntries(items)
    const files = await Promise.all(
      fileEntries.map(
        (file) =>
          new Promise<UploadFile>((resolve, reject) => {
            file.file((file) => {
              getExtensionAndData(file).then(resolve).catch(reject)
            }, reject)
          }),
      ),
    )

    mutation.mutate(files)
  }

  return (
    <div
      className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 p-24"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      Drop documents here
    </div>
  )
}
