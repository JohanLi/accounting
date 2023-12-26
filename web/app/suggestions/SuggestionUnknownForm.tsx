'use client'

import { SuggestionFromUnknown } from './getSuggestions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DateFormatted } from '../components/DateFormatted'
import { Amount } from '../components/Amount'
import DocumentLink from '../journalEntries/DocumentLink'
import { updateJournalEntry } from '../actions/updateJournalEntry'
import { Submit } from '../components/Submit'
import { TextInput } from '../journalEntries/TextInput'

const vatRates = ['0', '0.06', '0.12', '0.25'] as const
type VatRate = (typeof vatRates)[number]

export function SuggestionUnknownForm({
  suggestion,
}: {
  suggestion: SuggestionFromUnknown
}) {
  const router = useRouter()

  const [description, setDescription] = useState(suggestion.description)
  const [vatRate, setVatRate] = useState<VatRate>('0')

  const [debitAccountId, setDebitAccountId] = useState(0)

  const [selectedBankTransactionId, setSelectedBankTransactionId] = useState(
    suggestion.bankTransactions[0].id,
  )
  const selectedBankTransaction = suggestion.bankTransactions.find(
    (t) => t.id === selectedBankTransactionId,
  )!

  const amount = selectedBankTransaction.amount
  const amountBeforeVat = Math.round(amount / (1 + parseFloat(vatRate)))
  const amountVat = amount - amountBeforeVat

  const date = selectedBankTransaction.date

  const transactions = [
    {
      accountId: 1930,
      amount: -amount,
    },
    {
      accountId: debitAccountId,
      amount: amountBeforeVat,
    },
    {
      accountId: 2640,
      amount: amountVat,
    },
  ]

  return (
    <div className="flex gap-x-4 py-4" data-testid="journalEntryForm">
      <div className="w-64 space-y-4">
        {suggestion.bankTransactions.map((bankTransaction) => (
          <label key={bankTransaction.id} className="flex items-start">
            <div className="flex h-6 items-center">
              <input
                type="radio"
                checked={selectedBankTransactionId === bankTransaction.id}
                onChange={() =>
                  setSelectedBankTransactionId(bankTransaction.id)
                }
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-0"
              />
            </div>
            <div className="ml-3">
              <div className="text-xs text-gray-500">
                <DateFormatted date={bankTransaction.date} />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {bankTransaction.description}
              </div>
              <div className="text-sm font-medium">
                <Amount amount={bankTransaction.amount} />
              </div>
            </div>
          </label>
        ))}
      </div>
      <div className="w-64">
        <TextInput
          value={description}
          onChange={(value) => setDescription(value)}
        />
      </div>
      <div className="w-32 space-y-1">
        {vatRates.map((rate) => (
          <label key={rate} className="flex items-center space-x-4">
            <input
              type="radio"
              checked={vatRate === rate}
              onChange={() => setVatRate(rate)}
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-0"
            />
            <span className="text-sm text-gray-900">{rate}</span>
          </label>
        ))}
      </div>
      <div className="space-y-1">
        {transactions.map((t, i) => (
          <div
            key={i}
            className="flex items-center space-x-1"
            data-testid="transaction"
          >
            <div className="w-16">
              {i === 1 && (
                <TextInput
                  value={t.accountId === 0 ? '' : t.accountId.toString()}
                  onChange={(value) => setDebitAccountId(parseInt(value) || 0)}
                />
              )}
              {i !== 1 && <div>{t.accountId}</div>}
            </div>
            <div className="w-20 text-right text-sm">
              <Amount amount={t.amount} />
            </div>
          </div>
        ))}
      </div>
      {!!suggestion.documentId && (
        <div className="w-16">
          <DocumentLink id={suggestion.documentId} />
        </div>
      )}
      <div className="ml-auto w-24">
        <form
          action={async () => {
            const entry = {
              date,
              description,
              transactions,
              linkedToTransactionIds: [selectedBankTransactionId],
              documentId: suggestion.documentId,
            }

            await updateJournalEntry(entry)

            router.refresh()
          }}
          className="flex justify-end space-x-2"
        >
          <Submit disabled={false} />
        </form>
      </div>
    </div>
  )
}
