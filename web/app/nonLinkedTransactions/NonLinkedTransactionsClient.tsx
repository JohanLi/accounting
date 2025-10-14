'use client'

import { InferSelectModel } from 'drizzle-orm'
import { useState } from 'react'

import { Transactions } from '../schema'
import { Transaction } from '../transactions/Transaction'
import DocumentUpload from '../upload/DocumentUpload'
import {
  Category,
  NonLinkedTransactionsForm,
} from './NonLinkedTransactionsForm'

export default function NonLinkedTransactionsClient({
  transactions,
}: {
  transactions: InferSelectModel<typeof Transactions>[]
}) {
  /*
    Letting a single form select/change both the description and category for
    all forms is intentional. The reason is that I typically upload multiple
    similar receipts at once, e.g., for SJ, SL, or Skånetrafiken.
    There's probably a more elegant solution UI-wise, but this will do.
   */
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>()

  return transactions.map((transaction) => (
    <DocumentUpload
      key={transaction.id}
      form={(documentId: number) => (
        <NonLinkedTransactionsForm
          transaction={transaction}
          documentId={documentId}
          description={description}
          setDescription={setDescription}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
    >
      <Transaction key={transaction.id} transaction={transaction} />
    </DocumentUpload>
  ))
}
