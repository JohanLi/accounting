'use client'

import { useState } from 'react'
import { Amount } from '../components/Amount'
import { Button } from '../components/Button'
import { Transaction } from '../getJournalEntries'
import { DateFormatted, formatDate } from '../components/DateFormatted'
import { AmountInput } from '../components/AmountInput'
import DocumentLink from './DocumentLink'
import { Suggestion } from '../suggestions/suggestions'
import { DateInput } from './DateInput'
import { Submit } from '../components/Submit'
import { updateJournalEntry } from '../actions/updateJournalEntry'
import { useRouter } from 'next/navigation'

const vatRates = ['0', '0.06', '0.12', '0.25'] as const
type VatRate = (typeof vatRates)[number]

type Props = {
  journalEntry?: Suggestion
  onClose?: () => void
}

// TODO cancelling should reset the transactions' values

export default function JournalEntryForm({ journalEntry, onClose }: Props) {
  const router = useRouter()

  const isEdit = !!journalEntry?.transactions.length

  const [date, setDate] = useState(
    journalEntry?.date ? formatDate(journalEntry.date) : '',
  )
  const [description, setDescription] = useState(
    journalEntry?.description || '',
  )
  const [vatRate, setVatRate] = useState<VatRate>('0')

  const [creditAccountId, setCreditAccountId] = useState('1930')
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
    <div className="grid grid-cols-12 gap-x-4" data-testid="journalEntryForm">
      <label className="col-span-2">
        <div>Date</div>
        {!dates.length && <DateInput value={date} onChange={setDate} />}
        {dates.length > 0 &&
          dates.map((d) => (
            <label key={formatDate(d)} className="flex items-center space-x-4">
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
      <div className="col-span-3">
        <div>Transactions</div>
        {isEdit &&
          transactions.map((t, i) => (
            <div
              key={i}
              className="flex items-center space-x-4"
              data-testid="transaction"
            >
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
          /*
            TODO
              An important assumption made here is that all "suggestions"
              are treated as purchases. I think it's fine for now, because
              the only sale entries I have are handled as a
              "Recognized document".

              I also think it's fine to assume 1930 and
              2640 (in the event of VAT), with the third account ID being
              populated after you select from a few options.
           */
          <>
            <label
              className="flex items-center space-x-4"
              data-testid="transaction"
            >
              <input
                type="text"
                value={creditAccountId}
                onChange={(e) => setCreditAccountId(e.target.value)}
                className="w-24"
              />
              <Amount amount={-amount} />
            </label>

            <label
              className="flex items-center space-x-4"
              data-testid="transaction"
            >
              <input
                type="text"
                value={debitAccountId}
                onChange={(e) => setDebitAccountId(e.target.value)}
                className="w-24"
              />
              <Amount amount={amountBeforeVat} />
            </label>

            {amountVat > 0 && (
              <label
                className="flex items-center space-x-4"
                data-testid="transaction"
              >
                <input type="text" disabled value="2640" className="w-24" />
                <Amount amount={amountVat} />
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
          <form
            action={async () => {
              const entry = {
                id: journalEntry?.id,
                date: new Date(date),
                description,
                transactions: isEdit
                  ? transactions
                  : [
                      {
                        accountId: parseInt(creditAccountId),
                        amount: -amount,
                      },
                      {
                        // TODO this can remain '' and result in NaN, needs fixing
                        accountId: parseInt(debitAccountId),
                        amount: amountBeforeVat,
                      },
                      {
                        accountId: 2640,
                        amount: amountVat,
                      },
                    ],
                linkedToTransactionIds:
                  journalEntry?.linkedToTransactionIds || [],
                documentId: journalEntry?.documentId,
              }

              await updateJournalEntry(entry)

              router.refresh()

              if (onClose) {
                onClose()
              }
            }}
          >
            <Submit disabled={false} />
          </form>
          <Button
            type="secondary"
            onClick={() => {
              if (onClose) {
                onClose()
              }
            }}
            text="Cancel"
          />
        </div>
      </div>
    </div>
  )
}
