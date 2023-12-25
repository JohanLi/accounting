'use client'

import { Suggestion } from './getSuggestions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DateFormatted, formatDate } from '../components/DateFormatted'
import { DateInput } from '../journalEntries/DateInput'
import { AmountInput } from '../components/AmountInput'
import { Amount } from '../components/Amount'
import DocumentLink from '../journalEntries/DocumentLink'
import { updateJournalEntry } from '../actions/updateJournalEntry'
import { Submit } from '../components/Submit'
import { Transaction } from '../getJournalEntries'

const vatRates = ['0', '0.06', '0.12', '0.25'] as const
type VatRate = (typeof vatRates)[number]

export function SuggestionForm({ suggestion }: { suggestion: Suggestion }) {
  const router = useRouter()

  const [date, setDate] = useState(formatDate(suggestion.date))
  const [description, setDescription] = useState(suggestion.description)
  const [vatRate, setVatRate] = useState<VatRate>('0')

  const [creditAccountId, setCreditAccountId] = useState('1930')
  const [debitAccountId, setDebitAccountId] = useState('')

  const [transactions, setTransactions] = useState<Transaction[]>(
    suggestion.transactions,
  )

  const [amount, setAmount] = useState(suggestion.options?.values[0] || 0)
  const amountBeforeVat = Math.round(amount / (1 + parseFloat(vatRate)))
  const amountVat = amount - amountBeforeVat

  const dates = suggestion.options?.dates || []
  const values = suggestion.options?.values || false

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
      <div className="col-span-3">
        <div>Transactions</div>
        {transactions.map((t, i) => (
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
      </div>
      {!!suggestion.documentId && (
        <div className="col-span-1">
          <DocumentLink id={suggestion.documentId} />
        </div>
      )}
      <div className="col-span-2">
        <form
          action={async () => {
            const entry = {
              date: new Date(date),
              description,
              transactions,
              linkedToTransactionIds: suggestion.linkedToTransactionIds,
              documentId: suggestion.documentId,
            }

            await updateJournalEntry(entry)

            router.refresh()
          }}
        >
          <Submit disabled={false} />
        </form>
      </div>
    </div>
  )
}
