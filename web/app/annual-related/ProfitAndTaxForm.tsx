'use client'

import { useRouter } from 'next/navigation'

import { Submit } from '../components/Submit'
import { DESCRIPTIONS } from '../descriptions'
import {
  SubmitProfitAndTax,
  submitProfitAndTax,
} from './actions/submitProfitAndTax'

/*
  TODO in the rare event that the corporate tax is 0, submitting this form will crash
   (the transactions get stripped away when validating the journal entry).
 */

export default function ProfitAndTaxForm(props: SubmitProfitAndTax) {
  const router = useRouter()

  return (
    <div className="mb-24 mt-4 space-y-2">
      <form
        action={() => {
          submitProfitAndTax(props).then(() => {
            router.refresh()
          })
        }}
      >
        <Submit disabled={false} />
      </form>
      <div className="text-xs text-gray-500">
        <ul className="list-inside list-disc">
          <li>{DESCRIPTIONS.TAX}</li>
          <li>{DESCRIPTIONS.PROFIT}</li>
          <li>{DESCRIPTIONS.PROFIT_FROM_PREVIOUS}</li>
        </ul>
      </div>
    </div>
  )
}
