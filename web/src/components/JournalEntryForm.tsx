import { useState } from 'react'
import { Amount } from './Amount'
import useJournalEntryMutation from '../hooks/useJournalEntryMutation'
import { Button } from './Button'
import { Transaction } from '../pages/api/journalEntries'
import { DateFormatted, formatDate } from './DateFormatted'
import { AmountInput } from './AmountInput'
import DocumentLink from './DocumentLink'
import { Suggestion } from '../pages/api/journalEntries/suggestions'

const vatRates = ['0', '0.06', '0.12', '0.25'] as const
type VatRate = (typeof vatRates)[number]

type Props = {
  journalEntry?: Suggestion
  onClose: () => void
}

// TODO cancelling should reset the transactions' values

export default function JournalEntryForm({ journalEntry, onClose }: Props) {
  const isEdit = !!journalEntry?.transactions.length

  const mutation = useJournalEntryMutation()

  const [date, setDate] = useState(
    journalEntry?.date ? formatDate(journalEntry.date) : '',
  )
  const [description, setDescription] = useState(
    journalEntry?.description || '',
  )
  const [vatRate, setVatRate] = useState<VatRate>('0')

  const [creditAccountId, setCreditAccountId] = useState('')
  const [debitAccountId, setDebitAccountId] = useState('')

  const [transactions, setTransactions] = useState<Transaction[]>(
    journalEntry?.transactions || [],
  )

  const [amount, setAmount] = useState(journalEntry?.options?.values[0] || 0)
  const amountBeforeVat = Math.round(amount / (1 + parseFloat(vatRate)))
  const amountVat = amount - amountBeforeVat

  const dates = journalEntry?.options?.dates || []
  const values = journalEntry?.options?.values || false

  return (
    <>
      <div className="grid grid-cols-12 gap-x-4">
        <label className="col-span-2">
          <div>Date</div>
          {!dates.length && (
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          )}
          {dates.length > 0 &&
            dates.map((d) => (
              <label
                key={formatDate(d)}
                className="flex items-center space-x-4"
              >
                <input
                  type="radio"
                  checked={date === formatDate(d)}
                  onChange={() => setDate(formatDate(d))}
                />
                <DateFormatted date={d} />
              </label>
            ))}
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
              <div>
                Amount
                {!!journalEntry?.options?.foreignCurrency && (
                  <span className="ml-1 text-xs">
                    {journalEntry.options.foreignCurrency}
                  </span>
                )}
              </div>
              {!values && <AmountInput value={amount} onChange={setAmount} />}
              {!!values &&
                values.map((value) => (
                  <label key={value} className="flex items-center space-x-4">
                    <input
                      type="radio"
                      checked={amount === value}
                      onChange={() => setAmount(value)}
                    />
                    <Amount amount={value} />
                  </label>
                ))}
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
                <AmountInput
                  value={t.amount}
                  onChange={(amount) => {
                    const newTransactions = [...transactions]
                    newTransactions[i].amount = amount
                    setTransactions(newTransactions)
                  }}
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
        {!!journalEntry?.documentId && (
          <div className="col-span-1">
            <DocumentLink id={journalEntry?.documentId} />
          </div>
        )}
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
                    ? transactions
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
                  linkedToTransactionIds:
                    journalEntry?.linkedToTransactionIds || [],
                  documentId: journalEntry?.documentId,
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
