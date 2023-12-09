import type { NextApiRequest, NextApiResponse } from 'next'
import { filterNull } from '../../../utils'
import { getDocumentSuggestions } from '../../../suggestions/documentSuggestions'
import { getBankSavingsSuggestions } from '../../../suggestions/bankSavingsSuggestions'
import { getTaxSuggestions } from '../../../suggestions/taxSuggestions'
import { getInsuranceSuggestions } from '../../../suggestions/insuranceSuggestions'
import { getAccountsReceivablePaidSuggestions } from '../../../suggestions/accountsReceivablePaidSuggestions'
import { JournalEntryUpsert } from '../../../../app/upsertJournalEntry'

export type Suggestion = JournalEntryUpsert & {
  options?: {
    foreignCurrency?: string
    values: number[]
    dates: Date[]
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Suggestion[]>,
) {
  if (req.method === 'GET') {
    const taxSuggestions = await getTaxSuggestions()
    const bankSavingsSuggestions = await getBankSavingsSuggestions()
    const documentSuggestions = await getDocumentSuggestions()
    const insuranceSuggestions = await getInsuranceSuggestions()
    const accountsReceivablePaidSuggestions =
      await getAccountsReceivablePaidSuggestions()

    res
      .status(200)
      .json(
        filterNull([
          ...taxSuggestions,
          ...bankSavingsSuggestions,
          ...documentSuggestions,
          ...insuranceSuggestions,
          ...accountsReceivablePaidSuggestions,
        ]),
      )
    return
  }

  res.status(405)
}
