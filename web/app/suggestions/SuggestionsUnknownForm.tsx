import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { updateJournalEntry } from '../actions/updateJournalEntry'
import { Amount } from '../components/Amount'
import { DateFormatted } from '../components/DateFormatted'
import { Submit } from '../components/Submit'
import { Transaction } from '../getJournalEntries'
import DocumentLink from '../journalEntries/DocumentLink'
import { TextInput } from '../journalEntries/TextInput'
import { SuggestionFromUnknown } from './getSuggestions'

export type VatRate = '0' | '0.06' | '0.12' | '0.25'

export type Category = {
  name: string
} & (
  | {
      debitAccountId: number
      vatRate: VatRate
      reverseCharge?: true
    }
  | {
      creditAccountId: number
      vatRate: Extract<VatRate, '0'>
    }
)

export const categories: Category[] = [
  {
    name: 'Biljetter (6%)',
    debitAccountId: 5810,
    vatRate: '0.06',
  },
  {
    name: 'Biljetter utomlands (0%)',
    debitAccountId: 5810,
    vatRate: '0',
  },
  {
    name: 'Kost och logi (12%)',
    debitAccountId: 6550,
    vatRate: '0.12',
  },
  {
    name: 'Tjänster, utanför EU (25%)',
    debitAccountId: 4531,
    vatRate: '0.25',
    reverseCharge: true,
  },
  {
    name: 'Tjänster, annat EU-land (25%)',
    debitAccountId: 4535,
    vatRate: '0.25',
    reverseCharge: true,
  },
  {
    name: 'Förbrukningsinventarier (25%)',
    debitAccountId: 5410,
    vatRate: '0.25',
  },
  {
    name: 'Presentkort, jul (0%)',
    /*
      https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/presentkort-till-personal
      There's some leeway in picking accountId – 7690 works just as well.
     */
    debitAccountId: 7699,
    vatRate: '0',
  },
  {
    name: 'SJ förseningsersättning (0%)',
    creditAccountId: 3990,
    vatRate: '0',
  },
]

/*
  TODO
    there are lots of repeated conditional checks here to make TypeScript happy.
    I've yet to figure out the best abstraction.
 */
export function SuggestionsUnknownForm({
  suggestion,
  selectedCategory,
  setSelectedCategory,
}: {
  suggestion: SuggestionFromUnknown
  selectedCategory: Category | undefined
  setSelectedCategory: (category: Category) => void
}) {
  const router = useRouter()

  const [selectedBankTransactionId, setSelectedBankTransactionId] = useState(
    suggestion.bankTransactions[0].id,
  )
  const selectedBankTransaction = suggestion.bankTransactions.find(
    (t) => t.id === selectedBankTransactionId,
  )!

  const [description, setDescription] = useState(suggestion.description)

  let transactions: Transaction[] | undefined

  if (selectedCategory) {
    // TODO consider creating a general function for transactions (that also applies Math.abs to amount)
    const amount = Math.abs(selectedBankTransaction.amount)

    if ('creditAccountId' in selectedCategory) {
      transactions = [
        {
          accountId: selectedCategory.creditAccountId,
          amount: -amount,
        },
        {
          accountId: 1930,
          amount,
        },
      ]
    } else if (!selectedCategory.reverseCharge) {
      const amountBeforeVat = Math.round(
        amount / (1 + parseFloat(selectedCategory.vatRate)),
      )
      const amountVat = amount - amountBeforeVat

      transactions = [
        {
          accountId: 1930,
          amount: -amount,
        },
        {
          accountId: selectedCategory.debitAccountId,
          amount: amountBeforeVat,
        },
        {
          accountId: 2640,
          amount: amountVat,
        },
      ]
    } else {
      const amountVat = Math.round(
        amount * parseFloat(selectedCategory.vatRate),
      )

      transactions = [
        {
          accountId: 1930,
          amount: -amount,
        },
        {
          accountId: selectedCategory.debitAccountId,
          amount,
        },
        {
          accountId: 2614,
          amount: -amountVat,
        },
        {
          accountId: 2645,
          amount: amountVat,
        },
      ]
    }
  }

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
      <div className="w-64 space-y-4">
        <TextInput
          value={description}
          onChange={(value) => setDescription(value)}
        />
        <div className="flex items-center space-x-4">
          <DocumentLink id={suggestion.documentId} />
          <div className="space-y-1 text-xs text-gray-500">
            {suggestion.dates.map((date) => (
              <div key={date.getTime()}>
                <DateFormatted date={date} />
              </div>
            ))}
          </div>
          <div className="space-y-1 text-sm text-gray-500">
            {suggestion.foreignCurrency && (
              <div className="flex w-16 items-center justify-end">
                {suggestion.foreignCurrency}
              </div>
            )}
            {suggestion.values.map((value) => (
              <div key={value} className="flex w-16 items-center justify-end">
                <Amount amount={value} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {!selectedCategory && (
        <div className="space-y-1">
          {categories.map((category) => (
            <label key={category.name} className="flex items-center space-x-3">
              <input
                type="radio"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-0"
              />
              <span className="text-sm text-gray-900">{category.name}</span>
            </label>
          ))}
        </div>
      )}
      {selectedCategory && transactions && (
        <div className="ml-6 space-y-1">
          {transactions.map((t, i) => (
            <div
              key={i}
              className="flex items-center space-x-1"
              data-testid="transaction"
            >
              <div className="w-16 text-sm text-gray-900">{t.accountId}</div>
              <div className="w-20 text-right text-sm">
                <Amount amount={t.amount} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="ml-auto w-24">
        <form
          action={async () => {
            if (!selectedCategory || !transactions) {
              return
            }

            const entry = {
              date: selectedBankTransaction.date,
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
          <Submit disabled={!selectedCategory || !transactions} />
        </form>
      </div>
    </div>
  )
}
