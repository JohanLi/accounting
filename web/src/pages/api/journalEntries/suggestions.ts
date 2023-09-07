import type { NextApiRequest, NextApiResponse } from 'next'
import { JournalEntryUpsert } from '../journalEntries'
import { filterNull } from '../../../utils'
import { getDocumentSuggestions } from '../../../suggestions/documentSuggestions'
import { getBankSavingsSuggestions } from '../../../suggestions/bankSavingsSuggestions'
import { getTaxSuggestions } from '../../../suggestions/taxSuggestions'
import { getInsuranceSuggestions } from '../../../suggestions/insuranceSuggestions'

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

    res
      .status(200)
      .json(
        filterNull([
          ...taxSuggestions,
          ...bankSavingsSuggestions,
          ...documentSuggestions,
          ...insuranceSuggestions,
        ]),
      )
    return
  }

  res.status(405)
}
