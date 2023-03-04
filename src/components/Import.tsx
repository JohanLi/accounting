import { ChangeEvent } from 'react'
import iconv from 'iconv-lite'
import { extractVerifications } from '../sie'

export default function Import() {
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

      console.log(verifications)
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
