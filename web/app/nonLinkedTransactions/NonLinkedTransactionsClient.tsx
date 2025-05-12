'use client'

import { InferSelectModel } from 'drizzle-orm'
import { useState } from 'react'

import { Transactions } from '../schema'
import { Category } from '../suggestions/SuggestionsUnknownForm'
import { Transaction } from '../transactions/Transaction'
import DocumentUpload from '../upload/DocumentUpload'
import { NonLinkedTransactionsForm } from './NonLinkedTransactionsForm'

export default function NonLinkedTransactionsClient({
  transactions,
}: {
  transactions: InferSelectModel<typeof Transactions>[]
}) {
  /*
    Letting a single form select/change the category for all forms is intentional.
    The idea is that I typically upload receipts that belong to the same category in the same batch.
    There's probably a more elegant solution UI-wise, but this will do.
   */
  const [selectedCategory, setSelectedCategory] = useState<Category>()

  return transactions.map((transaction) => (
    <DocumentUpload
      key={transaction.id}
      form={
        (documentId: number) => <NonLinkedTransactionsForm
          transaction={transaction}
          documentId={documentId}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      }
    >
      <Transaction key={transaction.id} transaction={transaction} />
    </DocumentUpload>
  ))
}
