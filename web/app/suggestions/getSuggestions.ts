import { InferSelectModel } from 'drizzle-orm'

import { Transaction } from '../getJournalEntries'
import { Transactions } from '../schema'
import { filterNull } from '../utils'
import { getAccountsReceivablePaidSuggestions } from './accountsReceivablePaidSuggestions'
import { getBankSavingsSuggestions } from './bankSavingsSuggestions'
import { getDocumentSuggestions } from './documentSuggestions'
import { getInsuranceSuggestions } from './insuranceSuggestions'
import { getTaxSuggestions } from './taxSuggestions'

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
  values: number[]
  foreignCurrency?: string
  dates: Date[]
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
