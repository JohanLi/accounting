import { ChangeEvent } from 'react'
import iconv from 'iconv-lite'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Account } from '@prisma/client'
import {
  getAccountMap,
  extractVerifications,
  getUniqueAccountCodes,
} from '../sie'

import { VerificationInsert } from '../pages/api/import'

export default function Import() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: {
      accounts: Account[]
      verifications: VerificationInsert[]
    }) =>
      fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
    },
  })

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target

    if (!files) {
      return
    }

    const reader = new FileReader()

    reader.addEventListener('load', () => {
      event.target.value = ''

      const sieFile = iconv.decode(
        Buffer.from(reader.result as ArrayBuffer),
        'CP437',
      )

      const verifications = extractVerifications(sieFile)

      const accountMap = getAccountMap(sieFile)
      const uniqueAccountCodes = getUniqueAccountCodes(verifications)
      const accounts = uniqueAccountCodes.map((code) => ({
        code,
        description: accountMap[code],
      }))

      mutation.mutate({ accounts, verifications })
    })

    reader.readAsArrayBuffer(files[0])
  }

  return (
    <div className="mt-2">
      <label className="cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
        <span>Select SIE file</span>
        <input type="file" className="sr-only" onChange={onChange} />
      </label>
    </div>
  )
}
