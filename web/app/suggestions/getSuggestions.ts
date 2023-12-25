import { filterNull } from '../utils'
import { getDocumentSuggestions } from './documentSuggestions'
import { getBankSavingsSuggestions } from './bankSavingsSuggestions'
import { getTaxSuggestions } from './taxSuggestions'
import { getInsuranceSuggestions } from './insuranceSuggestions'
import { getAccountsReceivablePaidSuggestions } from './accountsReceivablePaidSuggestions'
import { JournalEntryUpdate } from '../actions/updateJournalEntry'

export type Suggestion = JournalEntryUpdate & {
  options?: {
    foreignCurrency?: string
    values: number[]
    dates: Date[]
  }
}

export async function getSuggestions(): Promise<Suggestion[]> {
  const taxSuggestions = await getTaxSuggestions()
  const bankSavingsSuggestions = await getBankSavingsSuggestions()
  const documentSuggestions = await getDocumentSuggestions()
  const insuranceSuggestions = await getInsuranceSuggestions()
  const accountsReceivablePaidSuggestions =
    await getAccountsReceivablePaidSuggestions()

  return filterNull([
    ...taxSuggestions,
    ...bankSavingsSuggestions,
    ...documentSuggestions,
    ...insuranceSuggestions,
    ...accountsReceivablePaidSuggestions,
  ])
}
