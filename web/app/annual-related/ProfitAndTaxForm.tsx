'use client'

import { useRouter } from 'next/navigation'
import { Submit } from '../components/Submit'
import {
  submitProfitAndTax,
  SubmitProfitAndTax,
} from './actions/submitProfitAndTax'

export default function ProfitAndTaxForm(props: SubmitProfitAndTax) {
  const router = useRouter()

  return (
    <div className="mb-24 mt-4">
      <form
        action={() => {
          submitProfitAndTax(props).then(() => {
            router.refresh()
          })
        }}
      >
        <Submit disabled={false} />
      </form>
    </div>
  )
}
