import { Transaction } from '../getJournalEntries'
import { filterNull } from '../utils'
import { getBankSavingsSuggestions } from './bankSavingsSuggestions'
import { getDocumentSuggestions } from './documentSuggestions'
import { getInsuranceSuggestions } from './insuranceSuggestions'
import { getPaidInvoiceSuggestions } from './paidInvoiceSuggestions'
import { getTaxSuggestions } from './taxSuggestions'

export type Suggestions = {
  date: Date
  description: string
  transactions: Transaction[]
  linkedToTransactionIds: number[]
  documentId?: number
}

export async function getSuggestions(): Promise<Suggestions[]> {
  const groups = await Promise.all([
    getTaxSuggestions(),
    getBankSavingsSuggestions(),
    getInsuranceSuggestions(),
    getPaidInvoiceSuggestions(),
    getDocumentSuggestions(),
  ])

  return groups
    .map((group) =>
      filterNull(group).sort((a, b) => a.date.getTime() - b.date.getTime()),
    )
    .flat()
}
