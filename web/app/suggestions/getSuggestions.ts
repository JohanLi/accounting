import { Transaction } from '../getJournalEntries'
import { filterNull } from '../utils'
import { getAccountsReceivablePaidSuggestions } from './accountsReceivablePaidSuggestions'
import { getBankSavingsSuggestions } from './bankSavingsSuggestions'
import { getDocumentSuggestions } from './documentSuggestions'
import { getInsuranceSuggestions } from './insuranceSuggestions'
import { getTaxSuggestions } from './taxSuggestions'

export type Suggestions = {
  date: Date
  description: string
  transactions: Transaction[]
  linkedToTransactionIds: number[]
  documentId?: number
}

export async function getSuggestions(): Promise<Suggestions[]> {
  const taxSuggestions = await getTaxSuggestions()
  const bankSavingsSuggestions = await getBankSavingsSuggestions()

  const insuranceSuggestions = await getInsuranceSuggestions()
  const accountsReceivablePaidSuggestions =
    await getAccountsReceivablePaidSuggestions()

  const knownDocumentSuggestions =
    await getDocumentSuggestions()

  return filterNull([
    ...taxSuggestions,
    ...bankSavingsSuggestions,
    ...insuranceSuggestions,
    ...accountsReceivablePaidSuggestions,
    ...knownDocumentSuggestions,
  ])
}
