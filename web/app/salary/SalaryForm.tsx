'use client'

import { useState } from 'react'
import { PERSONAL_TAX } from '../tax'
import {
  AmountInput,
  displayCentsAsDollars,
  NumberOrMinus,
} from './AmountInput'
import { create } from './create'
import { useRouter } from 'next/navigation'
import { Submit } from '../components/Submit'

type Props = {
  incomeThisYear: number
}

/*
  This form isn't used much, so it's already quite excessive in business logic that improves the UX.
  Because I'm the sole user, and due to lack of incentives, there's little reason to do server-side validation.
 */

export default function SalaryForm(props: Props) {
  const router = useRouter()

  const [amount, setAmount] = useState<NumberOrMinus>(0)

  const max = PERSONAL_TAX.annualSalary - props.incomeThisYear
  const reachedLimit = max <= 0

  const amountInvalid = amount === '-' || amount <= 0 || amount > max

  return (
    <div className="mb-24 mt-4">
      {reachedLimit && (
        <div className="mt-4 max-w-md text-sm text-red-500">
          You have reached the annual salary limit of{' '}
          {displayCentsAsDollars(PERSONAL_TAX.annualSalary)}, which the
          effective tax rate is based on. If you intend to pay more, you need to
          re-calculate the tax rate.
        </div>
      )}
      {!reachedLimit && (
        <form
          action={() => {
            if (amountInvalid) {
              return
            }

            create(amount).then(() => {
              setAmount(0)
              router.refresh()
            })
          }}
        >
          <label className="block max-w-md">
            <div>Amount</div>
            <AmountInput
              value={amount}
              onChange={setAmount}
              placeholder={`max ${displayCentsAsDollars(max)}`}
            />
          </label>
          <Submit disabled={amountInvalid} />
        </form>
      )}
    </div>
  )
}
