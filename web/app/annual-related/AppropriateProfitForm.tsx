'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AmountInput, displayAmountInput } from '../components/AmountInput'
import { Submit } from '../components/Submit'
import { appropriateProfit } from './actions/appropriateProfit'

type Props = {
  profitThisYear: number
}

export default function AppropriateProfitForm(props: Props) {
  const router = useRouter()

  const [amount, setAmount] = useState(0)

  const max = props.profitThisYear

  const amountInvalid = amount < 0 || amount > max

  return (
    <div className="mb-24 mt-4">
      <form
        action={() => {
          appropriateProfit(props.profitThisYear, amount).then(() => {
            setAmount(0)
            router.refresh()
          })
        }}
      >
        <label className="block max-w-md">
          <div>Dividend amount</div>
          <AmountInput
            value={amount}
            onChange={setAmount}
            placeholder={`max ${displayAmountInput(max)}`}
          />
        </label>
        <Submit disabled={amountInvalid} />
      </form>
    </div>
  )
}
