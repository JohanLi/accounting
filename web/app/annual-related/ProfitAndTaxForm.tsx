'use client'

import { useRouter } from 'next/navigation'
import { Submit } from '../components/Submit'
import {
  submitProfitAndTax,
  SubmitProfitAndTax,
} from './actions/submitProfitAndTax'
import {
  DESCRIPTION_PROFIT,
  DESCRIPTION_PROFIT_FROM_PREVIOUS,
  DESCRIPTION_TAX,
} from './descriptions'

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
          <li>{DESCRIPTION_TAX}</li>
          <li>{DESCRIPTION_PROFIT}</li>
          <li>{DESCRIPTION_PROFIT_FROM_PREVIOUS}</li>
        </ul>
      </div>
    </div>
  )
}
