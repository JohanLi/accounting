import { InferSelectModel } from 'drizzle-orm'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { updateJournalEntry } from '../actions/updateJournalEntry'
import { Submit } from '../components/Submit'
import {
  CategoryTd,
  DateOrAccountCodeTd,
  DescriptionTd,
  SubmitTd,
  TableRow,
} from '../components/common/table'
import { Transaction } from '../getJournalEntries'
import DocumentLink from '../journalEntries/DocumentLink'
import { JournalEntryTransactions } from '../journalEntries/JournalEntryTransactions'
import { TextInput } from '../journalEntries/TextInput'
import { Transactions } from '../schema'
import { AccountCode } from '../types'

export type VatRate = '0' | '0.06' | '0.12' | '0.25'

export type Category = {
  name: string
} & (
  | {
      debitAccountId: AccountCode
      vatRate: VatRate
      reverseCharge?: true
    }
  | {
      creditAccountId: AccountCode
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
    name: 'Lokalhyra (25%)',
    debitAccountId: 5010,
    vatRate: '0.25',
  },
  {
    name: 'Kost och logi (12%)',
    debitAccountId: 5831,
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
  /*
    My new provider has marginally better cellular coverage,
    but they don't let you set up an automatic monthly payment.

    Still on the fence about whether to switch back to my old provider.
    For this reason, it's not worth treating this new provider's invoices
    as "recognized" yet.
   */
  {
    name: 'Mobiltelefoni (25%)',
    debitAccountId: 6212,
    vatRate: '0.25',
  },
]

export function NonLinkedTransactionsForm({
  transaction,
  documentId,
  selectedCategory,
  setSelectedCategory,
}: {
  transaction: InferSelectModel<typeof Transactions>
  documentId: number
  selectedCategory: Category | undefined
  setSelectedCategory: (category: Category | undefined) => void
}) {
  const router = useRouter()

  const [description, setDescription] = useState('')

  let transactions: Transaction[] | undefined

  if (selectedCategory) {
    // TODO consider creating a general function for transactions (that also applies Math.abs to amount)
    const amount = Math.abs(transaction.amount)

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
    <TableRow>
      <DateOrAccountCodeTd>
        <DocumentLink id={documentId} />
      </DateOrAccountCodeTd>
      <DescriptionTd>
        <TextInput
          value={description}
          onChange={(value) => setDescription(value)}
        />
      </DescriptionTd>
      <CategoryTd>
        {!selectedCategory &&
          categories.map((category) => (
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
        {selectedCategory && transactions && (
          <>
            <div
              className="inline-flex cursor-pointer items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              onClick={() => setSelectedCategory(undefined)}
            >
              {selectedCategory.name}
            </div>
            <JournalEntryTransactions transactions={transactions} />
          </>
        )}
      </CategoryTd>
      <SubmitTd>
        <form
          action={async () => {
            if (!selectedCategory || !transactions) {
              return
            }

            const entry = {
              date: transaction.date,
              description,
              transactions,
              linkedToTransactionIds: [transaction.id],
              documentId,
            }

            await updateJournalEntry(entry)

            router.refresh()
          }}
          className="flex justify-end space-x-2"
        >
          <Submit disabled={!selectedCategory || !transactions} />
        </form>
      </SubmitTd>
    </TableRow>
  )
}
