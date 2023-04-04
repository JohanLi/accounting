import React, { DragEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UPLOAD_FORM_KEY } from '../utils'
import { getAllFileEntries } from '../filesFromDataTransfer'

export default function Upload() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: FormData) =>
      fetch('/api/upload', {
        method: 'POST',
        body,
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
      const formData = new FormData()

      if (items[0].kind === 'file') {
        const file = items[0].getAsFile()

        if (file) {
          formData.append(UPLOAD_FORM_KEY, file)
          mutation.mutate(formData)
        }
      }

      return
    }

    const files = await getAllFileEntries(items)

    const formData = new FormData()

    const formDataPromises: Promise<void>[] = []

    files.forEach((file: FileSystemFileEntry) => {
      formDataPromises.push(
        new Promise((resolve) => {
          file.file((file) => {
            formData.append(UPLOAD_FORM_KEY, file)
            resolve()
          })
        }),
      )
    })

    await Promise.all(formDataPromises)

    mutation.mutate(formData)
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
