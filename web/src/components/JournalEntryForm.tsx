import { useState } from 'react'
import { Amount } from './Amount'
import useJournalEntryMutation from './useJournalEntryMutation'
import { Button } from './Button'
import { JournalEntryInsert } from '../pages/api/journalEntries'
import { formatDate } from './DateFormatted'

const vatRates = ['0', '0.06', '0.12', '0.25'] as const
type VatRate = (typeof vatRates)[number]

type Props = {
  journalEntry?: JournalEntryInsert
  onClose: () => void
}

export default function JournalEntryForm({ journalEntry, onClose }: Props) {
  /*
    For new entries, the values of each account transaction are derived from a
    single value together with the VAT rate (if any), credit and debit. They
    have at most three transactions.

    However, imported entries do not follow this pattern – some of them are
    aggregated, containing more than three transactions (particularly salaries).
   */
  const isEdit = !!journalEntry

  const mutation = useJournalEntryMutation()

  const [date, setDate] = useState(isEdit ? formatDate(journalEntry.date) : '')
  const [description, setDescription] = useState(
    isEdit ? journalEntry.description : '',
  )
  const [amountText, setAmountText] = useState('')
  const [vatRate, setVatRate] = useState<VatRate>('0')

  const [creditAccountId, setCreditAccountId] = useState('')
  const [debitAccountId, setDebitAccountId] = useState('')

  const [transactions, setTransactions] = useState<
    { accountId: number; amount: number }[]
  >(
    journalEntry?.transactions.map((t) => ({
      accountId: t.accountId,
      amount: t.amount / 100,
    })) || [],
  )

  const amount = Math.round((parseInt(amountText) || 0) * 100)
  const amountBeforeVat = Math.round(amount / (1 + parseFloat(vatRate)))
  const amountVat = amount - amountBeforeVat

  return (
    <>
      <div className="grid grid-cols-12 gap-x-4">
        <label className="col-span-2">
          <div>Date</div>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
          />
        </label>
        <label className="col-span-3">
          <div>Description</div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
        </label>
        {!isEdit && (
          <>
            <label className="col-span-1">
              <div>Amount</div>
              <input
                type="text"
                value={amountText}
                onChange={(e) => setAmountText(e.target.value)}
                className="w-full"
              />
            </label>
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
          </>
        )}
        <div className="col-span-3" data-testid="transactions">
          <div>Transactions</div>
          {isEdit &&
            transactions.map((t, i) => (
              <div key={i} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={t.accountId || ''}
                  onChange={(e) => {
                    const newTransactions = [...transactions]
                    newTransactions[i].accountId = parseInt(e.target.value)
                    setTransactions(newTransactions)
                  }}
                  className="w-24"
                />
                <input
                  type="text"
                  value={t.amount || ''}
                  onChange={(e) => {
                    const newTransactions = [...transactions]
                    newTransactions[i].amount = parseInt(e.target.value)
                    setTransactions(newTransactions)
                  }}
                  className="w-36"
                />
              </div>
            ))}
          {!isEdit && (
            <>
              <label className="flex items-center space-x-4">
                <input
                  type="text"
                  value={debitAccountId}
                  onChange={(e) => setDebitAccountId(e.target.value)}
                  className="w-24"
                />
                <Amount amount={amount} />
              </label>

              <label className="flex items-center space-x-4">
                <input
                  type="text"
                  value={creditAccountId}
                  onChange={(e) => setCreditAccountId(e.target.value)}
                  className="w-24"
                />
                <Amount amount={-amountBeforeVat} />
              </label>

              {amountVat > 0 && (
                <label className="flex items-center space-x-4">
                  <input type="text" disabled value="2640" className="w-24" />
                  <Amount amount={-amountVat} />
                </label>
              )}
            </>
          )}
        </div>
        <div className="col-span-2">
          <div className="flex space-x-4">
            <Button
              type="primary"
              onClick={async () => {
                await mutation.mutateAsync({
                  id: journalEntry?.id,
                  date: new Date(date),
                  description,
                  transactions: isEdit
                    ? transactions.map((t) => ({
                        accountId: t.accountId,
                        amount: t.amount * 100,
                      }))
                    : [
                        {
                          accountId: parseInt(debitAccountId),
                          amount: amount,
                        },
                        {
                          accountId: 2640,
                          amount: -amountVat,
                        },
                        {
                          accountId: parseInt(creditAccountId),
                          amount: -amountBeforeVat,
                        },
                      ],
                  linkedToTransactionIds: journalEntry?.linkedToTransactionIds,
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
