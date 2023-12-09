import { filterNull } from '../src/utils'
import { getDocumentSuggestions } from '../src/suggestions/documentSuggestions'
import { getBankSavingsSuggestions } from '../src/suggestions/bankSavingsSuggestions'
import { getTaxSuggestions } from '../src/suggestions/taxSuggestions'
import { getInsuranceSuggestions } from '../src/suggestions/insuranceSuggestions'
import { getAccountsReceivablePaidSuggestions } from '../src/suggestions/accountsReceivablePaidSuggestions'
import { JournalEntryUpsert } from './upsertJournalEntry'

export type Suggestion = JournalEntryUpsert & {
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
