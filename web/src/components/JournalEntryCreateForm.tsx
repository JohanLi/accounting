import { useState } from 'react'
import { Amount } from './Amount'
import useJournalEntryMutation from './useJournalEntryMutation'
import { Button } from './Button'

const vatRates = ['0.25', '0.12', '0.06', '0'] as const
type VatRate = (typeof vatRates)[number]

type Props = {
  onClose: () => void
}

export default function JournalEntryCreateForm({ onClose }: Props) {
  const mutation = useJournalEntryMutation()

  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [amountText, setAmountText] = useState('')
  const [vatRate, setVatRate] = useState<VatRate>('0')

  const [debit, setDebit] = useState('')
  const [credit, setCredit] = useState('')

  const amount = Math.round((parseInt(amountText) || 0) * 100)
  const amountBeforeVat = Math.round(amount / (1 + parseFloat(vatRate)))
  const amountVat = amount - amountBeforeVat

  return (
    <>
      <div className="grid grid-cols-12 gap-x-4">
        <div className="col-span-2">
          <div>Date</div>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="col-span-3">
          <div>Description</div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="col-span-1">
          <div>Amount</div>
          <input
            type="text"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="col-span-1">
          <div>VAT</div>
          {vatRates.map((rate) => (
            <label key={rate} className="flex items-center space-x-4">
              <input
                type="radio"
                checked={vatRate === rate}
                onChange={() => setVatRate(rate)}
              />
              <span className="text-sm">{rate}</span>
            </label>
          ))}
        </div>
        <div className="col-span-3">
          <div>Transactions</div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={debit}
              onChange={(e) => setDebit(e.target.value)}
              className="w-24"
            />
            <Amount amount={amount} />
          </div>

          {amountVat > 0 && (
            <div className="flex items-center space-x-4">
              <input type="text" disabled value="2640" className="w-24" />
              <Amount amount={amountVat} />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              className="w-24"
            />
            <Amount amount={-amountBeforeVat} />
          </div>
        </div>
        <div className="col-span-2">
          <div className="flex space-x-4">
            <Button
              type="primary"
              onClick={async () => {
                await mutation.mutateAsync({
                  date: new Date(date),
                  description,
                  transactions: [
                    {
                      accountId: parseInt(debit),
                      amount: amount,
                    },
                    {
                      accountId: 2640,
                      amount: amountVat,
                    },
                    {
                      accountId: parseInt(credit),
                      amount: -amountBeforeVat,
                    },
                  ],
                })

                onClose()
              }}
              text="Submit"
            />
            <Button type="secondary" onClick={onClose} text="Cancel" />
          </div>
        </div>
      </div>
    </>
  )
}
