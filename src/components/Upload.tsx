import React, { DragEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllFileEntries } from '../filesFromDataTransfer'
import { UploadFiles } from '../pages/api/upload'

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
      resolve(base64.substring(base64.indexOf(',') + 1))
    }
    reader.onerror = (error) => reject(error)
  })

export default function Upload() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: UploadFiles) =>
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
      This is a hack: when Playwright tests dropping files, I cannot
      get webkitGetAsEntry() to produce a FileSystemFileEntry.

      As a workaround, Playwright only drops one file at a time and will
      early return here.
     */
    if (items.length === 1) {
      const uploadFiles: UploadFiles = []

      if (items[0].kind === 'file') {
        const file = items[0].getAsFile()

        if (file) {
          uploadFiles.push({
            extension: file.name.split('.').pop() || '',
            data: await toBase64(file),
          })
          mutation.mutate(uploadFiles)
        }
      }

      return
    }

    const files = await getAllFileEntries(items)

    const uploadFiles: UploadFiles = []

    const uploadFilePromises: Promise<void>[] = []

    files.forEach((file: FileSystemFileEntry) => {
      uploadFilePromises.push(
        new Promise((resolve) => {
          file.file(async (file) => {
            uploadFiles.push({
              extension: file.name.split('.').pop() || '',
              data: await toBase64(file),
            })
            resolve()
          })
        }),
      )
    })

    await Promise.all(uploadFilePromises)

    mutation.mutate(uploadFiles)
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
