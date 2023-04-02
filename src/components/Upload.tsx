import React, { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { UPLOAD_FORM_KEY } from '../utils'

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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const formData = new FormData()

      acceptedFiles.forEach((file: any) => {
        formData.append(UPLOAD_FORM_KEY, file)
      })

      mutation.mutate(formData)
    },
    [mutation],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div
      {...getRootProps()}
      className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 p-24"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag and drop some files here, or click to select files</p>
      )}
    </div>
  )
}
