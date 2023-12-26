import { filterNull } from '../utils'
import { getDocumentSuggestions } from './documentSuggestions'
import { getBankSavingsSuggestions } from './bankSavingsSuggestions'
import { getTaxSuggestions } from './taxSuggestions'
import { getInsuranceSuggestions } from './insuranceSuggestions'
import { getAccountsReceivablePaidSuggestions } from './accountsReceivablePaidSuggestions'
import { Transaction } from '../getJournalEntries'
import { InferSelectModel } from 'drizzle-orm'
import { Transactions } from '../schema'

export type Suggestions = {
  knownDocumentSuggestions: SuggestionFromKnown[]
  unknownDocumentSuggestions: SuggestionFromUnknown[]
}

export type SuggestionFromKnown = {
  date: Date
  description: string
  transactions: Transaction[]
  linkedToTransactionIds: number[]
  documentId?: number
}

export type SuggestionFromUnknown = {
  bankTransactions: InferSelectModel<typeof Transactions>[]
  description: string
  documentId: number
}

export async function getSuggestions(): Promise<Suggestions> {
  const taxSuggestions = await getTaxSuggestions()
  const bankSavingsSuggestions = await getBankSavingsSuggestions()

  const insuranceSuggestions = await getInsuranceSuggestions()
  const accountsReceivablePaidSuggestions =
    await getAccountsReceivablePaidSuggestions()

  const { knownDocumentSuggestions, unknownDocumentSuggestions } =
    await getDocumentSuggestions()

  return {
    knownDocumentSuggestions: filterNull([
      ...taxSuggestions,
      ...bankSavingsSuggestions,
      ...insuranceSuggestions,
      ...accountsReceivablePaidSuggestions,
      ...knownDocumentSuggestions,
    ]),
    unknownDocumentSuggestions,
  }
}
